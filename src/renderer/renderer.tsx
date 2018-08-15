import * as React from 'react';
import { render } from 'react-dom';
import Application from './components/Application';
import Model from './model/Model';

const argv = require('electron').remote.process.argv;
let argy = require('yargs')(argv).argv;
let debug: boolean = false;

let options: any = {};
if (argy.debug) {
    debug = argy.debug;
}

let model: Model = new Model();

render(
    <Application model={model}/>,
    document.getElementById('app')
);
