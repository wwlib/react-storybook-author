import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Page from '../model/Page';

export interface PageThumbnailProps { page: Page, clickHandler: any, selected: boolean }
export interface PageThumbnailState { }

export default class PageThumbnail extends React.Component<PageThumbnailProps, PageThumbnailState> {


    componentWillMount() {
        this.setState({});
    }

    componentDidMount() {
    }

    onButtonClicked(event: any): void {
        this.props.clickHandler(event, this);
    }

    //onchange="angular.element(this).scope().uploadImage(this.files)"
    //onchange="angular.element(this).scope().saveAudioFile(this.files)"

    getStyle(): any {
        let style: any = { border: 'none'};
        if (this.props.selected) {
            style.border = 'solid';
        }
        return style;
    }

    render() {
        return (
            <div className="preview" onClick={this.onButtonClicked.bind(this)}>
                <div className="preview-white-background" style={this.getStyle()}>
                    <div className="preview-image-container">
                        <img className="preview-thumbnail" src="assets/previewBlock.png" />
                    </div>
                    <div className="preview-text-container">
                        <p></p>
                    </div>
                </div>
            </div>
        );
    }
}
