import * as React from 'react';
import { render } from 'react-dom';
import Application from './components/Application';

const argv = require('electron').remote.process.argv;
let argy = require('yargs')(argv).argv;
let debug: boolean = false;

let options: any = {};
if (argy.debug) {
    debug = argy.debug;
}

render(
    <Application />,
    document.getElementById('app')
);
