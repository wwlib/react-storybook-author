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

const {dialog, shell} = require('electron').remote;
const Jimp = require('jimp');

export interface ApplicationProps { model: Model }
export interface ApplicationState { pageArray: Page[], loggedIn: boolean, bookLoaded: boolean, cloudBookDataList: BookDataList | undefined, filesystemBookDataList: BookDataList | undefined, activePage: Page }

export default class Application extends React.Component < ApplicationProps, ApplicationState > {

    componentWillMount() {
        this.setState({ loggedIn: false, bookLoaded: false, cloudBookDataList: undefined });
    }

    componentDidMount() {
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

    onBottomNavClick(event: any): void {
        let nativeEvent: any = event.nativeEvent;
        console.log(`onBottomeNavClick: `, nativeEvent.target.id);
        switch ( nativeEvent.target.id) {
            case 'recordButton':
                this.props.model.startRecord();
                break;
            case 'endRecordButton':
                this.props.model.endRecord();
                break;
            case 'uploadAudioButton':
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
            this.setState({ loggedIn: true, bookLoaded: true });
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
            this.setState({ loggedIn: true, bookLoaded: true });
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
            case 'titleTextInput':
                this.props.model.activePage.title = nativeEvent.target.value;
                this.setState({activePage: this.props.model.activePage});
                break;
            case 'storyTextAreaInput':
                this.props.model.activePage.text = nativeEvent.target.value;
                this.setState({activePage: this.props.model.activePage});
                break;
        }
    }

    handlePageImageLoad(imageBase64: string, file: any): void {
        // let imageBuffer = new Buffer(imageURL, 'base64');
        console.log(file);
        Jimp.read(file.path)
            .then(image => {
                console.log(image);
                let newImage: any = image.cover(500, 500)
                    .quality(60)
                    .getBase64Async(Jimp.MIME_JPEG)
                        .then((base64data: string) => {
                            this.props.model.activePage.image = base64data;
                            this.setState({activePage: this.props.model.activePage});
                        })
                // let base64data: string = new Buffer(newImage.buffer).toString('base64');
                // this.props.model.activePage.image = base64data;
            })
            .catch(err => {
                console.log(err);
            });
    }


    layout(): any {
        let layout;
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
            }
            let pageType;
            if (this.state.activePage.pageNumber == 0) {
                pageType = <TitlePage bottomNavClickHandler={this.onBottomNavClick.bind(this)} changeHandler={this.handlePageInputChange.bind(this)} page={this.state.activePage}/>
            } else {
                pageType = <MainPage bottomNavClickHandler={this.onBottomNavClick.bind(this)} changeHandler={this.handlePageInputChange.bind(this)} imageHandler={this.handlePageImageLoad.bind(this)} page={this.state.activePage}/>
            }
            layout = <div>
                <TopNav  clickHandler={this.onTopNavClick.bind(this)} />
                <SideNav pageArray={pageArray} clickHandler={this.onSideNavClick.bind(this)} activePage={this.state.activePage}/>
                {pageType}
            </div>
        }
        return layout;
    }

    render() {
        return(
            this.layout()
        );
    }
}
