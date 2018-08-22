import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Model from '../model/Model';
import Login from './Login';

export interface CloudBookListProps { clickHandler: any, bookArray: any[] }
export interface CloudBookListState { }

export default class CloudBookList extends React.Component<CloudBookListProps, CloudBookListState> {

    componentWillMount() {
        this.setState({});
    }

    componentDidMount() {
    }

    onButtonClicked(event: any) {
        let nativeEvent: any = event.nativeEvent;
        this.props.clickHandler(event, nativeEvent.target.id);
    }

    books(): JSX.Element[] {
        let result: JSX.Element[] = [];
        if (this.props.bookArray) {
            this.props.bookArray.forEach((book: any) => {
                let button = <ReactBootstrap.Button bsStyle={"info"} key={book.uuid} id={book.uuid} style={{width: 300}}>{book.uuid}</ReactBootstrap.Button>
                result.push(button);
            })
        }
        return result;
    }

    render() {
        return (
            <div className="cloudBookList" onClick={this.onButtonClicked.bind(this)} >
                <ReactBootstrap.ButtonGroup vertical style = {{width: 320}}>
                    {this.books()}
                    <ReactBootstrap.Button bsStyle={"info"} key={'newBook'} id={'newBook'} style={{width: 300}}>New Book</ReactBootstrap.Button>
                </ReactBootstrap.ButtonGroup>
            </div>
        );
    }
}
