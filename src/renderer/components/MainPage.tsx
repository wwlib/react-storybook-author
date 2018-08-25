import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import BottomNav from './BottomNav';
import Page from '../model/Page';

export interface MainPageProps { bottomNavClickHandler: any, changeHandler: any, page: Page }
export interface MainPageState { }

export default class MainPage extends React.Component<MainPageProps, MainPageState> {


    componentWillMount() {
        this.setState({});
    }

    componentDidMount() {
    }

    onBottomNavButtonClicked(event: any): void {
        this.props.bottomNavClickHandler(event);
    }

    handleInputChange(event: any) {
        this.props.changeHandler(event);
    }

    //onchange="angular.element(this).scope().uploadImage(this.files)"
    //onchange="angular.element(this).scope().saveAudioFile(this.files)"

    render() {
        return (
            <div id="mainPage" style={{ width: "1097px", height: "500px" }}>

                <div id="mainPageTopStory">
                    <div id="imageContainer">
                        <button className="imageUploadButton"></button>
                        <input accept="image/*" id="uploadImageFileInput" ng-file-select="onFileSelect($files)" type="file" />

                    </div>
                    <div id="textContainer">
                        <textarea value={this.props.page.text} id="storyTextAreaInput" rows={5} placeholder="Type to enter page content..." className="ng-untouched ng-pristine ng-valid"
                            onChange={this.handleInputChange.bind(this)}/>
                        <div id="promptContainer">
                            <div className="addPromptContainer">
                                <button id="addPromptButton"></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="mainPageBottom">
                    <div id="pageNumber"> Page 1 </div>
                </div>

                <BottomNav clickHandler={this.onBottomNavButtonClicked.bind(this)} />

            </div>
        );
    }
}
