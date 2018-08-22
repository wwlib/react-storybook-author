import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Model from '../model/Model';
import Login from './Login';

export interface CloudBookListProps { clickHandler: any, bookVersions: any[] }
export interface CloudBookListState { }

export default class CloudBookList extends React.Component<CloudBookListProps, CloudBookListState> {

    componentWillMount() {
        this.setState({});
    }

    componentDidMount() {
    }

    onButtonClicked(event: any) {
        let nativeEvent: any = event.nativeEvent;
        let idParts: string[] = nativeEvent.target.id.split(',');
        let bookUUID: string = idParts[0];
        let version: string = idParts[1];
        this.props.clickHandler(event ,bookUUID, version);
    }

    books(): JSX.Element[] {
        let result: JSX.Element[] = [];
        if (this.props.bookVersions) {
            this.props.bookVersions.forEach((version: any) => {
                let id: string = `${version.StorybookId},${version.Timestamp}`;
                let label: string = `${version.StorybookId} - (${version.Timestamp})`;
                let button = <ReactBootstrap.Button bsStyle={"info"} key={id} name={id} id={id} style={{width: 600}}>{label}</ReactBootstrap.Button>
                result.push(button);
            })
        }
        return result;
    }

    render() {
        return (
            <div className="cloudBookList" onClick={this.onButtonClicked.bind(this)} >
                <ReactBootstrap.ButtonGroup vertical style = {{width: 620}}>
                    {this.books()}
                    <ReactBootstrap.Button bsStyle={"info"} key={'newBook'} id={'newBook'} style={{width: 300}}>New Book</ReactBootstrap.Button>
                </ReactBootstrap.ButtonGroup>
            </div>
        );
    }
}
