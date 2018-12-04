import * as React from "react";
// const path = require('path');
const util = require('util');
// const fs = require('fs');
// const PNG = require('pngjs').PNG;

const defaultcss = require('defaultcss');
const classNames = require('classnames');

// let imagePath = path.resolve(__dirname, './stoplight.png');
// console.log(imagePath);
// var data = fs.readFileSync(imagePath);
// var stoplightPNG = PNG.sync.read(data);
// console.log(data);

// var stoplightPNG = require('./stoplight.png');
// import stoplightPNG = require('./stoplight.png');
// var stoplightURL = stoplightPNG.toString('base64');

let stoplightURL = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOgAAAAYCAYAAADwO7FhAAAABmJLR0QA/wD/AP+gvaeTAAAETUlEQVR42u2bz0tcVxTHP+e+NzMaf3U0IG1VmpIozSaii1JwkVIXbkIpXRS6Ke1/1k1poaWLbrJIQIpQKBiSTakGWtJq0VQTnYw/Zubde7p4jlozis48cyd6P4thmPfe3DOH833n3PPOiL13WzlHoulZARif+/xc13k49Y0AJJ99er6/59vvBcDd/zD47QzE3/0gACHezoY5zy8PBAKtEQQaCLQxQaCBQBsT+zYgRRHjQByCgsrBoUNvVR3OKk5rRKbHt9GBC8L6owUABm6N+TblJdpEoICCOsE5UOcQgVSdCggigmIQE2PI+bY2cIF49nARCAI9AUVdle3lVXZWnlN6soar1HCJQ51D7V6jTJSxrz5GjKS6PQM/3v8FgJmpSToL+Ybn7FSq3J2bB+CTjz7w6hF77zYAk16tCDRLVvHmbQ8q4gAHalGXIOoAsImlWtqlVtrF7lSxlQRXs7iq3S995XDdewbWNkvcnZtnp1I91llrmyVfLglcMLKIN38CNZa0hK1iqEFkuDI0QvHmCIPvXydf7MJWLTjqVS5qLXDm5Amkd7Krfb0NnXbYWVf7epmZCnkr0BpZxZu/Lq6kGXNraZXy0lNUO5BI6Rjoo/fGOxRvDtE9MvD/S8yeuU0otLOQb+i0Rs46riQJBE5LVvHmbQ+qLgLgxR8rJFsVCsVuCv09IEoUC33Xh5E4Rq1le6WEMYKzLhOn1R1Ur/+DOAPnQRbx9pJAHzxYZX5+tSmDJicHmZgYPN3JakChvLyOq1jKf6+DEXJXupEcxLkCve8OobYGGHb/3dzLoIKIok0OWB11GtCu4oyBxLcR582rirf1Rwv73drjePz1Tw0/7x8fbbrD22q8+eviSrqxTLZruMSy8fsy6ix9ox3kcjGgRPmIvtFriIlY3XjBQUW+tym92OS5BAINnMxLAp2YOEMWbIV6ClQFVbaWnwGKiXP0XHsbU+jCxAlxLqJ7eIDyUj8milpe9ugeAA66bW2WRS/FlNerireBW2PHZsF65rzxxZ3M12013jw2idIMqFZRp5icoVausLGwxObiE1xSSSeLVIm7ixTHhnjjvWGa6+E2dtbM1OSJ3TbPWN8GBFoji3jzfJdWTCT7e8tku0L5r3We/7ZEafFPkh2HTdLj3SPDdL35VqbO6izkj+22tQFtYUSgObKKN38C3Rs6UHcweKBOEREqG2We/vqY1Z/n2Vn5B1XBEaEYms2gJ7W2GzmtDQgZ9DUmq3jzJlBVAyKYfIzEgslHSCSYQkyUjxEjqBFczYGCiIAYwKTXNsFJ3bPDTgsEsiCLePM4i+sAw+iXd2j8zKQ+f1t/aa1re5rZ2s5C3vsMbuBikFW8eROoc1WMKSBRBZGIVJB6pILdK30x6WCDXvhHKwEP9I+P+jbhWLwJ1JgOANR2tNCXDQRapx3/ZlbnUjxrCwReV4JA25RoepZoeta3GQHPBIEGAm3MfxIveNEtAGhmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAABJRU5ErkJggg==`

import styleCss from './titlebar-css'
var style = util.format(styleCss, stoplightURL);

var ALT = 18;


export interface TitlebarProps {
    draggable: boolean;
    handleClick: any;
    handleClose: any;
    handleMinimize: any;
    handleMaximize: any;
    handleFullScreen: any;
}

export interface TitlebarState {
    altDown: boolean;
    draggable: boolean;
}

export default class Titlebar extends React.Component<TitlebarProps, TitlebarState> {

    private _keyDownHandler: any = this.handleKeyDown.bind(this);
    private _keyUpHandler: any = this.handleKeyUp.bind(this);


    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        this.setState({ altDown: false, draggable: true });
    }

    componentWillReceiveProps(nextProps: TitlebarProps) {
        if (nextProps.draggable) {
            try {
                this.setState({
                    draggable: nextProps.draggable
                }, () => {
                    // console.log(this.state.draggable, this.state.atlDown);
                });
            } catch (e) {
                console.log(e);
            }
        }
    }

    componentDidMount() {
        // document.body.addEventListener('keydown', this._keyDownHandler);
        // document.body.addEventListener('keyup', this._keyUpHandler);
    }

    componentWillUnMount() {
        // document.body.removeEventListener('keydown', this._keyDownHandler);
        // document.body.removeEventListener('keyup', this._keyUpHandler);
    }

    handleKeyDown(e: any) {
        if (e.keyCode === ALT) {
            this.setState({ altDown: true });
        }
    }

    handleKeyUp(e: any) {
        if (e.keyCode === ALT) {
            this.setState({ altDown: false });
        }
    }

    handleMaximize(e: any) {
        if (this.state.altDown) {
            // maximize
            this.props.handleMaximize(e);
        } else {
            this.props.handleFullScreen(e);
        }
    }

    // simply prevent event
    handleNop(e: any) {
        e.preventDefault();
        e.stopPropagation();
    }

    render() {
        var classes = classNames('handle', 'titlebar',
        {
            'webkit-draggable': this.state.draggable,
            'alt': this.state.altDown,
        });

        // set default CSS
        defaultcss('titlebar', style);

        return (
            <div className={classes} id="titlebar" onClick={this.props.handleClick}>
            	<div className="titlebar-stoplight">
            		<div id="titlebar-close" onDoubleClick={this.handleNop} onClick={this.props.handleClose} className="titlebar-close"></div>
            		<div id="titlebar-minimize" onDoubleClick={this.handleNop} onClick={this.props.handleMinimize} className="titlebar-minimize"></div>
            		<div id="titlebar-fullscreen" onDoubleClick={this.handleNop} onClick={this.handleMaximize.bind(this)} className="titlebar-fullscreen"></div>
            	</div>
                {this.props.children}
            </div>
        )
    }
}
