import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Model from '../model/Model';
import Page from '../model/Page';
import TopNav from './TopNav';
import SideNav from './SideNav';
import MainPage from './MainPage';
import TitlePage from './TitlePage';

export interface ApplicationProps { model: Model }
export interface ApplicationState { pageArray: Page[] }

export default class Application extends React.Component < ApplicationProps, ApplicationState > {


    componentWillMount() {
        this.setState({ });
    }

    componentDidMount() {
    }

    onTopNavClick(event: any): void {
        let nativeEvent: any = event.nativeEvent;
        // console.log(`Application: onTopNavClick: `, event, arguments);
        // console.log(nativeEvent.target, nativeEvent.target.id, nativeEvent.target.name, nativeEvent.target.value)
        switch ( nativeEvent.target.id) {
            case 'addPageButton':
                this.props.model.addNewPage();
                this.setState({ pageArray: this.props.model.activeBook.pageArray})
                break;
            case 'deletePageButton':
                break;
            case 'hideSceneObjectsButton':
                break;
        }
    }

    render() {
        let pageArray: Page[] = [];
        if (this.props.model.activeBook) {
            pageArray = this.props.model.activeBook.pageArray
        }
        return(
            <div>
                <TopNav clickHandler={this.onTopNavClick.bind(this)} />
                <SideNav pageArray={pageArray} />
                <TitlePage />
                Hello
            </div>
        );
    }
}
