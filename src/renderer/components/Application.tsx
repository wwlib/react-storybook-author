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
import CloudBookList from './CloudBookLIst';
import { BookDataList } from '../model/BookManager';
import Book from '../model/Book';

export interface ApplicationProps { model: Model }
export interface ApplicationState { pageArray: Page[], loggedIn: boolean, bookLoaded: boolean, bookDataList: BookDataList | undefined }

export default class Application extends React.Component < ApplicationProps, ApplicationState > {

    componentWillMount() {
        this.setState({ loggedIn: false, bookLoaded: false, bookDataList: undefined });
    }

    componentDidMount() {
    }

    onLoginClick(username: string, password): void {
        console.log(`Application: onLoginClick`);
        this.props.model.login(username, password)
            .then((bookDataList: BookDataList) => {
                this.setState({ loggedIn: true, bookLoaded: false, bookDataList: bookDataList });
            });
    }

    onTopNavClick(event: any): void {
        let nativeEvent: any = event.nativeEvent;
        // console.log(`Application: onTopNavClick: `, event, arguments);
        // console.log(nativeEvent.target, nativeEvent.target.id, nativeEvent.target.name, nativeEvent.target.value)
        switch ( nativeEvent.target.id) {
            case 'addPageButton':
                this.props.model.addNewPage();
                this.setState({ pageArray: this.props.model.activeBook.pageArray});
                break;
            case 'deletePageButton':
                this.props.model.deletePage();
                this.setState({ pageArray: this.props.model.activeBook.pageArray});
                break;
            case 'hideSceneObjectsButton':
                break;
            case 'submitButton':
                this.props.model.saveActiveBookToCloud();
                break;
            case 'loadBook':
            this.props.model.retrieveBooklistFromCloudWithAuthor()
                .then((bookDataList: BookDataList) => {
                    this.setState({ loggedIn: true, bookLoaded: false, bookDataList: bookDataList });
                });
                break;
            case 'signOut':
                this.props.model.signOut();
                this.setState({ loggedIn: false, bookLoaded: false, bookDataList: undefined });
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
                    this.setState({ loggedIn: true, bookLoaded: true });
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
                break;
            case 'password':
                break;
        }
    }


    layout(): any {
        let layout;
        if (!this.state.loggedIn) {
            layout = <Login model={this.props.model} clickHandler={this.onLoginClick.bind(this)} />
        } else if (!this.state.bookLoaded){
            // let bookDataList = [{storybookId: "one"}, {storybookId: "two"}, {storybookId: "three"}];
            layout = <CloudBookList clickHandler={this.onCloudBookListClick.bind(this)} bookDataList={this.state.bookDataList}/>
        } else {
            let pageArray: Page[] = [];
            if (this.props.model.activeBook) {
                pageArray = this.props.model.activeBook.pageArray
            }
            layout = <div>
                <TopNav  clickHandler={this.onTopNavClick.bind(this)} />
                <SideNav pageArray={pageArray} clickHandler={this.onSideNavClick.bind(this)}/>
                <TitlePage bottomNavClickHandler={this.onBottomNavClick.bind(this)} changeHandler={this.handlePageInputChange.bind(this)} page={this.props.model.activePage}/>
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
