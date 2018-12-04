import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Draggable from "react-draggable";
import Titlebar from './titlebar/Titlebar';

const PasswordMask = require('react-password-mask');
import Select from 'react-select';
import AppSettings from '../model/AppSettings';
import Model from '../model/Model';
import WindowComponent from '../model/WindowComponent';

export interface AppSettingsPanelProps { clickHandler: any, changeHandler: any, appSettings: AppSettings }
export interface AppSettingsPanelState { }

export default class AppSettingsPanel extends React.Component<AppSettingsPanelProps, AppSettingsPanelState> {

    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        this.setState({});
    }

    componentDidMount() {
        WindowComponent.restoreStyleWithId('appSettingsPanel');
    }

    handleInputChange(event: any) {
        this.props.changeHandler(event);
    }

    // handleNluDefaultChange(selectedOption: any) {
    //     console.log(`AppSettingsPanel: handleNluDefaultChange: `, selectedOption);
    //     this.props.dropdownHandler(selectedOption);
    // }

    handleClick(event: any): void {
        this.props.clickHandler(event);
    }

    handleClose(event: any) {
        // console.log('handleClose');
    }

    handleMinimize(event: any) {
        // console.log('minimize');
    }

    handleMaximize(event: any) {
        // console.log('maximize');
    }

    handleFullScreen(event: any) {
        // console.log('fullscreen');
    }

    render() {
        return  <Draggable handle=".handle">
                    <div className="app-panel well" id="appSettingsPanel">
                    <Titlebar
                        draggable={true}
                        handleClick={this.handleClick.bind(this)}
                        handleClose={this.handleClose.bind(this)}
                        handleMinimize={this.handleMinimize.bind(this)}
                        handleMaximize={this.handleMaximize.bind(this)}
                        handleFullScreen={this.handleFullScreen.bind(this)}>
                    </Titlebar>
                    <h4 className="pull-left handle" style={{marginBottom:20}}>App Settings</h4>
                    <div className="clearfix"></div>
                    <ReactBootstrap.Table condensed hover style = {{width: 900}}>
                        <tbody>
                            <tr><td>nluDialogflow_projectId:</td><td>
                            <input name="nluDialogflow_projectId" value={this.props.appSettings.nluDialogflow_projectId} onChange={this.handleInputChange.bind(this)} style={{width: '90%'}} />
                            </td></tr>

                            <tr><td>nluDialogflow_privateKey:</td><td>
                            <textarea name="nluDialogflow_privateKey" value={this.props.appSettings.nluDialogflow_privateKey} onChange={this.handleInputChange.bind(this)} style={{width: '90%'}} />
                            </td></tr>

                            <tr><td>nluDialogflow_clientEmail:</td><td>
                            <PasswordMask name="nluDialogflow_clientEmail" value={this.props.appSettings.nluDialogflow_clientEmail} onChange={this.handleInputChange.bind(this)} inputStyles={{width: '90%'}} />
                            </td></tr>
                        </tbody>
                    </ReactBootstrap.Table>
                    <div className="appSettingsButtons" onClick={this.handleClick.bind(this)}>
                        <ReactBootstrap.Button bsStyle={'success'} key={"save"} id={"saveSettings"} style = {{width: 100}}>Save</ReactBootstrap.Button>
                        <ReactBootstrap.Button bsStyle={'info'} key={"reload"} id={"reloadSettings"} style = {{width: 120}}>Reload</ReactBootstrap.Button>
                        <ReactBootstrap.Button bsStyle={'default'} key={"show"} id={"showSettings"} style = {{width: 80}}>Show</ReactBootstrap.Button>
                    </div>
                </div></Draggable>;
    }
}
