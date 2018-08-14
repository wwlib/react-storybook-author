import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";

export interface TopNavProps { }
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
            case 'action':
                break;
        }
    }

    render() {
        return (
            <div _ngcontent-c0="" className="topNav">
                <div _ngcontent-c0="" className="topButtons">
                    <div _ngcontent-c0="" className="topLeftButtons"><button _ngcontent-c0="" id="addPageButton"></button>
                        <button _ngcontent-c0="" id="deletePageButton"></button>
                        <button _ngcontent-c0="" className="toggleSceneObjectsButton" id="hideSceneObjectsButton"></button>
                    </div>
                    <div _ngcontent-c0="" className="topRightButtons">
                        <button _ngcontent-c0="" id="submitButton"></button>
                    </div>
                </div>
            </div>
        );
    }
}
