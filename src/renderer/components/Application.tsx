import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Model from '../model/Model';
import Page from '../model/Page';
import Login from './Login';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import SideNav from './SideNav';
import MainPage from './MainPage';
import TitlePage from './TitlePage';
import PageThumbnail from './PageThumbnail';
import BookList from './BookList';
import { BookDataList } from '../model/BookManager';
import Book from '../model/Book';
import AppSettings from '../model/AppSettings';
import AppSettingsPanel from './AppSettingsPanel';
import WindowComponent from '../model/WindowComponent';
import { AudioFileInfo } from '../audio/AudioManager';
import GoogleSTTController, { ClientConfig, GoogleSTTControllerOptions, GoogleSTTResponse } from '../googlecloud/GoogleSTTController';
import GoogleSTTWordTimingAdjuster from '../googlecloud/GoogleSTTWordTimingAdjuster';


const toBuffer = require('blob-to-buffer');
const {dialog, shell} = require('electron').remote;
const fs = require('fs');
const Jimp = require('jimp');

export interface ApplicationProps { model: Model }
export interface ApplicationState {
    showAppSettingsPanel: boolean,
    appSettings: AppSettings,
    pageArray: Page[],
    loggedIn: boolean,
    bookLoaded: boolean,
    cloudBookDataList: BookDataList | undefined,
    filesystemBookDataList: BookDataList | undefined,
    activePage: Page }

export default class Application extends React.Component < ApplicationProps, ApplicationState > {

    componentWillMount() {
        this.setState({
            showAppSettingsPanel: false,
            loggedIn: false,
            bookLoaded: false,
            cloudBookDataList: undefined
        });
    }

    componentDidMount() {
        WindowComponent.addWindowWithId('appSettingsPanel', 200, 130); //TODO magic number
    }

    onLoginClick(username: string, password): void {
        console.log(`Application: onLoginClick`);
        this.props.model.login(username, password)
            .then((cloudBookDataList: BookDataList) => {
                this.setState({ loggedIn: true, bookLoaded: false, cloudBookDataList: cloudBookDataList });
                this.props.model.loadBooklistFromFilesystem()
                    .then((filesystemBookDataList: BookDataList) => {
                        this.setState({ filesystemBookDataList: filesystemBookDataList });
                    })
                    .catch((err: any) => {
                        console.log(err);
                    })
            })
            .catch((err: any) => {
                console.log(err);
            })
    }

    onTopNavClick(event: any): void {
        let nativeEvent: any = event.nativeEvent;
        switch ( nativeEvent.target.id) {
            case 'appSettings':
                WindowComponent.bringWindowToFrontWithId('appSettingsPanel');
                this.setState({showAppSettingsPanel: true});
                break;
            case 'addPageButton':
                this.props.model.addNewPage();
                this.setState({ pageArray: this.props.model.activeBook.pageArray});
                break;
            case 'deletePageButton':
                this.props.model.deletePage();
                this.props.model.selectPage(this.props.model.activePage);
                this.setState({ pageArray: this.props.model.activeBook.pageArray, activePage: this.props.model.activePage});
                break;
            case 'hideSceneObjectsButton':
                break;
            case 'submitButton':
                this.props.model.saveActiveBookToCloud();
                break;
            case 'loadBook':
                this.props.model.retrieveBooklistFromCloudWithAuthor()
                    .then((cloudBookDataList: BookDataList) => {
                        this.setState({ loggedIn: true, bookLoaded: false, cloudBookDataList: cloudBookDataList });
                        this.props.model.loadBooklistFromFilesystem()
                            .then((filesystemBookDataList: BookDataList) => {
                                this.setState({ filesystemBookDataList: filesystemBookDataList });
                            })
                            .catch((err: any) => {
                                console.log(err);
                            })
                    });
                break;
            case 'saveBook':
                this.props.model.saveActiveBookToFilesystem();
                break;
            case 'showFiles':
                if (AppSettings.userBookDataPath) {
                    shell.showItemInFolder(AppSettings.userBookDataPath);
                }
                break;
            case 'signOut':
                this.props.model.signOut();
                this.setState({ loggedIn: false, bookLoaded: false, cloudBookDataList: undefined });
                break;

        }
    }

    onAppSettingsClick(event: any): void {
        let nativeEvent: any = event.nativeEvent;
        switch ( nativeEvent.target.id ) {
            case 'titlebar':
                WindowComponent.bringWindowToFrontWithId('appSettingsPanel');
                break;
            case 'titlebar-close':
                WindowComponent.closeWithId('appSettingsPanel');
                this.setState({showAppSettingsPanel: false});
                break;
            case 'saveSettings':
                this.props.model.saveAppSettings();
                WindowComponent.closeWithId('appSettingsPanel');
                this.setState({showAppSettingsPanel: false});
                break;
            case 'reloadSettings':
                this.props.model.reloadAppSettings()
                    .then((obj: any) => { // TODO: is this needed
                        let appSettings: AppSettings = this.props.model.appSettings;
                        this.setState({appSettings: appSettings});
                    })
                break;
            case 'showSettings':
                if (AppSettings.userDataPath) {
                    shell.showItemInFolder(AppSettings.userDataPath);
                }
                break;
        }
    }

    onAppSettingsInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        let appSettings: AppSettings = this.props.model.appSettings;
        switch(nativeEvent.target.name) {
            case 'nluDialogflow_projectId':
                appSettings.nluDialogflow_projectId = nativeEvent.target.value;
                break;
            case 'nluDialogflow_privateKey':
                //NOTE parsing the key fixes newline issues
                try {
                    let keyData = JSON.parse(`{ "key": "${nativeEvent.target.value}"}`);
                    appSettings.nluDialogflow_privateKey = keyData.key;
                    break;
                } catch(err) {
                    console.log(err);
                }
                break;
            case 'nluDialogflow_clientEmail':
                appSettings.nluDialogflow_clientEmail = nativeEvent.target.value;
                break;
        }
        // TODO: is this needed?
        this.setState({appSettings: appSettings});
    }


    onButtonClick(sectionId: string, buttonId: string): void {
        switch ( buttonId) {
            case 'recordButton':
                this.props.model.startRecord();
                break;
            case 'endRecordButton':
                this.props.model.endRecord()
                    .then((audioFileInfo: AudioFileInfo) => {
                        // this.props.model.onAudioFileSaved(audioFileInfo);
                        if (this.state.activePage) {
                            toBuffer(audioFileInfo.blob, (err, buffer) => {
                                if (err) throw err
                                let base64data = buffer.toString('base64');
                                console.log(`BASE64 AUDIO STRING LENGTH = ${base64data.length}`);
                                this.props.model.activePage.audio = base64data;
                                this.setState({activePage: this.props.model.activePage});
                            });
                        }
                    })
                    .catch((err: any) => {
                        console.log(err);
                    })
                break;
            case 'processAudio':
                this.processAudio();
                break;
            case 'backButton':
                break;
            case 'nextButton':
                break;
        }
    }

    onSideNavClick(event: any, thumbnail: PageThumbnail): void {
        console.log(`onSideNavClick: `, thumbnail);
        let nativeEvent: any = event.nativeEvent;
        this.props.model.selectPage(thumbnail.props.page);
        this.setState({activePage: this.props.model.activePage});
    }

    onCloudBookListClick(event: any, bookUUID: string, version: string): void {
        let nativeEvent: any = event.nativeEvent;
        console.log(`onCloudBookListClick: `, nativeEvent.target.id, nativeEvent.target.name, bookUUID, version);
        if (bookUUID == "newBook") {
            this.props.model.newBook();
            this.setState({ loggedIn: true, bookLoaded: true, activePage: this.props.model.activePage });
        } else {
            this.props.model.retrieveBookFromCloudWithUUID(bookUUID, version)
                .then((book: Book) => {
                    console.log(`Application: onCloudBookListClick: book: `, book, this.props.model.activePage);
                    this.setState({ loggedIn: true, bookLoaded: true, activePage: this.props.model.activePage});
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    }

    onFilesystemBookListClick(event: any, bookUUID: string, version: string): void {
        let nativeEvent: any = event.nativeEvent;
        console.log(`onFilesystemBookListClick: `, nativeEvent.target.id, nativeEvent.target.name, bookUUID, version);
        if (bookUUID == "newBook") {
            this.props.model.newBook();
            this.setState({ loggedIn: true, bookLoaded: true, activePage: this.props.model.activePage });
        } else {
            this.props.model.loadBookFromFilesystemWithUUID(bookUUID, version)
                .then((book: Book) => {
                    console.log(`Application: onFilesystemBookListClick: book: `, book, this.props.model.activePage);
                    this.setState({ loggedIn: true, bookLoaded: true, activePage: this.props.model.activePage});
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    }

    handlePageInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        console.log(`handlePageInputChange: `, nativeEvent.target.id)
        switch(nativeEvent.target.id) {
            case 'nameTextInput':
                this.props.model.activeBook.name = nativeEvent.target.value;
                this.setState({activePage: this.props.model.activePage});
                break;
            case 'titleTextInput':
                this.props.model.activePage.title = nativeEvent.target.value;
                this.setState({activePage: this.props.model.activePage});
                break;
            case 'storyTextAreaInput':
                this.props.model.activePage.text = nativeEvent.target.value;
                this.setState({activePage: this.props.model.activePage});
                break;
            case 'transcriptTextAreaInput':
                this.props.model.activePage.audioTranscript = nativeEvent.target.value;
                this.setState({activePage: this.props.model.activePage});
                break;
        }
    }

    handleUploadFileList(fileList: any[]): void {
        let fileListLength: number = fileList.length;
        for (var i = 0; i < fileListLength; i++) {
            var file = fileList[i];
            // console.log('... file[' + i + '].name = ' + file.name, file);
            this.handleUploadFile(file);
        }
    }

    handleUploadFile(file: any): void {
        let fileExtension: string = this.getFileExtension(file.path);
        switch(fileExtension) {
            case 'png':
            case 'jpg':
            case 'jpeg':
                Jimp.read(file.path)
                    .then(image => {
                        console.log(image)
                        image.quality(60)
                            .getBase64Async(Jimp.MIME_JPEG)
                                .then((base64data: string) => {
                                    let parts: string[] = base64data.split('base64,');
                                    if (parts && parts.length == 2) base64data = parts[1]
                                    console.log(`BASE64 IMAGE STRING LENGTH = ${base64data.length}`);
                                    this.props.model.activePage.image = base64data;
                                    this.setState({activePage: this.props.model.activePage});
                                })
                        // let newImage: any = image.cover(500, 500)
                        //     .quality(60)
                        //     .getBase64Async(Jimp.MIME_JPEG)
                        //         .then((base64data: string) => {
                        //             this.props.model.activePage.image = base64data;
                        //             this.setState({activePage: this.props.model.activePage});
                        //         })
                    })
                    .catch(err => {
                        console.log(err);
                    });
                break;
            case 'wav':
                let audioFile = fs.readFileSync(file.path);
                let base64data = audioFile.toString('base64');
                console.log(`BASE64 AUDIO STRING LENGTH = ${base64data.length}`);
                this.props.model.activePage.audio = base64data;
                this.setState({activePage: this.props.model.activePage});
                break;
            case 'json':
                let jsonFile = fs.readFileSync(file.path);
                let jsonObject
                try {
                    jsonObject = JSON.parse(jsonFile);
                    switch (jsonObject.type) {
                        case 'wordTimings':
                            this.props.model.activePage.timestamps = jsonObject.timestamps;
                            this.props.model.activePage.audioTranscript = jsonObject.audioTranscript;
                            console.log(`uploaded word timings:`, this.props.model.activePage);
                            this.setState({activePage: this.props.model.activePage});
                            break;
                        case 'sceneObjects':
                            break;
                        case 'triggers':
                            break;
                    }
                } catch (error) {
                    console.log(error);
                }

                break;
        }

    }

    getFileExtension(filename) {
        var idx = filename.lastIndexOf('.');
        return (idx < 1) ? "" : filename.substr(idx + 1);
    }

    processAudio(): void {
        let options: GoogleSTTControllerOptions = {
            audioBase64Data: this.props.model.activePage.audio
        }
        let clientConfig: ClientConfig = {
            credentials: {
                private_key: this.props.model.appSettings.nluDialogflow_privateKey,
                client_email: this.props.model.appSettings.nluDialogflow_clientEmail
            },
            projectId: this.props.model.appSettings.nluDialogflow_projectId
        }
        let sttController:GoogleSTTController = new GoogleSTTController(clientConfig, options);
        sttController.processAudioFile()
            .then((response: GoogleSTTResponse) => {
                // console.log(response.words);
                if (response.words) {
                    let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(response.words, this.props.model.activePage.text);
                    console.log(googleSTTWordTimingAdjuster.alignedWords.result);
                    this.props.model.activePage.timestamps = googleSTTWordTimingAdjuster.alignedWords.result;
                    this.props.model.activePage.audioTranscript = response.transcript;
                    this.setState({activePage: this.props.model.activePage});
                }
                // let resultFormatted: string = prettyjson.render(response.words, { noColor: true });
                // this.setState({ ASRResult: response.transcript, log: `${resultFormatted}\n\n****\n\n${this.state.log}` });
            })
            .catch(err => {
                console.log(err);
            });
    }



    layout(): any {
        let layout;
        let appSettingsPanel: JSX.Element | null = this.state.showAppSettingsPanel ? <AppSettingsPanel clickHandler={this.onAppSettingsClick.bind(this)} changeHandler={this.onAppSettingsInputChange.bind(this)} appSettings={this.props.model.appSettings}/> : null;

        if (!this.state.loggedIn) {
            layout = <Login model={this.props.model} clickHandler={this.onLoginClick.bind(this)} />
        } else if (!this.state.bookLoaded){
            layout = <div>
                <BookList clickHandler={this.onCloudBookListClick.bind(this)} bookDataList={this.state.cloudBookDataList}/>
                <BookList clickHandler={this.onFilesystemBookListClick.bind(this)} bookDataList={this.state.filesystemBookDataList}/>
            </div>
        } else {
            let pageArray: Page[] = [];
            if (this.props.model.activeBook) {
                pageArray = this.props.model.activeBook.pageArray

                let pageType;
                // if (this.state.activePage.pageNumber == 0) {
                //     pageType = <TitlePage clickHandler={this.onButtonClick.bind(this)} changeHandler={this.handlePageInputChange.bind(this)} fileHandler={this.handleUploadFileList.bind(this)} page={this.state.activePage}/>
                // } else {
                    pageType = <MainPage clickHandler={this.onButtonClick.bind(this)} changeHandler={this.handlePageInputChange.bind(this)} fileHandler={this.handleUploadFileList.bind(this)} page={this.state.activePage} book={this.props.model.activeBook}/>
                // }
                layout = <div>
                    <TopNav  clickHandler={this.onTopNavClick.bind(this)} />
                    {appSettingsPanel}
                    <SideNav pageArray={pageArray} clickHandler={this.onSideNavClick.bind(this)} activePage={this.state.activePage}/>
                    {pageType}
                </div>
            } else {
                layout = <div>
                    <TopNav  clickHandler={this.onTopNavClick.bind(this)} />
                    {appSettingsPanel}
                </div>
            }
        }
        return layout;
    }

    render() {
        return(
            this.layout()
        );
    }
}
