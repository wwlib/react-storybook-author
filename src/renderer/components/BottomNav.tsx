import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";

export interface BottomNavProps { }
export interface BottomNavState { }

export default class BottomNav extends React.Component<BottomNavProps, BottomNavState> {


    componentWillMount() {
        this.setState({});
    }

    componentDidMount() {
    }

    onButtonClicked(action: string): void {
        // console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'action':
                break;
        }
    }

    //onchange="angular.element(this).scope().uploadImage(this.files)"
    //onchange="angular.element(this).scope().saveAudioFile(this.files)"

    render() {
        return (
            <div _ngcontent-c0="" className="bottomNav">
                <div _ngcontent-c0="" className="bottomButtons">
                    <div _ngcontent-c0="" className="bottomLeftButtons">
                        <button _ngcontent-c0="" className="arrow" id="backButton" ng-reflect-ng-style="[object Object]" style={{ visibility: "visible" }}></button>
                    </div>
                    <div _ngcontent-c0="" className="bottomCenterButtons">
                        <button _ngcontent-c0="" id="recordButton"></button>

                        <p _ngcontent-c0="" style={{ verticalAlign: "middle", margin: "2px" }}>or</p>

                        <button _ngcontent-c0="" id="uploadAudioButton"></button>
                        <input _ngcontent-c0="" accept="audio/wav" id="uploadAudioFileInput" ng-file-select="onFileSelect($files)" type="file" />

                    </div>
                    <div _ngcontent-c0="" className="bottomRightButtons">
                        <button _ngcontent-c0="" className="arrow" id="nextButton"></button>
                    </div>
                </div>
            </div>
        );
    }
}
