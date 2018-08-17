import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";

export interface BottomNavProps { clickHandler: any }
export interface BottomNavState { }

export default class BottomNav extends React.Component<BottomNavProps, BottomNavState> {


    componentWillMount() {
        this.setState({});
    }

    componentDidMount() {
    }

    onButtonClicked(event: any) {
        this.props.clickHandler(event);
    }

    //onchange="angular.element(this).scope().uploadImage(this.files)"
    //onchange="angular.element(this).scope().saveAudioFile(this.files)"

    render() {
        return (
            <div className="bottomNav" onClick={this.onButtonClicked.bind(this)} >
                <div className="bottomButtons">
                    <div className="bottomLeftButtons">
                        <button className="arrow" id="backButton" style={{ visibility: "visible" }}></button>
                    </div>
                    <div className="bottomCenterButtons">
                        <button id="recordButton"></button>
                        <button id="endRecordButton"></button>

                        <p style={{ verticalAlign: "middle", margin: "2px" }}>or</p>

                        <button id="uploadAudioButton"></button>
                        <input accept="audio/wav" id="uploadAudioFileInput" type="file" />

                    </div>
                    <div className="bottomRightButtons">
                        <button className="arrow" id="nextButton"></button>
                    </div>
                </div>
            </div>
        );
    }
}
