import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import BottomNav from './BottomNav';

export interface MainPageProps { bottomNavClickHandler: any }
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

    //onchange="angular.element(this).scope().uploadImage(this.files)"
    //onchange="angular.element(this).scope().saveAudioFile(this.files)"

    render() {
        return (
            <div id="mainPage" style={{ width: "1097px", height: "500px" }}>
                <div _ngcontent-c0="" id="mainPageTopStory">
                    <div _ngcontent-c0="" id="imageContainer">
                        <button _ngcontent-c0="" className="imageUploadButton"></button>
                        <input _ngcontent-c0="" accept="image/*" id="uploadImageFileInput" ng-file-select="onFileSelect($files)" type="file" />

                    </div>
                    <div _ngcontent-c0="" id="textContainer">
                        <textarea value={''} _ngcontent-c0="" id="storyTextAreaInput" rows={5} ng-reflect-model="" placeholder="Type to enter page content..." className="ng-untouched ng-pristine ng-valid" />
                        <div _ngcontent-c0="" id="promptContainer">
                            <div _ngcontent-c0="" className="addPromptContainer">
                                <button _ngcontent-c0="" id="addPromptButton"></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div _ngcontent-c0="" id="mainPageBottom">
                    <div _ngcontent-c0="" id="pageNumber"> Page 1 </div>
                </div>

                <BottomNav clickHandler={this.onBottomNavButtonClicked.bind(this)} />

            </div>
        );
    }
}
