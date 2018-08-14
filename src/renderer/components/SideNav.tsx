import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";

export interface SideNavProps { }
export interface SideNavState { }

export default class SideNav extends React.Component<SideNavProps, SideNavState> {


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
            <div _ngcontent-c0="" className="sideNav">

                <div _ngcontent-c0="" className="preview">
                    <div _ngcontent-c0="" className="preview-white-background" ng-reflect-ng-style="[object Object]" style={{ border: 'none' }}>
                        <div _ngcontent-c0="" className="preview-image-container">
                            <img _ngcontent-c0="" className="preview-thumbnail" src="assets/previewBlock.png" />
                        </div>
                        <div _ngcontent-c0="" className="preview-text-container">
                            <p _ngcontent-c0=""></p>
                        </div>
                    </div>
                </div>
                <div _ngcontent-c0="" className="preview">
                    <div _ngcontent-c0="" className="preview-white-background" ng-reflect-ng-style="[object Object]" style={{ border: "1pt solid blue" }}>
                        <div _ngcontent-c0="" className="preview-image-container">
                            <img _ngcontent-c0="" className="preview-thumbnail" src="assets/previewBlock.png" /></div>
                        <div _ngcontent-c0="" className="preview-text-container">
                            <p _ngcontent-c0=""></p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
