import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import ReactAudioPlayer from 'react-audio-player';
import Highlighter from "react-highlight-words";

import { TimestampedWord } from '../googlecloud/GoogleSTTWordTimingAdjuster';
import BottomNav from './BottomNav';
import Book from '../model/Book';
import Page from '../model/Page';

import FileDrop from './FileDrop';

export interface MainPageProps { clickHandler: any, changeHandler: any, fileHandler: any, page: Page, book: Book }
export interface MainPageState { higlightedTranscript: string }

export default class MainPage extends React.Component<MainPageProps, MainPageState> {


    componentWillMount() {
        this.setState({higlightedTranscript: ''});
    }

    componentDidMount() {
    }

    onMainPageButtonClicked(event: any): void {
        let nativeEvent: any = event.nativeEvent;
        this.props.clickHandler('mainPage', nativeEvent.target.id);
    }

    onBottomNavButtonClicked(sectionId: string, buttonId: string): void {
        this.props.clickHandler(sectionId, buttonId);
    }

    handleInputChange(event: any) {
        this.props.changeHandler(event);
    }

    // processUploadedFile(file: any): void {
    //     // console.log('processUploadedFile ' + file.name);
    //     this.props.fileHandler(file);
    // }
    //
    // processUploadedFileList(fileList: any[]): void {
    //     let fileListLength: number = fileList.length;
    //     for (var i = 0; i < fileListLength; i++) {
    //         var file = fileList[i];
    //         // console.log('... file[' + i + '].name = ' + file.name, file);
    //         this.processUploadedFile(file);
    //     }
    // }

    onUploadFileList(fileList: any, ev: any) {
        // console.log('onUploadFileList:', fileList, event);
        ev.preventDefault(); // Prevent default behavior (Prevent file from being opened)
        // this.processUploadedFileList(fileList);
        this.props.fileHandler(fileList);
        // Pass event to removeDragData for cleanup
        this.removeDragData(ev);
        /*
        if (ev.dataTransfer.items) {
            console.log(`using items`);
            // Use DataTransferItemList interface to access the file(s)
            for (var i = 0; i < ev.dataTransfer.items.length; i++) {
                    if (ev.dataTransfer.items[i].kind === 'file') { // If dropped items aren't files, reject them
                    var file = ev.dataTransfer.items[i].getAsFile();
                    console.log('... file[' + i + '].name = ' + file.name, file);
                    this.processUploadedFile(file);
                }
            }
        } else {
            console.log(`using files (unimplemented)`); //UNIMPLEMENTED
            // Use DataTransfer interface to access the file(s)
            for (var i = 0; i < ev.dataTransfer.files.length; i++) {
                console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
            }
        }
        */
    }

    onFileInputChange(event: any): void {
        var fileList = event.target.files
        this.props.fileHandler(fileList);
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

    onUploadButtonClick(event: any): void {
        let inputElement = document.getElementById("fileInput");
        // console.log(`onUploadButtonClick`, inputElement);
        if (inputElement) {
            inputElement.click();
        }
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
        let storyImageStyle: any = {background:`url(${this.props.page.imageUri}) no-repeat`, backgroundSize: '100%'};
        let timestampsText: string = JSON.stringify(this.props.page.timestamps, null, 2);
        // style={{ width: "1097px", height: "500px" }}
        return (
            <div id="mainPage">
                <div id="mainPageTopStory">
                    <div className="storyImageContainer">
                        <FileDrop className={"fileDrop"} targetClassName={"fileDropTarget"} onDrop={this.onUploadFileList.bind(this)} onDragOver={this.onDragOver.bind(this)}>
                            <div className="storyImage" style={storyImageStyle}>
                                <input type="file" id="fileInput" name="file" accept="image/png, image/jpeg, audio/wav, application/json" multiple style={{ display: 'none' }} onChange={this.onFileInputChange.bind(this)}/>
                                <button className="imageUploadButton" onClick={this.onUploadButtonClick.bind(this)}></button>
                            </div>
                        </FileDrop>
                    </div>
                    <div className="storyTextContainer">
                        <textarea value={this.props.page.text} id="storyTextAreaInput" rows={5} placeholder="Type to enter page content..."
                            onChange={this.handleInputChange.bind(this)}/>
                        <textarea value={this.props.page.audioTranscript} id="transcriptTextAreaInput" rows={2} onChange={this.handleInputChange.bind(this)} />
                        <textarea value={this.state.higlightedTranscript} id="transcriptTextAreaOutput" rows={2}  />
                        <ReactAudioPlayer
                          src={'data:audio/wav;base64,' + this.props.page.audio}
                          listenInterval={50}
                          onListen={this.onReactAudioPlayerListen.bind(this)}
                          controls
                        />
                        <ReactBootstrap.Button bsStyle={"info"} key={"processAudio"} id={"processAudio"} style={{width: 120}} onClick={this.onMainPageButtonClicked.bind(this)}>processAudio</ReactBootstrap.Button>

                    </div>
                    <div className="storyDataContainer">
                        <textarea className="storyDataText" value={this.props.book.name} id="nameTextInput" rows={1} onChange={this.handleInputChange.bind(this)} />
                        <textarea value={timestampsText} id="timestampsTextInput" rows={20} />
                    </div>
                </div>
                <BottomNav clickHandler={this.onBottomNavButtonClicked.bind(this)} fileHandler={this.props.fileHandler} />
            </div>
        );
    }
}

/*
<div id="mainPageTopStory">
    <FileDrop className={"fileDrop"} targetClassName={"fileDropTarget"} onDrop={this.onUploadFileList.bind(this)} onDragOver={this.onDragOver.bind(this)}>
        <div id="imageContainer" style={imageContainerStyle}>
            <img className="thumbnail" src={this.props.page.imageUri} />
            <button className="imageUploadButton" onClick={this.onUploadButtonClick.bind(this)}></button>
            <input type="file" id="fileInput" name="file" accept="image/png, image/jpeg, audio/wav, application/json" multiple style={{ display: 'none' }} onChange={this.onFileInputChange.bind(this)}/>
        </div>
    </FileDrop>
    <div id="textContainer">
        <textarea value={this.props.page.text} id="storyTextAreaInput" rows={5} placeholder="Type to enter page content..."
            onChange={this.handleInputChange.bind(this)}/>
        <div id="promptContainer">
            <div className="addPromptContainer">
                <button id="addPromptButton"></button>
            </div>
        </div>
    </div>
</div>
<ReactAudioPlayer
  src={'data:audio/wav;base64,' + this.props.page.audio}
  listenInterval={50}
  onListen={this.onReactAudioPlayerListen.bind(this)}
  controls
/>
<textarea value={this.state.higlightedTranscript} id="transcriptTextAreaInput" rows={1}  />
<ReactBootstrap.Button bsStyle={"info"} key={"processAudio"} id={"processAudio"} style={{width: 100}} onClick={this.onMainPageButtonClicked.bind(this)}>processAudio</ReactBootstrap.Button>
<div id="mainPageBottom">
    <div id="pageNumber"> Page 1 </div>
</div>

<BottomNav clickHandler={this.onBottomNavButtonClicked.bind(this)} fileHandler={this.props.fileHandler} />

*/
