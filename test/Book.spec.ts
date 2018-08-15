import { expect } from 'chai';
import 'mocha';

import Page, { PageOptions } from '../src/renderer/model/Page';
import Book, { BookOptions } from  '../src/renderer/model/Book';

let pagesData: PageOptions[] = [
    {
        title: 'one',
        pageNumber: 1,
        image: undefined,
        text: '<text>',
        audio: undefined,
        prompts: [
            '<prompt1>',
            '<prompt2>'
        ],
        css: '',
        sceneObjects: []
    },
    {
        title: 'zero',
        pageNumber: 0,
        image: undefined,
        text: '<text>',
        audio: undefined,
        prompts: [
            '<prompt1>',
            '<prompt2>'
        ],
        css: '',
        sceneObjects: []
    }
];

// let pages: Page[] = [];
// pagesData.forEach(pageData => {
//     let page: Page = new Page(pageData);
//     pages.push(page);
// });

let bookData: BookOptions = {
    filename: 'untitled',
    title: '<title>',
    currentPageNumber: 0,
    css: '',
    config: undefined,
    pages: pagesData
}

describe('Book', () => {
    it('uuid should not be undefined', () => {
        let book: Book = new Book(bookData);
        expect(book.uuid).to.not.be.undefined;
    });

    it('filename should be "untitled"', () => {
        let book: Book = new Book(bookData);
        expect(book.filename).to.equal('untitled');
    });

    it('title should not be undefined', () => {
        let book: Book = new Book(bookData);
        expect(book.title).to.not.be.undefined;
    });

    it('currentPageNumber should be 0', () => {
        let book: Book = new Book(bookData);
        expect(book.currentPageNumber).to.equal(0);
    });

    it('pageCount should be 2', () => {
        let book: Book = new Book(bookData);
        expect(book.pageCount).to.equal(2);
    });

    it('pages (Array) should have length == book.pageCount', () => {
        let book: Book = new Book(bookData);
        let pageArray: Page[] = book.pageArray;
        expect(book.pageCount).to.equal(pageArray.length);
    });

    it('pages (Array) should be sorted by page.pageNumber (ascending)', () => {
        let book: Book = new Book(bookData);
        let pageArray: Page[] = book.pageArray;
        let sorted: boolean = true;
        let prevPageNumber: number = 0;
        pageArray.forEach((page: Page) => {
            if (page.pageNumber < prevPageNumber) {
                sorted = false;
            }
            prevPageNumber = page.pageNumber;
        })
        expect(sorted).to.be.true;
    });

    it('after adding a new page, book.pageCount should be 3', () => {
        let book: Book = new Book(bookData);
        book.addNewPage()
        let pageArray: Page[] = book.pageArray;
        // pageArray.map((page: Page) => { console.log(`${page.pageNumber}: ${page.title}`)});
        expect(book.pageCount).to.equal(pageArray.length);
    });

    it('after adding a new page, page.pageNumber should be 2', () => {
        let book: Book = new Book(bookData);
        let page: Page = book.addNewPage();
        expect(page.pageNumber).to.equal(2);
    });

    it('after inserting a new page, pageArray should be sorted with no gaps', () => {
        let book: Book = new Book(bookData);
        let page: Page = book.addNewPage({ pageNumber: 1});
        let pageArray: Page[] = book.pageArray;
        // pageArray.map((page: Page) => { console.log(`${page.pageNumber}: ${page.title}`)});
        let sorted: boolean = true;
        let prevPageNumber: number = 0;
        pageArray.forEach((page: Page) => {
            if (page.pageNumber < prevPageNumber || (page.pageNumber - prevPageNumber > 1)) {
                sorted = false;
            }
            prevPageNumber = page.pageNumber;
        })
        expect(sorted).to.be.true;
        expect(book.pageCount).to.equal(3);
        expect(book.pageCount).to.equal(pageArray.length);
    });

    it('after deleting a page, pageArray should be sorted with no gaps', () => {
        let book: Book = new Book(bookData);
        let page: Page = book.addNewPage({ pageNumber: 1});
        book.deletePage(page);
        let pageArray: Page[] = book.pageArray;
        // pageArray.map((page: Page) => { console.log(`${page.pageNumber}: ${page.title}`)});
        let sorted: boolean = true;
        let prevPageNumber: number = 0;
        pageArray.forEach((page: Page) => {
            if (page.pageNumber < prevPageNumber || (page.pageNumber - prevPageNumber > 1)) {
                sorted = false;
            }
            prevPageNumber = page.pageNumber;
        })
        expect(sorted).to.be.true;
        expect(book.pageCount).to.equal(2);
        expect(book.pageCount).to.equal(pageArray.length);
    });


});
