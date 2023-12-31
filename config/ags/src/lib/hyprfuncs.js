import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Gtk from 'gi://Gtk?version=3.0';

export const Workspaces = (obj) => Widget.Box({
  class_name: 'topbar-workspaces',
  spacing: 5,
  children: Array.from({ length: 10 }, (_,i) => i +1).map(i=> Widget.EventBox({
    setup: btn => {
      btn.id = i
    },
    child: Widget.Box({
      class_name: "topbar-workspaces-button-circle",
    })
  })),
  connections: [
    [Hyprland, self => self.children.forEach(btn => {
            const workspaces = Hyprland.workspaces;
            const current_ws = Hyprland.active.workspace.id;
            // @ts-ignore
            btn.visible = workspaces.some(ws => ws.id === btn.id);
            // @ts-ignore
            btn.child.toggleClassName('active', current_ws === btn.id);
    })],
  ]
})
