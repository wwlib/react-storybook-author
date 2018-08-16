import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Model from '../model/Model';
import Page from '../model/Page';
import PageThumbnail from './PageThumbnail';

export interface SideNavProps { pageArray: Page[], clickHandler: any }
export interface SideNavState { }; //pageArray: Page[] }

export default class SideNav extends React.Component<SideNavProps, SideNavState> {

    componentWillMount() {
        // this.setState({ pageArray: [] });
    }

    componentWillReceiveProps(nextProps: SideNavProps) {
        // console.log(`componentWillReceiveProps: `, nextProps);
        // if (this.props.pageArray != nextProps.pageArray) {
        //     this.setState({ pageArray: nextProps.pageArray });
        // }
    }

    // static getDerivedStateFromProps(nextProps, prevState) {
    //     console.log(`getDerivedStateFromProps: `);
    //     if (nextProps.pageArray !== prevState.pageArray) {
    //         return { pageArray: nextProps.pageArray };
    //     }
    //     else return null;
    // }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    thumbnails(): JSX.Element[] {
        let result: JSX.Element[] = [];
        if (this.props.pageArray) {
            this.props.pageArray.forEach((page: Page) => {
                result.push(<PageThumbnail key={page.uuid} page={page} clickHandler={this.props.clickHandler}/>);
            })
        }
        return result;
    }

    render() {
        return (
            <div _ngcontent-c0="" className="sideNav">
                {this.thumbnails()}
            </div>
        );
    }
}
