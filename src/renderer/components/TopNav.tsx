import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Login from './Login';

export interface TopNavProps { clickHandler: any }
export interface TopNavState { }

export default class TopNav extends React.Component<TopNavProps, TopNavState> {

    componentWillMount() {
        this.setState({});
    }

    componentDidMount() {
    }

    onButtonClicked(event: any) {
        this.props.clickHandler(event);
    }

    render() {
        return (
            <div className="topNav" onClick={this.onButtonClicked.bind(this)} >
                <div className="topButtons">
                    <div className="topLeftButtons">
                        <button id="addPageButton" />
                        <button id="deletePageButton" />
                        <button className="toggleSceneObjectsButton" id="hideSceneObjectsButton" />
                    </div>
                    <div className="topRightButtons">
                        <button id="submitButton" />
                        <ReactBootstrap.Button bsStyle={"info"} key={"loadBook"} id={"loadBook"} style={{width: 80}}>Load</ReactBootstrap.Button>
                        <ReactBootstrap.Button bsStyle={"info"} key={"signOut"} id={"signOut"} style={{width: 80}}>signOut</ReactBootstrap.Button>
                    </div>
                </div>
            </div>
        );
    }
}
