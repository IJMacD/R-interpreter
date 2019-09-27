#!/usr/bin/env node

const repl = require('repl');
const util = require('util');
const interpreter = require('./index');
const Matrix = require('./matrix').default;

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

repl.start({ prompt: "> ", eval: rEval, writer: formatOutput });

/**
 *
 * @param {import('.').ValueType} value
 * @returns {string}
 */
function formatOutput (value) {
  if (value instanceof Matrix) {
    return value.toString();
  }

  return util.inspect(value, false, 4, true);
}