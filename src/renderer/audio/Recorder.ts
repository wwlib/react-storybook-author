/*License (MIT)

Copyright Â© 2013 Matt Diamond

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of
the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/

export type RecorderConfig = {
    bufferLen?: number;
    callback?: any;
    type?: string;
    workerPath?: string;
}

export default class Recorder {

    // var WORKER_PATH = 'js/recorderjs/recorderWorker.js';
    public WORKER_PATH: string = 'dist/renderer/audio/RecorderWorker.js'; //'workers/recorderWorker.js';
    public context: AudioContext | undefined;
    public node: ScriptProcessorNode | undefined;

    private config: any;
    private bufferLen: number;
    private worker: Worker | undefined;
    private recording: boolean;
    private currCallback: any;

    constructor(source: AudioNode, cfg?: RecorderConfig) {
        this.config = cfg || {};
        this.bufferLen = this.config.bufferLen || 4096;
        this.context = source.context;
        // if(!this.context.createScriptProcessor){
        //    this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);
        // } else {
        this.node = this.context.createScriptProcessor(this.bufferLen, 2, 2);
        // }

        this.worker = new Worker(this.config.workerPath || this.WORKER_PATH);
        this.worker.postMessage({
            command: 'init',
            config: {
                sampleRate: this.context.sampleRate
            }
        });
        this.recording = false;

        this.node.onaudioprocess = ((e: any) => {
            if (!this.recording) return;
            if (this.worker) {
                this.worker.postMessage({
                    command: 'record',
                    buffer: [
                        e.inputBuffer.getChannelData(0),
                        e.inputBuffer.getChannelData(1)
                    ]
                });
            }
        });

        this.worker.onmessage = (e: any) => {
          var blob = e.data;
          this.currCallback(blob);
        }

        source.connect(this.node);
        this.node.connect(this.context.destination);   // if the script node is not connected to an output the "onaudioprocess" event is not triggered in chrome.
    }

    static setupDownload(blob: any, filename: string) {
        var url = (window.URL).createObjectURL(blob);
        var link: any = document.getElementById("save"); //HTMLElement
        link.href = url;
        link.download = filename || 'output.wav';
    }

    configure(cfg: any) {
        for (var prop in cfg) {
            if (cfg.hasOwnProperty(prop)) {
                this.config[prop] = cfg[prop];
            }
        }
    }

    record() {
        this.recording = true;
    }

    stop() {
        this.recording = false;
    }

    clear() {
        if (this.worker) {
            this.worker.postMessage({ command: 'clear' });
        }
    }

    getBuffers(cb: any) {
        this.currCallback = cb || this.config.callback;
        if (this.worker) {
            this.worker.postMessage({ command: 'getBuffers' });
        }
    }

    exportWAV(cb: any, type?: string) {
        console.log(`Recorder: exportWAV: `, cb, type);
        this.currCallback = cb || this.config.callback;
        type = type || this.config.type || 'audio/wav';
        if (!this.currCallback) throw new Error('Callback not set');
        console.log(`this.worker: `, this.worker);
        if (this.worker) {
            this.worker.postMessage({
                command: 'exportWAV',
                type: type
            });
        }
    }

    exportMonoWAV(cb: any, type?: string) {
        this.currCallback = cb || this.config.callback;
        type = type || this.config.type || 'audio/wav';
        if (!this.currCallback) throw new Error('Callback not set');
        if (this.worker) {
            this.worker.postMessage({
                command: 'exportMonoWAV',
                type: type
            });
        }
    }

    exportMono16kWAV(cb: any, type?: string) {
        this.currCallback = cb || this.config.callback;
        type = type || this.config.type || 'audio/wav';
        if (!this.currCallback) throw new Error('Callback not set');
        if (this.worker) {
            this.worker.postMessage({
                command: 'exportMono16kWAV',
                type: type
            });
        }
    }

    dispose() {
        this.context = undefined;
        this.node = undefined;
        this.config = undefined;
        this.worker = undefined;
        this.currCallback = undefined;
    }
}
