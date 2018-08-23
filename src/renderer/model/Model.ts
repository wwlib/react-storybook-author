import { EventEmitter } from "events";
import AppSettings from "./AppSettings";
import AppInfo from './AppInfo';
import WindowComponent from './WindowComponent';
import { appVersion } from './AppVersion';
import Book, { BookOptions } from './Book';
import Page, { PageOptions } from './Page';
import AudioManager from '../audio/AudioManager';
import BookManager, { BookDataList } from './BookManager';

// https://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
const aswCognitoConfig: any = require('../../../data/aws-cognito-config.json');


const uuidv4 = require('uuid/v4');
const now = require("performance-now");


let appSettingsDataTemplate: any = require('../../../data/settings-template.json');

export default class Model extends EventEmitter {

    public appSettings: AppSettings;
    public appInfo: AppInfo;
    public statusMessages: string;
    public panelZIndexMap: Map<string, number>;
    public activeBook: Book;
    public activeBookDataList: BookDataList | undefined;
    public activePage: Page;

    private _activeAuthToken: string;
    public poolData: any;
    public userPool: CognitoUserPool | undefined;
    public authToken: string;

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
            this.activeBookDataList = undefined;
            this.emit('ready', this);
        });

        // this.quiz = new Quiz();
        this.statusMessages = '';
        this.initCognito();
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
        this.activeBookDataList = undefined;
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

    //// AWS API

    initCognito(): void {
        if (!(aswCognitoConfig.cognito.userPoolId &&
            aswCognitoConfig.cognito.userPoolClientId &&
            aswCognitoConfig.cognito.region)) {
            console.log('Cognito user pool data incomplete!')
        } else {
            this.poolData = {
                UserPoolId: aswCognitoConfig.cognito.userPoolId,
                ClientId: aswCognitoConfig.cognito.userPoolClientId
            };
            this.userPool = new CognitoUserPool(this.poolData);
        }
    }

    createCognitoUser(email): CognitoUser | undefined {
        let cognitoUser: CognitoUser | undefined = undefined;
        if (this.userPool) {
            cognitoUser = new CognitoUser({
                Username: this.toUsername(email),
                Pool: this.userPool
            });
        }
        return cognitoUser;
    }

    toUsername(email) {
        return email.replace('@', '-at-');
    }

    signin(email: string, password: string, onSuccess: any, onFailure: any) {
        var authenticationDetails = new AuthenticationDetails({
            Username: this.toUsername(email),
            Password: password
        });

        var cognitoUser = this.createCognitoUser(email);
        if (cognitoUser) {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: onSuccess,
                onFailure: onFailure
            });
        }
    }

    signOut() {
        if (this.userPool) {
            let currentUser = this.userPool.getCurrentUser();
            if (currentUser) {
                currentUser.signOut();
            }
        }
    }

    login(username: string, password: string): Promise<BookDataList> {
        return new Promise<BookDataList>((resolve, reject) => {
            this.signin(username, password,
                () => {
                    console.log('Successfully Logged In');
                    this.getAuthToken().then((token: string) => {
                        if (token) {
                            console.log(token);
                            this.setActiveAuthToken(token);
                            this.retrieveBooklistFromCloudWithAuthor(token)
                                .then((bookDataList: BookDataList) => {
                                    resolve(bookDataList);
                                })
                                .catch(() => {
                                    reject();
                                })
                        }
                    });
                },
                (err) => { console.log(err), reject(err)}
            )
        })
    }

    retrieveBooklistFromCloudWithAuthor(authToken?: string, author?: string, ): Promise<BookDataList> {
        authToken = authToken || this._activeAuthToken;
        return new Promise<BookDataList>((resolve, reject) => {
            if (authToken) {
                BookManager.Instance().retrieveBooklistFromCloudWithAuthor(authToken, author)
                    .then((bookDataList: BookDataList) => {
                        console.log(`bookDataList: `, bookDataList);
                        if (bookDataList) {
                            this.activeBookDataList = bookDataList;
                        }
                        resolve(bookDataList);
                    })
                    .catch(() => {
                        reject();
                    })
            } else {
                reject();
            }
        })
    }

    retrieveBookFromCloudWithUUID(storybookId: string, version?:string): Promise<Book> {
        return new Promise<Book>((resolve, reject) => {
            BookManager.Instance().retrieveBookFromCloudWithUUID(this._activeAuthToken,storybookId, version)
                .then((result: any) => {
                    console.log(`Storybook: `, result, result.Storybook);
                    if (result.Storybook && result.Storybook.Data) {
                        let book:Book = new Book(result.Storybook.Data);
                        this.activeBook = book;
                        resolve(book);
                    } else {
                        reject();
                    }

                })
                .catch(() => {
                    reject();
                })
        })
    }

    getAuthToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.userPool) {
                var cognitoUser = this.userPool.getCurrentUser();
                if (cognitoUser) {
                    cognitoUser.getSession(function sessionCallback(err, session) {
                        if (err) {
                            reject(err);
                        } else if (!session.isValid()) {
                            resolve('');
                        } else {
                            resolve(session.getIdToken().getJwtToken());
                        }
                    });
                } else {
                    resolve('');
                }
            } else {
                resolve('');
            }
        });
    }

    setActiveAuthToken(token: string): void {
        this._activeAuthToken = token;
    }

    saveActiveBookToCloud(): void {
        console.log(this.activeBook.toJSON());
        BookManager.Instance().saveBookToCloud(this._activeAuthToken, this.activeBook);
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
