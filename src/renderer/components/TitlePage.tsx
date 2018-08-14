import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import BottomNav from './BottomNav';

export interface TitlePageProps { }
export interface TitlePageState { }

export default class TitlePage extends React.Component<TitlePageProps, TitlePageState> {


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
            <div _ngcontent-c0="" id="mainPage" ng-reflect-ng-style="[object Object]" style={{ width: "1097px", height: "500px" }}>

                <div _ngcontent-c0="" id="mainPageTopTitle">
                    <div _ngcontent-c0="" id="titlePageTopContainer">
                        <div _ngcontent-c0="" id="titlePageImage">
                            <button _ngcontent-c0="" className="imageUploadButton"></button>

                        </div>
                        <div _ngcontent-c0="" id="titlePageTargetWords">
                            <button _ngcontent-c0="" id="addTargetWordButton">Add Target Word</button>
                        </div>
                    </div>
                    <div _ngcontent-c0="" id="titlePageBottomContainer">
                        <input value={''} _ngcontent-c0="" id="titleTextInput" ng-reflect-model="" placeholder="Enter a story title..." className="ng-untouched ng-pristine ng-valid" />
                    </div>
                </div>

                <div _ngcontent-c0="" id="mainPageBottom">
                    <div _ngcontent-c0="" id="pageNumber"> Title Page </div>
                </div>

                <BottomNav />

            </div>
        );
    }
}
