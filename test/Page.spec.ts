import { expect } from 'chai';
import 'mocha';

import Page, { PageOptions } from '../src/renderer/model/Page';

let pageData: PageOptions = {
    title: '<title>',
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

describe('Page', () => {
    it('uuid should not be undefined', () => {
        let page: Page = new Page(pageData);
        expect(page.uuid).to.not.be.undefined;
    });

    it('title should not be undefined', () => {
        let page: Page = new Page(pageData);
        expect(page.title).to.not.be.undefined;
    });

    it('pageNumber should be 0', () => {
        let page: Page = new Page(pageData);
        expect(page.pageNumber).to.equal(0);
    });
});
