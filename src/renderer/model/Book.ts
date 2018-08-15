import Model from './Model';
import Page, { PageOptions } from './Page';

export type BookConfig = any;

export type BookOptions = {
    uuid?: string;
    filename?: string;
    title?: string;
    currentPageNumber?: number
    css?: string;
    config?: BookConfig | undefined;
    pages?: PageOptions[];
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
        let defaultJSON: BookOptions =  {
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

    addNewPage(options?: PageOptions): Page {
        let page: Page = new Page(options);
        this.pages.set(page.uuid, page);
        if (page.pageNumber == undefined) {
            page.pageNumber = this.pages.size - 1; // add to the end
        } else {
            this.insertPage(page, page.pageNumber);
        }
        return page;
    }

    private insertPage(page: Page, pageNumber: number): void {
        pageNumber = Math.min(this.pages.size, pageNumber);
        pageNumber = Math.max(0, pageNumber)
        page.pageNumber = pageNumber;
        let pageArray: Page[] = this.pageArray;
        pageArray.forEach((testPage: Page) => {
            //TODO
            if (testPage != page && testPage.pageNumber >= page.pageNumber) {
                testPage.pageNumber++;
            }
        });
    }

    deletePage(page: Page): Page {
        let pageNumber: number = page.pageNumber;
        this.pages.delete(page.uuid);
        let pageArray: Page[] = this.pageArray;
        pageArray.forEach((testPage: Page) => {
            //TODO
            if (testPage.pageNumber >= page.pageNumber) {
                testPage.pageNumber--;
            }
        });
        pageNumber = Math.min(pageArray.length, pageNumber);
        return pageArray[pageNumber];
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
