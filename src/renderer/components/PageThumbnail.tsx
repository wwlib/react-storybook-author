import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";

export interface PageThumbnailProps { }
export interface PageThumbnailState { }

export default class PageThumbnail extends React.Component<PageThumbnailProps, PageThumbnailState> {


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
        );
    }
}
