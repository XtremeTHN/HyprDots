import * as Exec from './utils/exec.js';
import * as File from './utils/file.js';
import * as Etc from './utils/etc.js';
import * as Timeout from './utils/timeout.js';
import * as Fetch from './utils/fetch.js';
export declare const USER: string;
export declare const CACHE_DIR: string;
export declare const exec: typeof Exec.exec;
export declare const execAsync: typeof Exec.execAsync;
export declare const subprocess: typeof Exec.subprocess;
export declare const readFile: typeof File.readFile;
export declare const readFileAsync: typeof File.readFileAsync;
export declare const writeFile: typeof File.writeFile;
export declare const monitorFile: typeof File.monitorFile;
export declare const timeout: typeof Timeout.timeout;
export declare const interval: typeof Timeout.interval;
export declare const idle: typeof Timeout.idle;
export declare const loadInterfaceXML: typeof Etc.loadInterfaceXML;
export declare const bulkConnect: typeof Etc.bulkConnect;
export declare const bulkDisconnect: typeof Etc.bulkDisconnect;
export declare const ensureDirectory: typeof Etc.ensureDirectory;
export declare const lookUpIcon: typeof Etc.lookUpIcon;
export declare const fetch: typeof Fetch.fetch;
declare const _default: {
    exec: typeof Exec.exec;
    execAsync: typeof Exec.execAsync;
    subprocess: typeof Exec.subprocess;
    readFile: typeof File.readFile;
    readFileAsync: typeof File.readFileAsync;
    writeFile: typeof File.writeFile;
    monitorFile: typeof File.monitorFile;
    timeout: typeof Timeout.timeout;
    interval: typeof Timeout.interval;
    idle: typeof Timeout.idle;
    loadInterfaceXML: typeof Etc.loadInterfaceXML;
    bulkConnect: typeof Etc.bulkConnect;
    bulkDisconnect: typeof Etc.bulkDisconnect;
    ensureDirectory: typeof Etc.ensureDirectory;
    lookUpIcon: typeof Etc.lookUpIcon;
    fetch: typeof Fetch.fetch;
};
export default _default;
