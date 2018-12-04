import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";

export interface BottomNavProps { clickHandler: any, fileHandler: any }
export interface BottomNavState { }

export default class BottomNav extends React.Component<BottomNavProps, BottomNavState> {


    componentWillMount() {
        this.setState({});
    }

    componentDidMount() {
    }

    onButtonClicked(event: any) {
        let nativeEvent: any = event.nativeEvent;
        this.props.clickHandler('bottomNav', nativeEvent.target.id);
    }

    onUploadButtonClick(event: any): void {
        let inputElement = document.getElementById("uploadAudioFileInput");
        if (inputElement) {
            inputElement.click();
        }
    }

    onFileInputChange(event: any): void {
        var fileList = event.target.files
        this.props.fileHandler(fileList);
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

                        <button id="uploadAudioButton" onClick={this.onUploadButtonClick.bind(this)}></button>
                        <input type="file" id="uploadAudioFileInput" name="file" accept="audio/wav" multiple style={{ display: 'none' }} onChange={this.onFileInputChange.bind(this)}/>


                    </div>
                    <div className="bottomRightButtons">
                        <button className="arrow" id="nextButton"></button>
                    </div>
                </div>
            </div>
        );
    }
}
