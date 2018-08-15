import Model from './Model';

export type PageData = {
    uuid?: string;
    title?: string;
    pageNumber?: number;
    image?: any;
    text?: string;
    audio?: any;
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
    public prompts: string[];
    public css: string;
    public sceneObjects: any[];

    constructor(json?: any) {
        json = json || {};
        let defaultJSON: PageData =  {
            uuid: Model.getUUID(),
            title: '',
            pageNumber: 0,
            image: undefined,
            text: '',
            audio: undefined,
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
        json.image = this.image;
        json.text = this.text;
        json.audio = this.audio;
        json.prompts = this.prompts;
        json.css = this.css;
        json.sceneObjects = [];
        //TODO
        // this.sceneObjects.forEach((sceneObject: SceneObject) => {
        //     json.sceneObjects.push(sceneObject.toJSON());
        // })

        return json;
    }
}
