import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Model from '../model/Model';

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
                    <div className="topLeftButtons"><button id="addPageButton" />
                        <button id="deletePageButton" />
                        <button className="toggleSceneObjectsButton" id="hideSceneObjectsButton" />
                    </div>
                    <div className="topRightButtons">
                        <button id="submitButton" />
                    </div>
                </div>
            </div>
        );
    }
}
