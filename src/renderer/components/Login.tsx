import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Model from '../model/Model';

// https://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html

import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const aswCognitoConfig: any = require('../../../data/aws-cognito-config.json');

export interface LoginProps { clickHandler: any }
export interface LoginState { }

export default class Login extends React.Component<LoginProps, LoginState> {

    public poolData: any;
    public userPool: CognitoUserPool | undefined;
    public authToken: string;

    componentWillMount() {
        this.initCognito();
        this.setState({});
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

    onButtonClicked(event: any): void {
        // this.props.clickHandler(event);
        let nativeEvent: any = event.nativeEvent;
        switch ( nativeEvent.target.id) {
            case 'signin':
                console.log(`signin`);
                this.signin('andrew.rapo@gmail.com', 'Andrew1234!',
                    () => {
                        console.log('Successfully Logged In');
                        this.getAuthToken().then((token: string) => {
                            if (token) {
                                console.log(token);
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

    render() {
        return (
            <div className="login" onClick={this.onButtonClicked.bind(this)} >
                <input id="email" />
                <input id="password" />
                <button id="signin" />
                <button id="signout" />
            </div>
        );
    }
}
