export class RecorderWorker {

    public onmessage: any;
    public postMessage: any;

    private _recLength:number = 0;
    private _recBuffersL: any = [];
    private _recBuffersR: any = [];
    private _sampleRate: number;

    constructor() {
        this.onmessage = (e: any) => {
          switch(e.data.command) {
            case 'init':
              this.init(e.data.config);
              break;
            case 'record':
              this.record(e.data.buffer);
              break;
            case 'exportWAV':
              this.exportWAV(e.data.type);
              break;
            case 'exportMonoWAV':
              this.exportMonoWAV(e.data.type);
              break;
            case 'getBuffers':
              this.getBuffers();
              break;
            case 'clear':
              this.clear();
              break;
          }
        }
    }


    private init(config){
      this._sampleRate = config.sampleRate;
    }

    private record(inputBuffer){
      this._recBuffersL.push(inputBuffer[0]);
      this._recBuffersR.push(inputBuffer[1]);
      this._recLength += inputBuffer[0].length;
    }

    private exportWAV(type){
      var bufferL = this.mergeBuffers(this._recBuffersL, this._recLength);
      var bufferR = this.mergeBuffers(this._recBuffersR, this._recLength);
      var interleaved = this.interleave(bufferL, bufferR);
      var dataview = this.encodeWAV(interleaved);
      var audioBlob = new Blob([dataview], { type: type });

      this.postMessage(audioBlob);
    }

    private exportMonoWAV(type){
      var bufferL = this.mergeBuffers(this._recBuffersL, this._recLength);
      var dataview = this.encodeWAV(bufferL, true);
      var audioBlob = new Blob([dataview], { type: type });

      this.postMessage(audioBlob);
    }

    private getBuffers() {
      var buffers: Float32Array[] = [];
      buffers.push( this.mergeBuffers(this._recBuffersL, this._recLength) );
      buffers.push( this.mergeBuffers(this._recBuffersR, this._recLength) );
      this.postMessage(buffers);
    }

    private clear(){
      this._recLength = 0;
      this._recBuffersL = [];
      this._recBuffersR = [];
    }

    private mergeBuffers(recBuffers, recLength){
      var result = new Float32Array(recLength);
      var offset = 0;
      for (var i = 0; i < recBuffers.length; i++){
        result.set(recBuffers[i], offset);
        offset += recBuffers[i].length;
      }
      return result;
    }

    private interleave(inputL, inputR){
      var length = inputL.length + inputR.length;
      var result = new Float32Array(length);

      var index = 0,
        inputIndex = 0;

      while (index < length){
        result[index++] = inputL[inputIndex];
        result[index++] = inputR[inputIndex];
        inputIndex++;
      }
      return result;
    }

    private floatTo16BitPCM(output, offset, input){
      for (var i = 0; i < input.length; i++, offset+=2){
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    }

    private writeString(view, offset, string){
      for (var i = 0; i < string.length; i++){
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    private encodeWAV(samples: Float32Array, mono: boolean = false){
      var buffer = new ArrayBuffer(44 + samples.length * 2);
      var view = new DataView(buffer);

      /* RIFF identifier */
      this.writeString(view, 0, 'RIFF');
      /* file length */
      view.setUint32(4, 32 + samples.length * 2, true);
      /* RIFF type */
      this.writeString(view, 8, 'WAVE');
      /* format chunk identifier */
      this.writeString(view, 12, 'fmt ');
      /* format chunk length */
      view.setUint32(16, 16, true);
      /* sample format (raw) */
      view.setUint16(20, 1, true);
      /* channel count */
      view.setUint16(22, mono?1:2, true);
      /* sample rate */
      view.setUint32(24, this._sampleRate, true);
      /* byte rate (sample rate * block align) */
      view.setUint32(28, this._sampleRate * 4, true);
      /* block align (channel count * bytes per sample) */
      view.setUint16(32, 4, true);
      /* bits per sample */
      view.setUint16(34, 16, true);
      /* data chunk identifier */
      this.writeString(view, 36, 'data');
      /* data chunk length */
      view.setUint32(40, samples.length * 2, true);

      this.floatTo16BitPCM(view, 44, samples);

      return view;
    }
}
