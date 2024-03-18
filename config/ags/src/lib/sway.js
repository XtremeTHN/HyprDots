import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Service from 'resource:///com/github/Aylur/ags/service.js';
const SIS = GLib.getenv('SWAYSOCK');
export class SwayActiveClient extends Service {
    static {
        Service.register(this, {}, {
            'id': ['int'],
            'name': ['string'],
            'class': ['string'],
        });
    }
    _id = 0;
    _name = '';
    _class = '';
    get id() { return this._id; }
    get name() { return this._name; }
    get class() { return this._class; }
    updateProperty(prop, value) {
        super.updateProperty(prop, value);
        this.emit('changed');
    }
}
export class SwayActiveID extends Service {
    static {
        Service.register(this, {}, {
            'id': ['int'],
            'name': ['string'],
        });
    }
    _id = 0;
    _name = '';
    get id() { return this._id; }
    get name() { return this._name; }
    update(id, name) {
        super.updateProperty('id', id);
        super.updateProperty('name', name);
        this.emit('changed');
    }
}
export class SwayActives extends Service {
    static {
        Service.register(this, {}, {
            'client': ['jsobject'],
            'monitor': ['jsobject'],
            'workspace': ['jsobject'],
        });
    }
    _client = new SwayActiveClient;
    _monitor = new SwayActiveID;
    _workspace = new SwayActiveID;
    constructor() {
        super();
        ['client', 'workspace', 'monitor'].forEach(obj => {
            this[`_${obj}`].connect('changed', () => {
                this.notify(obj);
                this.emit('changed');
            });
        });
    }
    get client() { return this._client; }
    get monitor() { return this._monitor; }
    get workspace() { return this._workspace; }
}
export class Sway extends Service {
    static {
        Service.register(this, {}, {
            'active': ['jsobject'],
            'monitors': ['jsobject'],
            'workspaces': ['jsobject'],
            'clients': ['jsobject'],
        });
    }
    _decoder = new TextDecoder();
    _encoder = new TextEncoder();
    _socket;
    _active;
    _monitors;
    _workspaces;
    _clients;
    get active() { return this._active; }
    get monitors() { return Array.from(this._monitors.values()); }
    get workspaces() { return Array.from(this._workspaces.values()); }
    get clients() { return Array.from(this._clients.values()); }
    getMonitor(id) { return this._monitors.get(id); }
    getWorkspace(name) { return this._workspaces.get(name); }
    getClient(id) { return this._clients.get(id); }
    msg(payload) { this._send(0 /* PAYLOAD_TYPE.MESSAGE_RUN_COMMAND */, payload); }
    constructor() {
        if (!SIS)
            console.error('Sway is not running');
        super();
        this._active = new SwayActives();
        this._monitors = new Map();
        this._workspaces = new Map();
        this._clients = new Map();
        this._socket = new Gio.SocketClient().connect(new Gio.UnixSocketAddress({
            path: `${SIS}`,
        }), null);
        this._watchSocket(this._socket.get_input_stream());
        this._send(4 /* PAYLOAD_TYPE.MESSAGE_GET_TREE */, '');
        this._send(2 /* PAYLOAD_TYPE.MESSAGE_SUBSCRIBE */, JSON.stringify(['window', 'workspace']));
        this._active.connect('changed', () => this.emit('changed'));
        ['monitor', 'workspace', 'client'].forEach(active => this._active.connect(`notify::${active}`, () => this.notify('active')));
    }
    _send(payloadType, payload) {
        const pb = this._encoder.encode(payload);
        const type = new Uint32Array([payloadType]);
        const pl = new Uint32Array([pb.length]);
        const magic_string = this._encoder.encode('i3-ipc');
        const data = new Uint8Array([
            ...magic_string,
            ...(new Uint8Array(pl.buffer)),
            ...(new Uint8Array(type.buffer)),
            ...pb
        ]);
        this._socket.get_output_stream().write(data, null);
    }
    _watchSocket(stream) {
        stream.read_bytes_async(14, GLib.PRIORITY_DEFAULT, null, (_, resultHeader) => {
            const data = stream.read_bytes_finish(resultHeader).get_data();
            if (!data)
                return;
            const payloadLength = new Uint32Array(data.slice(6, 10).buffer)[0];
            const payloadType = new Uint32Array(data.slice(10, 14).buffer)[0];
            stream.read_bytes_async(payloadLength, GLib.PRIORITY_DEFAULT, null, (_, resultPayload) => {
                const data = stream.read_bytes_finish(resultPayload).get_data();
                if (!data)
                    return;
                this._onEvent(payloadType, JSON.parse(this._decoder.decode(data)));
                this._watchSocket(stream);
            });
        });
    }
    async _onEvent(event_type, event) {
        if (!event)
            return;
        try {
            switch (event_type) {
                case 2147483648 /* PAYLOAD_TYPE.EVENT_WORKSPACE */:
                    this._handleWorkspaceEvent(event);
                    break;
                case 2147483651 /* PAYLOAD_TYPE.EVENT_WINDOW */:
                    this._handleWindowEvent(event);
                    break;
                case 4 /* PAYLOAD_TYPE.MESSAGE_GET_TREE */:
                    this._handleTreeMessage(event);
                    break;
                default:
                    break;
            }
        }
        catch (error) {
            logError(error);
        }
        this.emit('changed');
    }
    _handleWorkspaceEvent(workspaceEvent) {
        const workspace = workspaceEvent.current;
        switch (workspaceEvent.change) {
            case 'init':
                this._workspaces.set(workspace.name, workspace);
                break;
            case 'empty':
                this._workspaces.delete(workspace.name);
                break;
            case 'focus':
                this._active.workspace.update(workspace.id, workspace.name);
                this._active.monitor.update(1, workspace.output);
                this._workspaces.set(workspace.name, workspace);
                this._workspaces.set(workspaceEvent.old.name, workspaceEvent.old);
                break;
            case 'rename':
                if (this._active.workspace.id === workspace.id)
                    this._active.workspace.updateProperty('name', workspace.name);
                this._workspaces.set(workspace.name, workspace);
                break;
            case 'reload':
                break;
            case 'move':
            case 'urgent':
            default:
                this._workspaces.set(workspace.name, workspace);
        }
        this.notify('workspaces');
    }
    _handleWindowEvent(clientEvent) {
        const client = clientEvent.container;
        const id = client.id;
        switch (clientEvent.change) {
            case 'new':
            case 'close':
            case 'floating':
            case 'move':
                // Refresh tree since client events don't contain the relevant information
                // to be able to modify `workspace.nodes` or `workspace.floating_nodes`.
                // There has to be a better way than this though :/
                this._send(4 /* PAYLOAD_TYPE.MESSAGE_GET_TREE */, '');
                break;
            case 'focus':
                if (this._active.client.id === id)
                    return;
                // eslint-disable-next-line no-case-declarations
                const current_active = this._clients.get(this._active.client.id);
                if (current_active)
                    current_active.focused = false;
                this._active.client.updateProperty('id', id);
                this._active.client.updateProperty('name', client.name);
                this._active.client.updateProperty('class', client.shell === 'xwayland'
                    ? client.window_properties?.class || ''
                    : client.app_id);
                break;
            case 'title':
                if (client.focused)
                    this._active.client.updateProperty('name', client.name);
                this._clients.set(id, client);
                this.notify('clients');
                break;
            case 'fullscreen_mode':
            case 'urgent':
            case 'mark':
            default:
                this._clients.set(id, client);
                this.notify('clients');
        }
    }
    _handleTreeMessage(node) {
        switch (node.type) {
            case 'root':
                this._workspaces.clear();
                this._clients.clear();
                this._monitors.clear();
                node.nodes.map(n => this._handleTreeMessage(n));
                break;
            case 'output':
                this._monitors.set(node.id, node);
                if (node.active)
                    this._active.monitor.update(node.id, node.name);
                node.nodes.map(n => this._handleTreeMessage(n));
                this.notify('monitors');
                break;
            case 'workspace':
                this._workspaces.set(node.name, node);
                // I think I'm missing something. There has to be a better way.
                // eslint-disable-next-line no-case-declarations
                const hasFocusedChild = (n) => n.nodes.some(c => c.focused || hasFocusedChild(c));
                if (node.focused || hasFocusedChild(node))
                    this._active.workspace.update(node.id, node.name);
                node.nodes.map(n => this._handleTreeMessage(n));
                this.notify('workspaces');
                break;
            case 'con':
            case 'floating_con':
                this._clients.set(node.id, node);
                if (node.focused) {
                    this._active.client.updateProperty('id', node.id);
                    this._active.client.updateProperty('name', node.name);
                    this._active.client.updateProperty('class', node.shell === 'xwayland'
                        ? node.window_properties?.class || ''
                        : node.app_id);
                }
                node.nodes.map(n => this._handleTreeMessage(n));
                this.notify('clients');
                break;
        }
    }
}
export const sway = new Sway;
export default sway;
