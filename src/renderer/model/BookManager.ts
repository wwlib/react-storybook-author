import fetch from 'node-fetch';
import Model from './Model';
import Book from './Book';
const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');
const ensureDir = require('ensureDir');

const aswCognitoConfig: any = require('../../../data/aws-cognito-config.json');

export type BookManagerOptions = {
    userDataPath?: string;
}

export default class BookManager {

    private static _instance: BookManager;

    public bookNames: Map<string, string>;
    public userDataPath: string | undefined;

    constructor(options?: BookManagerOptions) {
        options = options || {};
        let defaultOptions: BookManagerOptions =  {
            userDataPath: './'
        }
        options = Object.assign(defaultOptions, options);
        this.userDataPath = options.userDataPath;

        this.bookNames = new  Map<string, string>();
    }

    static Instance(options?: BookManagerOptions)
    {
        return this._instance || (this._instance = new this(options));
    }

    addBook(book: Book): Book {
        this.bookNames.set(book.filename, book.title);
        return book;
    }

    getBookNames(): string[] {
        return Array.from( this.bookNames.keys() );
    }

    loadBookNames(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let userDataPath: string = path.resolve(this.userDataPath);
            ensureDir(path.resolve(this.userDataPath), 0o755, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    fs.readdir(userDataPath, (err: any, files: any) => {
                        if (err) {
                            console.log(`loadBookNames: error reading files in: ${userDataPath}`);
                            reject(err);
                        } else {
                            files.forEach((file: string) => {
                                let filename: string = path.basename(file, '.json');
                                    // console.log(`loadBookNames: adding: ${file} -> ${filename}`);
                                    this.bookNames.set(filename, '');
                                    // let filepath: string = path.resolve(this.model.userDataPath, file);
                                    // this.load(filepath, (err: any, obj: any) => {
                                    //     if (err) {
                                    //         console.log(`loadBookNames: error loading: ${filepath}`);
                                    //     } else {
                                    //         console.log(`loadBookNames: setting connection: ${filename}: ${obj.connection}`);
                                    //         this.bookNames.set(filename, obj.connection);
                                    //     }
                                    // });
                            });
                            resolve()
                        }
                    });
                }
            });
        })
    }

    removeBookName(name: string): void {
        this.bookNames.delete(name);
    }

    deleteBook(book: Book): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let filepath: string =  this.generateFilepathWithName(book.filename);
            fs.unlink(filepath, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    this.removeBookName(book.filename);
                    resolve();
                }
            });
        });
    }

    saveBook(book: Book):  Promise<Book> {
        return new Promise<Book>((resolve, reject) => {
            let json: any = book.toJSON();
            ensureDir(path.resolve(this.userDataPath), 0o755, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    let filepath: string =  this.generateFilepathWithName(book.filename);
                    this.save(filepath, json, (err: any) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(book);
                        }
                    });
                }
            });
        });
    }

    loadBookWithPath(filepath: string):  Promise<Book> {
        return new Promise<Book>((resolve, reject) => {
            let resolvedFilepath: string =  path.resolve(filepath);
            // console.log(`resolvedFilepath: `, resolvedFilepath)
            this.load(resolvedFilepath, (err: any, data: any) => {
                if (err) {
                    reject(err);
                } else {
                    let book: Book = new Book();
                    book.initWithJson(data);
                    resolve(book)
                }
            });
        });
    }

    loadBookWithName(name: string):  Promise<Book> {
        return new Promise<Book>((resolve, reject) => {
            let filepath: string =  this.generateFilepathWithName(name);
            this.load(filepath, (err: any, data: any) => {
                if (err) {
                    reject(err);
                } else {
                    let book: Book = new Book();
                    book.initWithJson(data);
                    resolve(book)
                }
            });
        });
    }

    generateFilepathWithName(name: string): string {
        return path.resolve(this.userDataPath, `${name}.json`);
    }

    load(filepath: string, cb: any){
        jsonfile.readFile(filepath, (err: any, obj: any) => {
            if (err) {
                cb(err);
            } else {
                cb(err, obj);
            }
        });
    }

    save(filepath: string, data: any, cb: any){
        let timestamp = new Date().getTime();
        data.timestamp = timestamp;
        jsonfile.writeFile(filepath, data, {spaces: 2}, (err: any) => {
            if (err) {
                cb(err);
            } else {
                cb(null);
            }
      });
    }

    //// AWS API

    // {
    //   "path": "/save",
    //   "httpMethod": "POST",
    //   "headers": {
    //     "Accept": "*/*",
    //     "Authorization": "eyJraWQiOiJLTzRVMWZs",
    //     "content-type": "application/json; charset=UTF-8"
    //   },
    //   "queryStringParameters": null,
    //   "pathParameters": null,
    //   "requestContext": {
    //     "authorizer": {
    //       "claims": {
    //         "cognito:username": "the_username"
    //       }
    //     }
    //   },
    //   "body": "{ \"storybookId\": \"abcd-efgh-ijkl-mnop\", \"data\": { \"pageCount\": 1 } }"
    // }

    // $.ajax({
    //     method: 'POST',
    //     url: _config.api.invokeUrl + '/save',
    //     headers: {
    //         Authorization: authToken
    //     },
    //     data: JSON.stringify({
    //         storybookId: "qrst-uvwx-yz12-3456", data: { "pageCount": 3 }
    //     }),
    //     contentType: 'application/json',
    //     success: completeRequest,
    //     error: function ajaxError(jqXHR, textStatus, errorThrown) {
    //         console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
    //         console.error('Response: ', jqXHR.responseText);
    //         alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
    //     }
    // });

    saveBookToCloud(authToken: string, book: Book): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let path: string = aswCognitoConfig.api.invokeUrl + '/save';
            console.log(aswCognitoConfig, path);
            let headers: any = {
                Authorization: authToken
            }
            console.log(book.toJSON());
            console.log(JSON.stringify(book.toJSON(), null, 2));
            let body: any = JSON.stringify({ storybookId: book.uuid, data: book.toJSON() });
            console.log(body);
            fetch(path, { method: 'POST', body: body, headers: headers })
                .then(res => resolve(res));
                // .then(res => res.json())
                // .then(json => console.log(json));
        });
    }

    retrieveBookFromCloudWithUUID(authToken: string, uuid: string, version?: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let path: string = aswCognitoConfig.api.invokeUrl + '/retrieve';
            let headers: any = {
                Authorization: authToken
            }
            let body: any = JSON.stringify({ storybookId: uuid, version: version });
            console.log(body);
            fetch(path, { method: 'POST', body: body, headers: headers })
                // .then((res: any) => console.log(res))
                .then((res: any) => res.json())
                .then(json => resolve(json));
        });
    }

    retrieveBooklistFromCloudWithUsername(authToken: string, username?: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let path: string = aswCognitoConfig.api.invokeUrl + '/storybooklist';
            let headers: any = {
                Authorization: authToken
            }
            let body: any = JSON.stringify({ author:username });
            console.log(body);
            fetch(path, { method: 'POST', body: body, headers: headers })
                // .then((res: any) => console.log(res))
                .then((res: any) => res.json())
                .then(json => resolve(json));
        })
    }

}
