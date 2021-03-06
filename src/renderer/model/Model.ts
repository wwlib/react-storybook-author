import { EventEmitter } from "events";
import AppSettings from "./AppSettings";
import WindowComponent from './WindowComponent';
import { appVersion } from './AppVersion';
import Book from './Book';
import Page from './Page';
import AudioManager, { AudioFileInfo } from '../audio/AudioManager';
import BookManager, { BookDataList } from './BookManager';

const toBuffer = require('blob-to-buffer');

// https://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
const aswCognitoConfig: any = require('../../../data/aws-cognito-config.json');


const uuidv4 = require('uuid/v4');
const now = require("performance-now");


let appSettingsDataTemplate: any = require('../../../data/settings-template.json');

export default class Model extends EventEmitter {

    public appSettings: AppSettings;
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
        this.statusMessages = '';
        this.initCognito();
        BookManager.Instance({ userBookDataPath: AppSettings.userBookDataPath });
        AudioManager.Instance({ userAudioDataPath: AppSettings.userAudioDataPath });
        this.appSettings.load((err: any, obj: any) => {
            if (err) {
                console.log(`Model: AppSettings not found. Using defaults.`);
            }
            this.newBook();
            this.emit('ready', this);
        });
    }

    get appVerison(): string {
        return appVersion;
    }

    saveAppSettings(): void {
        this.appSettings.save((err: any) => {
            if (err) {
                console.log(`Model: Error saving appSettings: `, err);
            }
        });
    }

    reloadAppSettings(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.appSettings.load((err: any, obj: any) => {
                if (err) {
                    console.log(`Model: Error reloading AppSettings.`);
                    reject(`Model: Error reloading AppSettings.`);
                } else {
                    this.emit('updateModel', this);
                    resolve(obj);
                }
            });
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

    endRecord(): Promise<AudioFileInfo> {
        return AudioManager.Instance().endRecord();
    }

    onAudioFileSaved(audioFileInfo: AudioFileInfo): void {
        console.log(`onAudioFileSaved: `, audioFileInfo, this.activePage);
        if (this.activePage) {
            this.activePage.audio = audioFileInfo.filename;
            toBuffer(audioFileInfo.blob, (err, buffer) => {
                if (err) throw err
                let base64data = buffer.toString('base64');
                this.activePage.audio = 'data:audio/wav;base64,' + base64data;
            });
        }
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

    newBook(options?: any): Book {
        this.activeBook = new Book(options);
        this.addNewPage();
        this.activeBookDataList = undefined;
        return this.activeBook;
    }

    addNewPage(options?: any): Page | undefined {
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
        if (this.activeBook && page && (page.pageNumber != 0)) {
            result = this.activePage = this.activeBook.deletePage(page);
        }
        return result;
    }

    selectPage(page: Page): void {
        if (page) {
            this.activePage = page;
        } else {
            console.log(`error: cannot select undefined page`)
        }

    }

    //// Filesystem API

    loadBooklistFromFilesystem(): Promise<BookDataList> {
        return BookManager.Instance().loadBookData();
    }

    loadBookFromFilesystemWithUUID(uuid: string, version: string): Promise<Book> {
        return new Promise<Book>((resolve, reject) => {
            BookManager.Instance().loadBookWithFilename(`${uuid};${version}.json`)
                .then((book: Book) => {
                    console.log(`loadBookFromFilesystemWithUUID: book: `, book);
                    this.activeBook = book;
                    this.activePage = this.activeBook.pageArray[this.activeBook.currentPageNumber];
                    this.activeBookDataList = undefined;
                    resolve(book);
                })
                .catch((err: any) => {
                    reject(err);
                })
        })
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
                    console.log(`retrieveBookFromCloudWithUUID: result: `, result);
                    if (result.storybookRecord && result.storybookRecord.Data) {
                        let book:Book = new Book(result.storybookRecord.Data);
                        this.activeBook = book;
                        this.activePage = this.activeBook.pageArray[this.activeBook.currentPageNumber];
                        this.activeBookDataList = undefined;
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
        BookManager.Instance().saveBookToCloud(this._activeAuthToken, this.activeBook)
            .then((res: any) => {
                console.log(`book saved to cloud: `, res);
            })
    }

    saveActiveBookToFilesystem(): void {
        console.log(this.activeBook.toJSON());
        BookManager.Instance().saveBook(this.activeBook)
            .then((book: Book) => {
                console.log(`book saved to filesystem: `, book);
            })
    }

    static getUUID(): string {
        return uuidv4();
    }

    dispose(): void {
        appSettingsDataTemplate = null;
        delete(this.appSettings);// = null;
    }
}
