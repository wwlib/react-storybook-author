import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import BottomNav from './BottomNav';
import Page from '../model/Page';

export interface TitlePageProps { bottomNavClickHandler: any, changeHandler: any, page: Page }
export interface TitlePageState { }

export default class TitlePage extends React.Component<TitlePageProps, TitlePageState> {


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
        this.forceUpdate();
    }

    //onchange="angular.element(this).scope().uploadImage(this.files)"
    //onchange="angular.element(this).scope().saveAudioFile(this.files)"

    render() {
        return (
            <div id="mainPage" style={{ width: "1097px", height: "500px" }}>

                <div id="mainPageTopTitle">
                    <div id="titlePageTopContainer">
                        <div id="titlePageImage">
                            <button className="imageUploadButton"></button>

                        </div>
                        <div id="titlePageTargetWords">
                            <button id="addTargetWordButton">Add Target Word</button>
                        </div>
                    </div>
                    <div id="titlePageBottomContainer">
                        <input value={this.props.page.title} id="titleTextInput" placeholder="Enter a story title..." className="ng-untouched ng-pristine ng-valid"
                            onChange={this.handleInputChange.bind(this)}/>
                    </div>
                </div>

                <div id="mainPageBottom">
                    <div id="pageNumber"> Title Page </div>
                </div>

                <BottomNav clickHandler={this.onBottomNavButtonClicked.bind(this)} />

            </div>
        );
    }
}
