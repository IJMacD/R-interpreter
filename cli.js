#!/usr/bin/env node

const repl = require('repl');
const interpreter = require('./index');

let state = {};
function setState (newState) {
    state = newState;
}

function rEval (cmd, context, filename, callback) {
    try {
        callback(null, interpreter(cmd, state, setState));
    } catch (e) {
        callback(e.message);
    }
}

repl.start({ prompt: "> ", eval: rEval });