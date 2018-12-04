const path = require('path');
import { EventEmitter } from "events";
const ensureDir = require('ensureDir');
const osenv = require('osenv');
const jsonfile = require('jsonfile');

let configPath = path.resolve(osenv.home(), ".storybookauthor");
let configFile = path.resolve(configPath, "storybookauthor.json");

export interface AppSettingsOptions {
    nluDialogflow_projectId?: string;
    nluDialogflow_privateKey?: string;
    nluDialogflow_clientEmail?: string;
    timestamp?: number;
}

export default class AppSettings extends EventEmitter {

    public nluDialogflow_projectId: string = '';
    public nluDialogflow_privateKey: string = '';
    public nluDialogflow_clientEmail: string = '';

    private _timestamp: number = 0;

    constructor(options?: AppSettingsOptions) {
        super();
        this.initWithData(options);
    }

    static get userDataPath(): string {
        return path.resolve(configPath, "user");
    }

    static get userAudioDataPath(): string {
        return path.resolve(configPath, "user/audio");
    }

    static get userBookDataPath(): string {
        return path.resolve(configPath, "user/book");
    }

    initWithData(options?: AppSettingsOptions): void {
        options = options || {};
        let defaultOptions: AppSettingsOptions =  {
            nluDialogflow_projectId: '',
            nluDialogflow_privateKey: '',
            nluDialogflow_clientEmail: '',
            timestamp: 0
        }
        options = Object.assign(defaultOptions, options);

        console.log(`AppSettings: initWithData: `, options);
        this.nluDialogflow_projectId = options.nluDialogflow_projectId || '';
        this.nluDialogflow_privateKey = options.nluDialogflow_privateKey || '';
        this.nluDialogflow_clientEmail = options.nluDialogflow_clientEmail || '';
        this._timestamp = options.timestamp || 0;
    }

    get json(): any {
        let json: any = {
            nluDialogflow_projectId: this.nluDialogflow_projectId,
            nluDialogflow_privateKey: this.nluDialogflow_privateKey,
            nluDialogflow_clientEmail: this.nluDialogflow_clientEmail,
        };
        return json;
    }

    get timestamp(): number {
        return this._timestamp;
    }

    load(cb: any){
        ensureDir(path.resolve(configPath), 0o755, (err: any) => {
            if (err) {
                console.log(`error: ${configPath} cannot be found`)
            } else {
                jsonfile.readFile(configFile, (err: any, obj: any) => {
                    if (err) {
                        cb(err);
                    } else {
                        this.initWithData(obj);
                        this._timestamp = obj.timestamp;
                        cb(err, obj);
                    }
                });
            }
        });
    }

    save(cb: any){
        this._timestamp = new Date().getTime();
        ensureDir(path.resolve(configPath), 0o755, (err: any) => {
            if (err) {
                console.log(`error: ${configPath} cannot be found`)
            } else {
                jsonfile.writeFile(configFile, this.json, {spaces: 2}, (err: any) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null);
                    }
                });
            }
        });
    }
}
