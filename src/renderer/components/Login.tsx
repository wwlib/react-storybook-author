import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Model from '../model/Model';
const PasswordMask = require('react-password-mask');

export interface LoginProps { model: Model, clickHandler: any }
export interface LoginState { username: string, password: string }

export default class Login extends React.Component<LoginProps, LoginState> {

    componentWillMount() {
        this.setState({username: 'andrew.rapo@gmail.com', password: 'Andrew1234!'});
    }

    componentDidMount() {
    }

    handleSubmit(event: any) {
        let nativeEvent: any = event.nativeEvent;
        this.props.clickHandler(this.state.username, this.state.password);
        event.preventDefault();
    }

    handleInputChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        switch(nativeEvent.target.name) {
            case 'username':
                this.setState({ username: nativeEvent.target.value});
                break;
            case 'password':
                this.setState({ password: nativeEvent.target.value});
                break;
        }
    }

    render() {
        return (
            <ReactBootstrap.Table bordered condensed hover style = {{width: 300}}>
                <tbody>
                <tr><td>
                    <div className="login"  >
                        <form onSubmit={this.handleSubmit.bind(this)} >
                            <label>Signin:</label><br />
                            <input ref="username" id="username" name="username" type="text" style = {{width: 300}} value={this.state.username} onChange={this.handleInputChange.bind(this)} /><br />
                            <PasswordMask ref="password" id="password" name="password" style={{width: 300}} value={this.state.password} onChange={this.handleInputChange.bind(this)} /><br />
                            <input type="submit" value="Submit" />
                        </form>
                    </div>
                </td></tr>
                </tbody>
            </ReactBootstrap.Table>
        );
    }
}
