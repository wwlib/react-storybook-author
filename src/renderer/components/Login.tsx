import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Model from '../model/Model';
const PasswordMask = require('react-password-mask');

// https://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html

import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const aswCognitoConfig: any = require('../../../data/aws-cognito-config.json');

export interface LoginProps { model: Model, clickHandler: any }
export interface LoginState { username: string, password: string }

export default class Login extends React.Component<LoginProps, LoginState> {

    public poolData: any;
    public userPool: CognitoUserPool | undefined;
    public authToken: string;

    componentWillMount() {
        this.initCognito();
        this.setState({username: 'andrew.rapo@gmail.com', password: 'Andrew1234!'});
    }

    componentDidMount() {
    }

    initCognito(): void {
        if (!(aswCognitoConfig.cognito.userPoolId &&
            aswCognitoConfig.cognito.userPoolClientId &&
            aswCognitoConfig.cognito.region)) {
            console.log('Cognito user pool data incomplete!')
        } else {
            this.poolData = {
                UserPoolId: aswCognitoConfig.cognito.userPoolId,
                ClientId: aswCognitoConfig.cognito.userPoolClientId
            };
            this.userPool = new CognitoUserPool(this.poolData);
        }
    }

    createCognitoUser(email): CognitoUser | undefined {
        let cognitoUser: CognitoUser | undefined = undefined;
        if (this.userPool) {
            cognitoUser = new CognitoUser({
                Username: this.toUsername(email),
                Pool: this.userPool
            });
        }
        return cognitoUser;
    }

    toUsername(email) {
        return email.replace('@', '-at-');
    }

    signin(email: string, password: string, onSuccess: any, onFailure: any) {
        var authenticationDetails = new AuthenticationDetails({
            Username: this.toUsername(email),
            Password: password
        });

        var cognitoUser = this.createCognitoUser(email);
        if (cognitoUser) {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: onSuccess,
                onFailure: onFailure
            });
        }
    }

    signOut() {
        if (this.userPool) {
            let currentUser = this.userPool.getCurrentUser();
            if (currentUser) {
                currentUser.signOut();
            }
        }
    }

    getAuthToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.userPool) {
                var cognitoUser = this.userPool.getCurrentUser();

                if (cognitoUser) {
                    cognitoUser.getSession(function sessionCallback(err, session) {
                        if (err) {
                            reject(err);
                        } else if (!session.isValid()) {
                            resolve('');
                        } else {
                            resolve(session.getIdToken().getJwtToken());
                        }
                    });
                } else {
                    resolve('');
                }
            } else {
                resolve('');
            }
        });
    }

    handleSubmit(event: any) {
        let nativeEvent: any = event.nativeEvent;
        event.preventDefault();
        this.login('signin');
    }

    login(action: string): void {
        this.props.clickHandler(action);
        switch ( action ) {
            case 'signin':
                console.log(`signin`);
                this.signin(this.state.username, this.state.password,
                    () => {
                        console.log('Successfully Logged In');
                        this.getAuthToken().then((token: string) => {
                            if (token) {
                                console.log(token);
                                this.props.model.setActiveAuthToken(token);
                            }
                        });
                    },
                    (err) => { console.log(err)}
                )
                break;
            case 'signout':
                console.log(`signout`);
                break
        }
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
