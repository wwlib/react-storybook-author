import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";

export interface ApplicationProps {  }
export interface ApplicationState {  }

export default class Application extends React.Component < ApplicationProps, ApplicationState > {


    componentWillMount() {
        this.setState({ });
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
        return(
            <div>
                Hello
            </div>
        );
    }
}
