#!/usr/bin/env node

const repl = require('repl');
const util = require('util');
const chalk = require('chalk');
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
        callback(null, e);
    }
}

repl.start({
  prompt: "> ",
  eval: rEval,
  writer,
  ignoreUndefined: true,
});

/**
 *
 * @param {import('.').ValueType} value
 * @returns {string|undefined}
 */
function writer (value) {
  if (typeof value === "undefined") {
    return undefined;
  }

  if (value instanceof Error) {
    return chalk.red(value.message);
  }

  if (value instanceof Matrix) {
    return value.toString();
  }

  return util.inspect(value, false, 4, true);
}