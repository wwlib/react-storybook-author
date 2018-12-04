import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import BottomNav from './BottomNav';
import Page from '../model/Page';
import FileDrop from './FileDrop';
import ReactAudioPlayer from 'react-audio-player';
import { TimestampedWord } from '../googlecloud/GoogleSTTWordTimingAdjuster';

export interface TitlePageProps { clickHandler: any, changeHandler: any, fileHandler: any, page: Page }
export interface TitlePageState { higlightedTranscript: string }

export default class TitlePage extends React.Component<TitlePageProps, TitlePageState> {


    componentWillMount() {
        this.setState({});
    }

    componentDidMount() {
    }

    onTitlePageButtonClicked(event: any): void {
        let nativeEvent: any = event.nativeEvent;
        this.props.clickHandler('titlePage', nativeEvent.target.id);
    }

    onBottomNavButtonClicked(sectionId: string, buttonId: string): void {
        this.props.clickHandler(sectionId, buttonId);
    }

    handleInputChange(event: any) {
        this.props.changeHandler(event);
    }

    onUploadButtonClick(event: any): void {
        let inputElement = document.getElementById("fileInput");
        if (inputElement) {
            inputElement.click();
        }
    }

    onFileInputChange(event: any): void {
        var fileList = event.target.files
        this.props.fileHandler(fileList);
    }

    onUploadFileList(fileList: any, ev: any) {
        ev.preventDefault(); // Prevent default behavior (Prevent file from being opened)
        this.props.fileHandler(fileList);
        this.removeDragData(ev);
    }

    removeDragData(ev) {
      if (ev.dataTransfer.items) {
        ev.dataTransfer.items.clear();
      } else {
        ev.dataTransfer.clearData();
      }
    }

    onDragOver(event: any) {
    }

    getCurrentGoogleWord(elapsedTime: number): string {
        let result: string = '';
        if (this.props.page && this.props.page.timestamps) {
            this.props.page.timestamps.forEach((timestampedWord: TimestampedWord) => {
                if (timestampedWord.start < elapsedTime && timestampedWord.end > elapsedTime) {
                    result = timestampedWord.word;
                }
            })
        }
        return result;
    }

    formatTranscript(highlightedWord: string): string {
        let result: string = '';
        if(this.props.page.audioTranscript) {
            let transcriptWords: string[] = this.props.page.audioTranscript.split(' ');
            transcriptWords.forEach((word: string) => {
                if (word == highlightedWord) {
                    result += '<' + word + '> ';
                } else {
                    result += word + ' ';
                }
            })
        }
        return result;
    }
    onReactAudioPlayerListen(elapsedTime: number): void {
        // console.log(elapsedTime);
        let highlightedWord: string = this.getCurrentGoogleWord(elapsedTime);
        // console.log(highlightedWord);
        this.setState({higlightedTranscript: this.formatTranscript(highlightedWord)});
    }

    render() {
        return (
            <div id="mainPage" style={{ width: "1097px", height: "500px" }}>

                <div id="mainPageTopTitle">
                    <div id="titlePageTopContainer">
                        <FileDrop className={"fileDrop"} targetClassName={"fileDropTarget"} onDrop={this.onUploadFileList.bind(this)} onDragOver={this.onDragOver.bind(this)}>
                            <div id="titlePageImage">
                                <img className="thumbnail" src={this.props.page.imageUri} />
                                <button className="imageUploadButton" onClick={this.onUploadButtonClick.bind(this)}></button>
                                <input type="file" id="fileInput" name="file" accept="image/png, image/jpeg, audio/wav, application/json" multiple style={{ display: 'none' }} onChange={this.onFileInputChange.bind(this)}/>
                            </div>
                        </FileDrop>
                        <div id="titlePageTargetWords">
                            <button id="addTargetWordButton">Add Target Word</button>
                        </div>
                    </div>
                    <div id="titlePageBottomContainer">
                        <input value={this.props.page.title} id="titleTextInput" placeholder="Enter a story title..."
                            onChange={this.handleInputChange.bind(this)}/>
                    </div>

                </div>
                <ReactAudioPlayer
                  src={'data:audio/wav;base64,' + this.props.page.audio}
                  listenInterval={50}
                  onListen={this.onReactAudioPlayerListen.bind(this)}
                  controls
                />
                <textarea value={this.state.higlightedTranscript} id="transcriptTextAreaInput" rows={1}  />
                <ReactBootstrap.Button bsStyle={"info"} key={"processAudio"} id={"processAudio"} style={{width: 100}} onClick={this.onTitlePageButtonClicked.bind(this)}>processAudio</ReactBootstrap.Button>
                <div id="mainPageBottom">
                    <div id="pageNumber"> Page 1 </div>
                </div>

                <BottomNav clickHandler={this.onBottomNavButtonClicked.bind(this)} fileHandler={this.props.fileHandler} />
            </div>
        );
    }
}
