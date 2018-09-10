import Recorder from './Recorder';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const fs = require('fs');
const path = require('path');
const ensureDir = require('ensureDir');
const toBuffer = require('blob-to-buffer');

export type AudioManagerOptions = {
    userAudioDataPath?: string;
}

export type PathInfo = {
    filename: string;
    filepath: string;
}

export type AudioFileInfo = {
    filename: string;
    filepath: string;
    blob: Blob;
}

export default class AudioManager {

    private static _instance: AudioManager;

    public userDataPath: string | undefined;
    public isRecording = false;

    private callback: any;
    private audioContext: AudioContext;
    private audioStream: MediaStream;
    private audioRecorder: Recorder;
    private startRecordTime: number;

    constructor(options?: AudioManagerOptions) {
        options = options || {};
        let defaultOptions: AudioManagerOptions = {
            userAudioDataPath: './'
        }
        options = Object.assign(defaultOptions, options);
        this.userDataPath = options.userAudioDataPath;
        console.log(`AudioManager: userDataPath: ${this.userDataPath}`);
        this.initRecorder();
    }

    static Instance(options?: AudioManagerOptions) {
        return this._instance || (this._instance = new this(options));
    }

    saveUserAudioBlob(blob: Blob, userDataPath: string, pathInfo: PathInfo):  Promise<any> {
        console.log(`saveUserAudioBlob: `);
        return new Promise<any>((resolve, reject) => {
            ensureDir(path.resolve(userDataPath), 0o755, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    toBuffer(blob, (err, buffer) => {
                        if (err) throw err
                        fs.writeFileSync(pathInfo.filepath, buffer);
                        resolve(pathInfo);
                    });
                }
            });
        });
    }

    private initRecorder() {
        this.audioContext = new AudioContext();
        navigator.getUserMedia({audio: true}, (stream: MediaStream) => {
            this.audioStream = stream;
            var input: AudioNode = this.audioContext.createMediaStreamSource(stream);
            this.audioRecorder = new Recorder(input);;
            console.log("Recorder initialized!");
        }, function(err) {
            console.log(err);
        });
    }

    public startRecord() {
        console.log("startRecord");
        this.audioRecorder.clear();
        wait(250).then(() => {
            this.audioRecorder.record();
            this.startRecordTime = new Date().getTime();
            this.isRecording = true;
        });
    }

    public endRecord(): Promise<AudioFileInfo> {
        console.log(`endRecord: `);
        return new Promise<AudioFileInfo>((resolve, reject) => {
            this.audioRecorder.stop();
            var durationSeconds = (new Date().getTime() - this.startRecordTime) / 1000.0;
            this.isRecording = false;
            console.log("duration: ", durationSeconds);
            console.log(`exporting...`);
            this.audioRecorder.exportMono16kWAV((blob: Blob) => { // this.audioRecorder.exportWAV((blob: Blob) => {
                if (this.userDataPath) {
                    this.saveUserAudioBlob(blob, this.userDataPath, this.generateFilepath())
                        .then((pathInfo: PathInfo) => {
                            console.log(`saved: ${pathInfo.filepath}`);
                            resolve({
                                filename: pathInfo.filename,
                                filepath: pathInfo.filepath,
                                blob: blob
                            });
                        })
                        .catch((err: any) => {
                            console.log(err);
                            reject(err);
                        })
                }
            });
        });
    }

    // Helper function for creating filenames for recorded audio.
    formatDate(date: Date) {
      var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];

      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();

      var hour = date.getHours();
      var minute = date.getMinutes();
      var seconds = date.getSeconds();


      return day + '-' + monthNames[monthIndex] + '-' + year + '-'
            + hour + "_" + minute + "_" + seconds;
    }

    generateFilepath(): PathInfo {
        var filename = "audio_chunk_" + this.formatDate(new Date()) + ".wav";
        var filepath = path.resolve(this.userDataPath, filename);
        return {filepath: filepath, filename: filename};
    }

    load(filepath: string, cb: any){
        // jsonfile.readFile(filepath, (err: any, obj: any) => {
        //     if (err) {
        //         cb(err);
        //     } else {
        //         cb(err, obj);
        //     }
        // });
    }
}
