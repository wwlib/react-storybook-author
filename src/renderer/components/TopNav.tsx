import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Model from '../model/Model';

export interface TopNavProps { model: Model }
export interface TopNavState { }

export default class TopNav extends React.Component<TopNavProps, TopNavState> {


    componentWillMount() {
        this.setState({});
    }

    componentDidMount() {
    }

    onButtonClicked(action: string): void {
        // console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'addPage':
                this.props.model.addNewPage();
                break;
            case 'deletePage':
                break;
            case 'hideSceneObjects':
                break;
        }
    }

    render() {
        return (
            <div className="topNav">
                <div className="topButtons">
                    <div className="topLeftButtons"><button id="addPageButton" onClick={this.onButtonClicked.bind(this, "addPage")} />
                        <button id="deletePageButton" onClick={this.onButtonClicked.bind(this, "deletePage")} />
                        <button className="toggleSceneObjectsButton" id="hideSceneObjectsButton" onClick={this.onButtonClicked.bind(this, "hideSceneObjects")} />
                    </div>
                    <div className="topRightButtons">
                        <button id="submitButton"></button>
                    </div>
                </div>
            </div>
        );
    }
}
