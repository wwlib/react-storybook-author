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

export interface ApplicationProps { model: Model }
export interface ApplicationState { pageArray: Page[] }

export default class Application extends React.Component < ApplicationProps, ApplicationState > {

    componentWillMount() {
        this.setState({ });

    }

    componentDidMount() {
    }

    onLoginClick(event: any): void {
        let nativeEvent: any = event.nativeEvent;
        switch ( nativeEvent.target.id) {
            case 'signin':

                break;
            case 'signout':
                break
        }
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

    render() {
        let pageArray: Page[] = [];
        if (this.props.model.activeBook) {
            pageArray = this.props.model.activeBook.pageArray
        }
        return(
            <div>
                <TopNav clickHandler={this.onTopNavClick.bind(this)} />
                <SideNav pageArray={pageArray} clickHandler={this.onSideNavClick.bind(this)}/>
                <TitlePage bottomNavClickHandler={this.onBottomNavClick.bind(this)}/>
            </div>
        );
    }
}
