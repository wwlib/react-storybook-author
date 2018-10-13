import Model from './Model';
import { TimestampedWord } from '../googlecloud/GoogleSTTWordTimingAdjuster';

export type PageOptions = {
    uuid?: string;
    title?: string;
    pageNumber?: number;
    image?: any;
    text?: string;
    audio?: any;
    audioTranscript?: string;
    audioTimestampedWords?: TimestampedWord[];
    sceneObjects?: any[];
    prompts?: string[];
    css?: string;
}

export default class Page {

    public uuid: string;
    public title: string;
    public pageNumber: number;
    public image: any;
    public text: string;
    public audio: any;
    public audioTranscript: string;
    public audioTimestampedWords: TimestampedWord[];
    public prompts: string[];
    public css: string;
    public sceneObjects: any[];

    constructor(json?: any) {
        json = json || {};
        let defaultJSON: PageOptions =  {
            uuid: Model.getUUID(),
            title: '',
            pageNumber: undefined,
            image: undefined,
            text: '',
            audio: undefined,
            audioTranscript: undefined,
            audioTimestampedWords: undefined,
            prompts: [],
            css: '',
            sceneObjects: []
        }
        json = Object.assign(defaultJSON, json);
        this.initWithJson(json);
    }

    initWithJson(json?: any): Page {
        json = json || {};
        this.uuid = json.uuid;
        this.title = json.title || '<title>';
        this.pageNumber = json.pageNumber;
        this.image = json.image;
        this.text = json.text;
        this.audio = json.audio;
        this.audioTranscript = json.audioTranscript;
        if (json.audioTimestampedWords) {
            this.audioTimestampedWords = [];
            json.audioTimestampedWords.forEach((timestampedWordData: any) => {
                let timestampedWord: TimestampedWord = {
                    index: timestampedWordData.index,
                    word: timestampedWordData.word,
                    start: timestampedWordData.start,
                    end: timestampedWordData.end
                }
                this.audioTimestampedWords.push(timestampedWord);
            });
        }
        this.prompts = json.prompts;
        this.css = json.css || '';
        this.sceneObjects = [];
        if (json.sceneObjects) {
            json.sceneObjects.forEach(sceneObjectData => {
                //TODO
                // let sceneObject: SceneObject = new SceneObject(sceneObjectData);
                // this.sceneObjects.push(sceneObject);
            });
        }
        return this;
    }

    toJSON(): any {
        let json: any = {};
        json.uuid = this.uuid;
        json.title = this.title;
        json.pageNumber = this.pageNumber;
        if (this.image) json.image = this.image;
        if (this.text) json.text = this.text;
        if (this.audio) json.audio = this.audio;
        if (this.audioTranscript) json.audioTranscript = this.audioTranscript;
        if (this.audioTimestampedWords) {
            json.audioTimestampedWords = [];
            this.audioTimestampedWords.forEach((timestampedWord: TimestampedWord) => {
                let timestampedWordData: any = {
                    index: timestampedWord.index,
                    word: timestampedWord.word,
                    start: timestampedWord.start,
                    end: timestampedWord.end
                }
                json.audioTimestampedWords.push(timestampedWordData);
            });
        }
        if (this.prompts && this.prompts.length > 0) json.prompts = this.prompts;
        if (this.css) json.css = this.css;
        //TODO
        // this.sceneObjects.forEach((sceneObject: SceneObject) => {
        //     json.sceneObjects.push(sceneObject.toJSON());
        // })

        return json;
    }
}
