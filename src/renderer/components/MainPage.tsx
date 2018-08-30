import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import BottomNav from './BottomNav';
import Page from '../model/Page';

import FileDrop from './FileDrop';

export interface MainPageProps { bottomNavClickHandler: any, changeHandler: any, imageHandler: any, page: Page }
export interface MainPageState {}

export default class MainPage extends React.Component<MainPageProps, MainPageState> {


    componentWillMount() {
        this.setState({imageURL: ''});
    }

    componentDidMount() {
    }

    onBottomNavButtonClicked(event: any): void {
        this.props.bottomNavClickHandler(event);
    }

    handleInputChange(event: any) {
        this.props.changeHandler(event);
    }

    processUploadedFile(file: any): void {
        console.log('processUploadedFile ' + file.name);
        this.props.imageHandler('', file);
        // var reader = new FileReader();
        // reader.onload = ((e: any) => {
        //     console.log(`FilReader result: OK`);
        //     this.props.imageHandler(e.target.result);
        // })
        // reader.readAsDataURL(file);
    }

    onDrop(fileList: any, ev: any) {
        // let file: any = fileList[0];
        // console.log(file);
        // if (file) {
        //     console.log(file.name, file, file.preview, file.getAsFile());
        //     window.URL.revokeObjectURL(file.preview);
        // }

        console.log('File(s) dropped', fileList, event);

        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();

        if (ev.dataTransfer.items) {
            console.log(`using items`);
          // Use DataTransferItemList interface to access the file(s)
          // for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            var i = 0;
            if (ev.dataTransfer.items[i].kind === 'file') {
              var file = ev.dataTransfer.items[i].getAsFile();
              console.log('... file[' + i + '].name = ' + file.name, file);

             this.processUploadedFile(file);
            }
          // }
        } else {
            console.log(`using files`);
          // Use DataTransfer interface to access the file(s)
          for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
          }
        }

        // Pass event to removeDragData for cleanup
        this.removeDragData(ev)

    }

    onFileInputChange(event: any): void {
        var files = event.target.files
        console.log(`onFileInputChange: `, files);
        this.processUploadedFile(files[0]);
    }

    removeDragData(ev) {
      console.log('Removing drag data')

      if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to remove the drag data
        ev.dataTransfer.items.clear();
      } else {
        // Use DataTransfer interface to remove the drag data
        ev.dataTransfer.clearData();
      }
    }

    onDragOver(event: any) {
        // console.log(`onDragOver: `, event);
    }

    //onchange="angular.element(this).scope().uploadImage(this.files)"
    //onchange="angular.element(this).scope().saveAudioFile(this.files)"

    // <button className="imageUploadButton"></button>
    // <input accept="image/*" id="uploadImageFileInput" ng-file-select="onFileSelect($files)" type="file" />

    onUploadButtonClick(event: any): void {
        let inputElement = document.getElementById("fileInput");
        console.log(`onUploadButtonClick`, inputElement);
        if (inputElement) {
            inputElement.click();
        }
    }

    render() {
        return (
            <div id="mainPage" style={{ width: "1097px", height: "500px" }}>

                <div id="mainPageTopStory">
                    <FileDrop className={"fileDrop"} targetClassName={"fileDropTarget"} onDrop={this.onDrop.bind(this)} onDragOver={this.onDragOver.bind(this)}>
                        <div id="imageContainer" style={{width: 500}}>
                            <img className="thumbnail" src={this.props.page.image} />
                            <button className="imageUploadButton" onClick={this.onUploadButtonClick.bind(this)}></button>
                            <input type="file" id="fileInput" name="file" accept="image/png, image/jpeg" multiple style={{ display: 'none' }} onChange={this.onFileInputChange.bind(this)}/>
                        </div>
                    </FileDrop>
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
