import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Model from '../model/Model';
import Page from '../model/Page';
import PageThumbnail from './PageThumbnail';


export interface SideNavProps { model: Model }
export interface SideNavState { pageArray: Page[] }

export default class SideNav extends React.Component<SideNavProps, SideNavState> {

    private _onModelUpdateHandler: any = this.onModelUpdateHandler.bind(this);

    componentWillMount() {
        this.setState({});
        this.props.model.on('updateModel', this._onModelUpdateHandler);
    }

    onModelUpdateHandler(): void {
        this.setState({ pageArray: this.props.model.activeBook.pageArray});
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        this.props.model.removeListener('updateModel', this._onModelUpdateHandler);
    }

    onButtonClicked(action: string): void {
        // console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'action':
                break;
        }
    }

    thumbnails(): JSX.Element[] {
        let result: JSX.Element[] = [];
        if (this.state.pageArray) {
            this.state.pageArray.forEach((page: Page) => {
                result.push(<PageThumbnail key={page.uuid}/>);
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
