import { EventEmitter } from "events";
import AppSettings from "./AppSettings";
import AppInfo from './AppInfo';
import WindowComponent from './WindowComponent';
import { appVersion } from './AppVersion';
import Book, { BookOptions } from './Book';
import Page, { PageOptions } from './Page';
import AudioManager from '../audio/AudioManager';

const uuidv4 = require('uuid/v4');
const now = require("performance-now");


let appSettingsDataTemplate: any = require('../../../data/settings-template.json');

export default class Model extends EventEmitter {

    public appSettings: AppSettings;
    public appInfo: AppInfo;
    public statusMessages: string;
    public panelZIndexMap: Map<string, number>;
    public activeBook: Book;
    public activePage: Page;

    constructor() {
        super();
        this.appSettings = new AppSettings();
        this.panelZIndexMap = new Map<string, number>();
        this.appSettings.load((err: any, obj: any) => {
            if (err || !this.appSettings.data) {
                console.log(`Model: AppSettings not found. Using template.`);
                this.appSettings.data = appSettingsDataTemplate;
                this.initWithData(this.appSettings.data);
                this.saveAppSettings();
            } else {
                this.initWithData(this.appSettings.data);

            }
            AudioManager.Instance({ userDataPath: this.userDataPath });
            this.activeBook = new Book();
            this.emit('ready', this);
        });

        // this.quiz = new Quiz();
        this.statusMessages = '';
    }

    initWithData(data: any): void {
        this.appInfo = new AppInfo();
        this.appInfo.initWithData(data.appInfo);
    }

    get appVerison(): string {
        return appVersion;
    }

    get json(): any {
        let result: any = {}
        result.timestamp = 0;
        result.appInfo = this.appInfo.json;
        return result;
    }

    get userDataPath(): string {
        return AppSettings.DEFAULT_USER_DATA_PATH;
    }

    saveAppSettings(): void {
        console.log(`saveAppSettings: `, this.json);
        this.appSettings.data = this.json;
        this.appSettings.save((err: any) => {
            if (err) {
                console.log(`Model: Error saving appSettings: `, err);
            }
        });
    }

    reloadAppSettings(): void {
        this.appSettings.load((err: any, obj: any) => {
            if (err || !this.appSettings.data) {
                console.log(`Model: AppSettings not found. Using template.`);
                this.appSettings.data = appSettingsDataTemplate;
                this.initWithData(this.appSettings.data);
            } else {
                this.initWithData(this.appSettings.data);
            }

            this.emit('updateModel', this);
        });
    }

    updateAppStatusMessages(message: string, subsystem?: string, clearMessages: boolean = false): string {
        subsystem = subsystem || '';
        if (clearMessages) {
            this.statusMessages = '';
        }
        this.statusMessages = `${subsystem}: ${this.statusMessages}\n${message}`;
        this.onUpdate();
        return this.statusMessages;
    }

    onUpdate(): void {
        this.emit('updateModel');
    }

    // Audio audioController

    startRecord(): void {
        AudioManager.Instance().startRecord();
    }

    endRecord() {
        AudioManager.Instance().endRecord();
    }

    // Window Management

    getPanelOpenedWithId(panelId: string): boolean {
        let result: boolean = false;
        let window: WindowComponent | undefined = WindowComponent.getWindowComponentWithId(panelId);
        if (window) {
            result = window.opened;
        }
        return result;
    }

    togglePanelOpenedWithId(panelId: string): boolean {
        let window: WindowComponent | undefined = WindowComponent.getWindowComponentWithId(panelId);
        if (!window) {
            return true; // open the panel if it is not yet instantiated
        } else {
            return window.toggleOpened();
        }
    }

    openPanelWithId(panelId: string): void {
        WindowComponent.openWithId(panelId);
    }

    closePanelWithId(panelId: string): void {
        WindowComponent.closeWithId(panelId);
    }

    bringPanelToFront(panelId: string): void {
        WindowComponent.addWindowWithId(panelId);
        WindowComponent.bringWindowToFrontWithId(panelId);
    }

    addPanelWithId(panelId: string, x: number = 0, y: number = 0, z: number = 0): void {
        WindowComponent.addWindowWithId(panelId, x, y, z);
    }

    // Book & Page API

    newBook(options?: BookOptions): Book {
        this.activeBook = new Book(options);
        return this.activeBook;
    }

    addNewPage(options?: PageOptions): Page | undefined {
        let result: Page | undefined = undefined;
        if (this.activeBook) {
            result = this.activePage = this.activeBook.addNewPage();
            this.onUpdate();
            console.log(`addPage: `, this.activeBook.toJSON());
        }
        return result;
    }

    deletePage(page?: Page): Page | undefined {
        page = page || this.activePage;
        let result: Page | undefined = undefined;
        if (this.activeBook && page) {
            result = this.activePage = this.activeBook.deletePage(page);
        }
        return result;
    }

    selectPage(page: Page): void {
        this.activePage = page;
    }

    static getUUID(): string {
        return uuidv4();
    }

    dispose(): void {
        appSettingsDataTemplate = null;
        delete(this.appSettings);// = null;
        delete(this.appInfo);// = null;
    }
}
