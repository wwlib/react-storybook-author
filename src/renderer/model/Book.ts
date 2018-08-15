import Model from './Model';
import Page, { PageData } from './Page';

export type BookConfig = any;

export type BookData = {
    uuid?: string;
    filename?: string;
    title?: string;
    currentPageNumber?: number
    css?: string;
    config?: BookConfig;
    pages?: Page[];
}

export default class Book {

    public uuid: string;
    public filename: string;
    public title: string = '';
    public currentPageNumber = 0;
    public css: string = '';
    public config: BookConfig;
    public pages: Map<string, Page>;

    constructor(json?: any) {
        json = json || {};
        let defaultJSON: BookData =  {
            uuid: Model.getUUID(),
            filename: 'untitled',
            title: '',
            currentPageNumber: 0,
            css: '',
            config: undefined,
            pages: []
        }
        json = Object.assign(defaultJSON, json);
        this.initWithJson(json);
    }

    initWithJson(json?: any): Book {
        json = json || {};
        this.uuid = json.uuid || Model.getUUID();
        this.filename = json.filename || '<filename>';
        this.title = json.title || '<title>';
        this.currentPageNumber = 0;
        this.css = json.css || '';
        this.pages = new Map<string, Page>();
        if (json.pages) {
            json.pages.forEach(pageData => {
                let page: Page = new Page(pageData);
                this.pages.set(page.uuid, page);
            });
        }
        return this;
    }

    toJSON(): any {
        let json: any = {};
        json.uuid = this.uuid;
        json.filename = this.filename;
        json.title = this.title;
        json.currentPageNumber = this.currentPageNumber;
        json.css = this.css;
        json.config = this.config;
        json.pages = [];
        this.pages.forEach((page: Page) => {
            json.pages.push(page.toJSON());
        })

        return json;
    }

    addNewPage(options?: PageData): Page {
        let page: Page = new Page(options);
        this.pages.set(page.uuid, page);
        return page;
    }

    get pageCount(): number {
        let pageCount: number = 0;
        if (this.pages) {
            pageCount = this.pages.size;
        }
        return pageCount;
    }

    get pageArray(): Page[] {
        let pageArray: Page[] = Array.from(this.pages.values());
        pageArray.sort((a: Page, b: Page) => {return a.pageNumber - b.pageNumber});
        return pageArray;
    }

    get type() {
        return 'storybook';
    }
}
