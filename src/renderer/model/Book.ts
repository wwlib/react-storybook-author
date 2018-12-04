import Model from './Model';
import Page from './Page';

// export type BookOptions = {
//     uuid?: string;
//     filename?: string;
//     title?: string;
//     currentPageNumber?: number
//     css?: string;
//     pages?: Page[];
// }

// Maps to unity StoryMetadata
export default class Book {

    public uuid: string;
    public filename: string;

    // public title: string = '';
    public name: string;
    public humanReadableName: string;
    public numPages: number;
    public currentPageNumber;
    public css: string;
    // public orientation: any; Unity type, derived from orientationString
    public orientationString: string;
    public targetWords: string[];
    public pages: Map<string, Page>;

    constructor(json?: any) {
        json = json || {};
        let defaultJSON: any =  {
            uuid: Model.getUUID(),
            filename: 'untitled',
            name: '',
            humanReadableName: '',
            // numPages: 0,
            currentPageNumber: 0,
            css: '',
            orientationString: 'landscape',
            targetWords: [],
            pages: new Map<string, Page>()
        }
        json = Object.assign(defaultJSON, json);
        this.initWithJson(json);
    }

    initWithJson(json?: any): Book {
        json = json || {};
        this.uuid = json.uuid || Model.getUUID();
        this.filename = json.filename || '<filename>';
        this.name = json.name || json.title || '<name>';
        this.humanReadableName = json.humanReadableName || json.title || '<humanReadableName>';
        // this.numPages = json.numPages || 0;
        this.currentPageNumber = 0;
        this.css = json.css || '';
        this.orientationString = json.orientationString || 'landscape';
        this.targetWords = json.targetWords || [];
        this.pages = new Map<string, Page>();
        if (json.pages) {
            json.pages.forEach(pageData => {
                let page: Page = new Page(pageData);
                page.storybookName = this.name;
                this.pages.set(page.uuid, page);
            });
        }
        if (json.pageImages) {
            json.pageImages.forEach(pageImageData => {
                let page: Page | undefined = this.pages.get(pageImageData.pageUUID)
                if (page) {
                    // page.storyImageFile = pageImageData.storyImageFile;
                    page.image = pageImageData.image;
                }
            });
        }
        if (json.pageAudios) {
            json.pageAudios.forEach(pageAudioData => {
                let page: Page | undefined = this.pages.get(pageAudioData.pageUUID)
                if (page) {
                    // page.audioFile = pageAudioData.storyImageFile;
                    page.audio = pageAudioData.audio;
                }
            });
        }
        return this;
    }

    toJSON(): any {
        // IMPORTANT: AWS: API will not accept empty field - string, arrays, etc.
        // make sure the json does not contain any empty fields.
        let json: any = {};
        json.uuid = this.uuid;
        json.filename = this.filename;
        json.name = this.name;
        json.humanReadableName = this.humanReadableName;
        json.numPages = this.pageCount;
        json.currentPageNumber = this.currentPageNumber;
        if (this.css) json.css = this.css;
        json.orientationString = this.orientationString;
        if (this.targetWords && this.targetWords.length > 0) json.targetWords = this.targetWords;
        let pages: any[] = [];
        let pageImages: any[] = [];
        let pageAudios: any[] = [];
        this.pages.forEach((page: Page) => {
            pages.push(page.toJSON());
            pageImages.push({pageUUID: page.uuid, image: page.image});
            pageAudios.push({pageUUID: page.uuid, audio: page.audio});
        })
        if (pages && pages.length > 0) {
            json.pages = pages;
        }
        if (pageImages && pageImages.length > 0) {
            json.pageImages = pageImages;
        }
        if (pageAudios && pageAudios.length > 0) {
            json.pageAudios = pageAudios;
        }
        return json;
    }

    addNewPage(options?: any): Page {
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
        pageNumber = Math.min(pageArray.length-1, pageNumber);
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

    // backward compatibility
    get title(): string {
        return this.humanReadableName;
    }
}
