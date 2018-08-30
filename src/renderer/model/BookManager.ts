import fetch from 'node-fetch';
import Model from './Model';
import Book from './Book';
const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');
const ensureDir = require('ensureDir');

const aswCognitoConfig: any = require('../../../data/aws-cognito-config.json');

export type BookVersion = {
    id: string;
    timestamp: string;
    author: string;
}

export type BookData = {
    id: string;
    versions: BookVersion[];
}

export type BookDataList = {
    author: string;
    list: BookData[];
}

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

    /* save results
    Response:
    {
      "statusCode": 201,
      "body": "{\"storybookId\":\"abcd-efgh-ijkl-mnop\",\"author\":\"the_username\",\"timestamp\":\"2018-08-23T20:18:12.810Z\"}",
      "headers": {
        "Access-Control-Allow-Origin": "*"
      }
    }
    */
    saveBookToCloud(authToken: string, book: Book): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let path: string = aswCognitoConfig.api.invokeUrl + '/save';
            console.log(aswCognitoConfig, path);
            let headers: any = {
                Authorization: authToken
            }
            // console.log(book.toJSON());
            // console.log(JSON.stringify(book.toJSON(), null, 2));
            let body: any = JSON.stringify({ storybookId: book.uuid, data: book.toJSON() });
            // console.log(body);
            fetch(path, { method: 'POST', body: body, headers: headers })
                .then(res => resolve(res));
                // .then(res => res.json())
                // .then(json => console.log(json));
        });
    }

    /*
    Response:
    {
      "statusCode": 201,
      "body": "{\"author\":\"the_username\",\"versions\":[{\"storybookId\":\"abcd-efgh-ijkl-mnop\",\"timestamp\":\"2018-08-20T00:00:10.003Z\",\"author\":\"the_username\"},{\"storybookId\":\"abcd-efgh-ijkl-mnop\",\"timestamp\":\"2018-08-20T00:35:48.963Z\",\"author\":\"the_username\"},{\"storybookId\":\"abcd-efgh-ijkl-mnop\",\"timestamp\":\"2018-08-23T20:15:56.971Z\",\"author\":\"the_username\"},{\"storybookId\":\"abcd-efgh-ijkl-mnop\",\"timestamp\":\"2018-08-23T20:18:12.810Z\",\"author\":\"the_username\"},{\"storybookId\":\"abcd-efgh-ijkl-mnop\",\"timestamp\":\"2018-08-19T22:18:58.351Z\",\"author\":\"the_username\"},{\"storybookId\":\"abcd-efgh-ijkl-mnop\",\"timestamp\":\"2018-08-19T21:29:18.194Z\",\"author\":\"the_username\"}]}",
      "headers": {
        "Access-Control-Allow-Origin": "*"
      }
    }
    */
    retrieveBookFromCloudWithUUID(authToken: string, uuid: string, version?: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let path: string = aswCognitoConfig.api.invokeUrl + '/retrieve';
            let headers: any = {
                Authorization: authToken
            }
            let body: any = JSON.stringify({ storybookId: uuid, version: version });
            // console.log(body);
            fetch(path, { method: 'POST', body: body, headers: headers })
                // .then((res: any) => console.log(res))
                .then((res: any) => res.json())
                .then(json => resolve(json));
        });
    }

    /*
    {
      "statusCode": 201,
      "body": "{\"author\":\"the_username\",\"versions\":[{\"storybookId\":\"abcd-efgh-ijkl-mnop\",\"timestamp\":\"2018-08-20T00:00:10.003Z\",\"author\":\"the_username\"},{\"storybookId\":\"abcd-efgh-ijkl-mnop\",\"timestamp\":\"2018-08-20T00:35:48.963Z\",\"author\":\"the_username\"},{\"storybookId\":\"abcd-efgh-ijkl-mnop\",\"timestamp\":\"2018-08-23T20:15:56.971Z\",\"author\":\"the_username\"},{\"storybookId\":\"abcd-efgh-ijkl-mnop\",\"timestamp\":\"2018-08-23T20:18:12.810Z\",\"author\":\"the_username\"},{\"storybookId\":\"abcd-efgh-ijkl-mnop\",\"timestamp\":\"2018-08-19T22:18:58.351Z\",\"author\":\"the_username\"},{\"storybookId\":\"abcd-efgh-ijkl-mnop\",\"timestamp\":\"2018-08-19T21:29:18.194Z\",\"author\":\"the_username\"}]}",
      "headers": {
        "Access-Control-Allow-Origin": "*"
      }
    }
    */
    retrieveBooklistFromCloudWithAuthor(authToken: string, author?: string): Promise<BookDataList> {
        return new Promise<BookDataList>((resolve, reject) => {
            let path: string = aswCognitoConfig.api.invokeUrl + '/storybooklist';
            let headers: any = {
                Authorization: authToken
            }
            let body: any = JSON.stringify({ author:author });
            // console.log(body);
            fetch(path, { method: 'POST', body: body, headers: headers })
                // .then((res: any) => console.log(res))
                .then((res: any) => res.json())
                .then(json => {
                    resolve(this.parseBookList(json));
                })
        })
    }

    parseBookList(data: any): BookDataList | undefined {
        let result: BookDataList = {
            author: '',
            list: []
        }
        if (data && data.author && data.versions) {
            let books: Map<string, BookVersion[]> = new  Map<string, BookVersion[]>();
            result.author = data.author;
            data.versions.forEach((versionData: any) => {
                if (versionData.storybookId && versionData.timestamp) {
                    let version: BookVersion = {
                        id: versionData.storybookId,
                        timestamp: versionData.timestamp,
                        author: versionData.author
                    }
                    let versionList: BookVersion[] | undefined = books.get(version.id);
                    if (!versionList) {
                        versionList = []
                    }
                    versionList.push(version)
                    books.set(version.id, versionList)
                }
            });
            let bookIds: string[] = Array.from(books.keys());
            bookIds.forEach((id: string) => {
                let versions: BookVersion[] | undefined =  books.get(id);
                if (versions) {
                    let bookData: BookData = {
                        id: id,
                        versions: versions
                    }
                    result.list.push(bookData);
                }

            })
            return result;
        } else {
            return undefined;
        }
    }
}
