import Recorder from './Recorder';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export default class AudioController {

    public isRecording = false;

    private callback: any;
    private audioContext: AudioContext;
    private audioStream: MediaStream;
    private audioRecorder: Recorder;
    private startRecordTime: number;

    constructor(callback: any) {
        this.callback = callback;
        this.initRecorder();
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

    public endRecord() {
        console.log("endRecord");
        this.audioRecorder.stop();
        var durationSeconds = (new Date().getTime() - this.startRecordTime) / 1000.0;
        this.isRecording = false;
        console.log("duration: ", durationSeconds);
        // Save wav file.
        console.log(`exporting...`, this.callback);
        this.audioRecorder.exportWAV(this.callback);
        // (blob: any) => {
        //     var audioFileName = "audio_chunk_" + this.formatDate(new Date()) + ".wav";
        //     this.uploadAudio(blob, audioFileName);
        //     this.pages[this.pageNumber].audioDuration = durationSeconds;
        // }
    }
}
