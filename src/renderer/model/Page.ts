import Model from './Model';
import { TimestampedWord } from '../googlecloud/GoogleSTTWordTimingAdjuster';

// export type PageOptions = {
//     uuid?: string;
//     title?: string;
//     pageNumber?: number;
//     image?: any;
//     text?: string;
//     audio?: any;
//     audioTranscript?: string;
//     timestamps?: TimestampedWord[];
//     sceneObjects?: any[];
//     prompts?: string[];
//     css?: string;
// }


export type Position = {
    left: number;
    top: number;
    width: number;
    height: number;
}

// Describes a scene object.
// Contains the asset file to load the image from, the position to load
// the image, and an identifying name that is unique among other SceneObject
// objects in this scene.
export type SceneObject = {
    id: number;
    label: string;
    // Can be empty. This means there's no sprite to load.
    asset: string;
    position: Position;
    inText: boolean; // If this object corresponds to a word in the text.
}

export type AudioTimestamp = {
    start: number;
    end: number;
}

export enum TriggerType {
    CLICK_TINKERTEXT_SCENE_OBJECT,
}

export type TriggerArgs = {
    textId: number;
    sceneObjectId: number;
    timestamp: number;
}

export type Trigger = {
    type: TriggerType;
    args: TriggerArgs;
}

export type JiboPrompt = {
    question: string;
    response: string;
    hint: string;
}

// Maps to unity SceneDescription
export default class Page {


    public uuid: string;
    public title: string;
    public pageNumber: number;

    // public isTitle: boolean; // See getter isTitle()
    public storybookName: string;
    public storyImageFile: string;
    public image: any;
    public text: string;
    public audioFile: string;
    public audio: any;
    public audioTranscript: string;
    public timestamps: TimestampedWord[];
    public sceneObjects: SceneObject[];
    public triggers: Trigger[];
    public prompts: JiboPrompt[];
    public css: string;


    constructor(json?: any) {
        json = json || {};
        let defaultJSON: any =  {
            uuid: Model.getUUID(),
            title: '',
            pageNumber: undefined,
            storyImageFile: '',
            image: undefined,
            text: '',
            audioFile: '',
            audio: undefined,
            audioTranscript: undefined,
            timestamps: [],
            sceneObjects: [],
            triggers: [],
            prompts: [],
            css: '',
        }
        json = Object.assign(defaultJSON, json);
        this.initWithJson(json);
    }

    get isTitle(): boolean {
        return this.pageNumber == 0;
    }

    initWithJson(json?: any): Page {
        json = json || {};
        this.uuid = json.uuid;
        this.title = json.title || '<title>';
        this.pageNumber = json.pageNumber;
        this.storyImageFile = json.storyImageFile;
        this.image = json.image; // set/overridden by Book
        this.text = json.text;
        this.audioFile = json.audioFile;
        this.audio = json.audio; // set/overridden by Book
        this.audioTranscript = json.audioTranscript;
        if (json.timestamps) {
            this.timestamps = [];
            json.timestamps.forEach((timestampedWordData: any) => {
                let timestampedWord: TimestampedWord = {
                    index: timestampedWordData.index,
                    word: timestampedWordData.word,
                    start: timestampedWordData.start,
                    end: timestampedWordData.end
                }
                this.timestamps.push(timestampedWord);
            });
        }
        this.sceneObjects = [];
        if (json.sceneObjects) {
            json.sceneObjects.forEach(sceneObjectData => {
                //TODO
                // let sceneObject: SceneObject = new SceneObject(sceneObjectData);
                // this.sceneObjects.push(sceneObject);
            });
        }
        if (json.prompts) {
            json.prompts.forEach(promptData => {
                //TODO
                // let sceneObject: SceneObject = new SceneObject(sceneObjectData);
                // this.sceneObjects.push(sceneObject);
            });
        }
        if (json.triggers) {
            json.triggers.forEach(triggerData => {
                //TODO
                // let sceneObject: SceneObject = new SceneObject(sceneObjectData);
                // this.sceneObjects.push(sceneObject);
            });
        }
        this.css = json.css || '';

        return this;
    }

    toJSON(): any {
        // IMPORTANT: AWS: API will not accept empty field - string, arrays, etc.
        // make sure the json does not contain any empty fields.
        let json: any = {};
        json.uuid = this.uuid;
        json.title = this.title;
        json.pageNumber = this.pageNumber;
        if (this.isTitle) json.isTitle = true;
        json.storybookName = this.storybookName;
        json.storyImageFile = this.uuid;
        // moved to Book.pageImages for more human-readable json
        // if (this.image) json.image = this.image;
        if (this.text) json.text = this.text;
        json.audioFile = this.uuid;
        // moved to Book.pageAudios for more human-readable json
        // if (this.audio) json.audio = this.audio;
        if (this.audioTranscript) json.audioTranscript = this.audioTranscript;
        if (this.timestamps && this.timestamps.length > 0) {
            json.timestamps = [];
            this.timestamps.forEach((timestampedWord: TimestampedWord) => {
                let timestampedWordData: any = {
                    index: timestampedWord.index,
                    word: timestampedWord.word,
                    start: timestampedWord.start,
                    end: timestampedWord.end
                }
                json.timestamps.push(timestampedWordData);
            });
        }
        // json.sceneObjects = [];
        //TODO
        // this.sceneObjects.forEach((sceneObject: SceneObject) => {
        //     json.sceneObjects.push(sceneObject.toJSON());
        // })
        // json.prompts = [];
        //TODO
        // this.prompts.forEach((promptObject: JiboPrompt) => {
        //     json.prompts.push(promptObject.toJSON());
        // })
        // json.triggers = [];
        //TODO
        // this.triggers.forEach(triggerObject: Trigger) => {
        //     json.triggers.push(triggerObject.toJSON());
        // })
        if (this.css) json.css = this.css;

        return json;
    }

    get imageUri(): string {
        return `data:image/jpeg;base64,${this.image}`;
    }
}
