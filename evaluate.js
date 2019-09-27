const Matrix = require('./matrix').default;

/** @typedef {import('./').Context} Context */
/** @typedef {import('./').Vector} Vector */
/** @typedef {import('./').ValueType} ValueType */
/** @typedef {import('./tokenizer').Token} Token */

module.exports = {
    evaluateExpression,
    evaluateNumeric,
    evaluateVector,
    evaluateString,
    evaluateMatrix,
    isNumeric,
    isVector,
    isString,
    isMatrix,
};

/**
 *
 * @param {Context} context
 * @param {Token|ValueType} t1
 * @param {string} op
 * @param {Token|ValueType} t3
 */
function evaluateExpression (context, t1, op, t3) {
    if (isNumeric(context, t1) && isNumeric(context, t3)) {
        return evaluteScalarExpression(context, t1, op, t3);
    }

    if (isVector(context, t1) && isVector(context, t3)) {
        return evaluateVectorExpression(context, t1, op, t3);
    }

    if (isVector(context, t1) && isNumeric(context, t3)) {
        return evaluateVectorScalarExpression(context, t1, op, t3);
    }

    if (isNumeric(context, t1) && isVector(context, t3)) {
        return evaluateScalarVectorExpression(context, t1, op, t3);
    }

    if (isMatrix(context, t1) && isNumeric(context, t3)) {
        return evaluateMatrixScalarExpression(context, t1, op, t3);
    }

    if (isNumeric(context, t1) && isMatrix(context, t3)) {
        return evaluateScalarMatrixExpression(context, t1, op, t3);
    }

    if (isMatrix(context, t1) && isVector(context, t3)) {
        return evaluateMatrixVectorExpression(context, t1, op, t3);
    }

    throw Error("Invalid expression");
}

/**
 *
 * @param {Context} context
 * @param {Token|number} value
 */
function evaluateNumeric (context, value) {
    if (typeof value === "number") {
        return value;
    }

    if (Array.isArray(value)) {
        throw Error(`Invalid numeric value: [Array(${value.length})]`);
    }

    if (typeof value !== "object") {
        throw Error(`Invalid numeric value: [${value}]`);
    }

    if (value.type !== "number" && value.type !== "name") {
        throw Error(`Invalid numeric value: [${value.value}]`);
    }

    const v = value.type === "name" ? context[value.value] : value.value;

    if (typeof v === "undefined") {
        throw Error("Symbol not found: " + value.value);
    } else if (typeof v !== "number") {
        throw Error(`Variable '${value.value}' does not contain a numeric value`);
    }

    return v;
}

/**
 *
 * @param {Context} context
 * @param {Token|number} value
 */
function evaluateString (context, value) {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        throw Error(`Invalid string value: [Array(${value.length})]`);
    }

    if (typeof value !== "object") {
        throw Error(`Invalid string value: [${value}]`);
    }

    if (value.type !== "string" && value.type !== "name") {
        throw Error(`Invalid string value: [${value.value}]`);
    }

    const v = value.type === "name" ? context[value.value] : value.value;

    if (typeof v === "undefined") {
        throw Error("Symbol not found: " + value.value);
    } else if (typeof v !== "string") {
        throw Error(`Variable '${value.value}' does not contain a numeric value`);
    }

    return v;
}

/**
 *
 * @param {Context} context
 * @param {Token|number[]} token
 * @returns {number[]}
 */
function evaluateVector (context, token) {
    if (Array.isArray(token)) {
        return token;
    }

    if (token.type !== "name") {
        throw Error(`Invalid vector value: [${token.value}]`);
    }

    const v = context[token.value];

    if (typeof v === "undefined") {
        throw Error("Symbol not found: " + token.value);
    } else if (!Array.isArray(v)) {
        throw Error(`Variable '${token.value}' does not contain a vector value`);
    }
    return v;
}

/**
 *
 * @param {Context} context
 * @param {Token|Matrix} token
 * @returns {Matrix}
 */
function evaluateMatrix (context, token) {
    if (token instanceof Matrix) {
        return token;
    }

    if (typeof token !== "object" || token.type !== "name") {
        throw Error(`Invalid matrix value: [${token.value}]`);
    }

    const v = context[token.value];

    if (typeof v === "undefined") {
        throw Error("Symbol not found: " + token.value);
    } else if (!(v instanceof Matrix)) {
        throw Error(`Variable '${token.value}' does not contain a vector value`);
    }

    return v;
}

/**
 *
 * @param {Context} context
 * @param {number|Token} t1
 * @param {string} op
 * @param {number|Token} t3
 */
function evaluteScalarExpression (context, t1, op, t3) {
    const v1 = evaluateNumeric(context, t1);
    const v3 = evaluateNumeric(context, t3);

    switch (op) {
        case "&&": {
            return Boolean(v1 && v3);
        }
        case "||": {
            return Boolean(v1 || v3);
        }
        case "&":
            throw Error("Use && to compare numbers");
        case "|":
            throw Error("Use || to compare numbers");
        default: {
            const fn = getOperator(op);

            if (fn) {
                return fn(v1, v3);
            }

            throw Error("Unrecognised operator: " + op);
        }
    }
}

/**
 *
 * @param {Context} context
 * @param {Token|Vector} t1
 * @param {string} op
 * @param {Token|Vector} t3
 */
function evaluateVectorExpression (context, t1, op, t3) {
    const v1 = evaluateVector(context, t1);
    const v3 = evaluateVector(context, t3);

    if (v1.length != v3.length) {
        throw Error(`Vector lengths do not match: ${v1.length} and ${v3.length}`)
    }

    switch (op) {
        case "&&": {
            return v1.every((v,i) => v && v3[i]);
        }
        case "||": {
            return v1.every((v,i) => v || v3[i]);
        }
        default: {
            const fn = getOperator(op);

            if (fn) {
                return v1.map((v, i) => fn(v, v3[i]));
            }

            throw Error("Unrecognised operator: " + op);
        }
    }
}

/**
 *
 * @param {Context} context
 * @param {Token|number} t1
 * @param {string} op
 * @param {Token|Vector} t3
 */
function evaluateScalarVectorExpression (context, t1, op, t3) {
    const n1 = evaluateNumeric(context, t1);
    const v3 = evaluateVector(context, t3);

    // Some operations are not commutative
    switch (op) {
        case "-": {
            return v3.map(v => n1 - v);
        }
        case "/": {
            return v3.map(v => n1 / v);
        }
        case "^": {
            return v3.map(v => Math.pow(n1, v));
        }
        default: {
            return evaluateVectorScalarExpression(context, v3, flipOperator(op), n1);
        }
    }
}

/**
 *
 * @param {Context} context
 * @param {Token|Vector} t1
 * @param {string} op
 * @param {Token|number} t3
 */
function evaluateVectorScalarExpression (context, t1, op, t3) {
    const v1 = evaluateVector(context, t1);
    const v3 = evaluateNumeric(context, t3);

    switch (op) {
        case "&&": {
            return v1.every(v => v && v3);
        }
        case "||": {
            return v1.every(v => v || v3);
        }
        default: {
            const fn = getOperator(op);

            if (fn) {
                return v1.map(v => fn(v, v3));
            }

            throw Error("Unrecognised operator: " + op);
        }
    }

}

/**
 *
 * @param {Context} context
 * @param {Token|number} t1
 * @param {string} op
 * @param {Token|Matrix} t3
 */
function evaluateScalarMatrixExpression (context, t1, op, t3) {
    const n1 = evaluateNumeric(context, t1);
    const v3 = evaluateMatrix(context, t3);

    // Some operations are not commutative
    switch (op) {
        case "-": {
            const out = new Matrix(v3.cols, v3.rows);
            for (let i = 0; i < v3.cols * v3.rows; i++) {
                out[i] = n1 - v3[i];
            }
            return out;
        }
        case "/": {
            const out = new Matrix(v3.cols, v3.rows);
            for (let i = 0; i < v3.cols * v3.rows; i++) {
                out[i] = n1 / v3[i];
            }
            return out;
        }
        case "^": {
            const out = new Matrix(v3.cols, v3.rows);
            for (let i = 0; i < v3.cols * v3.rows; i++) {
                out[i] = n1 ** v3[i];
            }
            return out;
        }
        default: {
            return evaluateMatrixScalarExpression(context, v3, flipOperator(op), n1);
        }
    }
}

/**
 *
 * @param {Context} context
 * @param {Token|Matrix} t1
 * @param {string} op
 * @param {Token|number} t3
 */
function evaluateMatrixScalarExpression (context, t1, op, t3) {
    const v1 = evaluateMatrix(context, t1);
    const v3 = evaluateNumeric(context, t3);

    switch (op) {
        case "&&": {
            return v1.every(v => Boolean(v && v3));
        }
        case "||": {
            return v1.every(v => Boolean(v || v3));
        }
        default: {
            const fn = getOperator(op);

            if (fn) {
                const out = new Matrix(v1.cols, v1.rows);
                for (let i = 0; i < v1.cols * v1.rows; i++) {
                    out[i] = fn(v1[i], v3);
                }
                return out;
            }

            throw Error("Unrecognised operator: " + op);
        }
    }

}



/**
 *
 * @param {Context} context
 * @param {Token|Matrix} t1
 * @param {string} op
 * @param {Token|Vector} t3
 */
function evaluateMatrixVectorExpression (context, t1, op, t3) {
    const v1 = evaluateMatrix(context, t1);
    const v3 = evaluateVector(context, t3);

    if (v1.cols != v3.length) {
        throw Error(`Matrix cols do not match Vector length: ${v1.length} and ${v3.length}`)
    }

    if (op !== "*" && op != "×") {
        throw Error("Only Matrix-Vector multiplication is supported");
    }

    const out = [];

    for (let i = 0; i < v1.rows; i++) {
        out[i] = 0;

        for (let j = 0; j < v1.cols; j++) {
            out[i] += v1.getValue(i, j) * v3[j];
        }
    }

    return out;
}

/**
 *
 * @param {Context} context
 * @param {Token|ValueType} value
 */
function isNumeric (context, value) {
    if (typeof value === "number") {
        return true;
    }

    if (Array.isArray(value) || typeof value !== "object") {
        return false;
    }

    if (value.type !== "number" && value.type !== "name") {
        return false;
    }

    const v = value.type === "name" ? context[value.value] : value.value;

    if (typeof v === "undefined") {
        return false;
    } else if (typeof v !== "number") {
        return false;
    }

    return true;
}

/**
 *
 * @param {Context} context
 * @param {Token|ValueType} value
 */
function isString (context, value) {
    if (typeof value === "string") {
        return true;
    }

    if (Array.isArray(value) || typeof value !== "object") {
        return false;
    }

    if (value.type !== "string" && value.type !== "name") {
        return false;
    }

    const v = value.type === "name" ? context[value.value] : value.value;

    if (typeof v === "undefined") {
        return false;
    } else if (typeof v !== "string") {
        return false;
    }

    return true;
}

/**
 *
 * @param {Context} context
 * @param {Token|ValueType} value
 */
function isVector (context, value) {
    if (Array.isArray(value)) {
        return true;
    }

    if (typeof value !== "object") {
        return false;
    }

    if (value.type !== "name") {
        return false;
    }

    const v = context[value.value];

    if (typeof v === "undefined") {
        return false;
    } else if (!Array.isArray(v)) {
        return false;
    }

    return true;
}

/**
 *
 * @param {Context} context
 * @param {Token|number[]|Matrix} token
 * @returns {boolean}
 */
function isMatrix (context, token) {
    if (token instanceof Matrix) {
        return true;
    }

    if (typeof token !== "object" || token.type !== "name") {
        return false
    }

    const v = context[token.value];

    if (typeof v === "undefined") {
        return false
    } else if (!(v instanceof Matrix)) {
        return false
    }

    return true;
}

/**
 * @param {string} op
 */
function getOperator (op) {
    switch (op) {
        case "+": {
            return (a, b) => a + b;
        }
        case "-": {
            return (a, b) => a - b;
        }
        case "*":
        case "×":
        {
            return (a, b) => a * b;
        }
        case "/":
        case "÷":
        {
            return (a, b) => a / b;
        }
        case "^": {
            return (a, b) => Math.pow(a, b);
        }
        case "==": {
            return (a, b) => a == b;
        }
        case "!=":
        case "≠":
        {
            return (a, b) => a != b;
        }
        case "<": {
            return (a, b) => a < b;
        }
        case ">": {
            return (a, b) => a > b;
        }
        case "<=":
        case "≤":
        case "⩽":
        {
            return (a, b) => a <= b;
        }
        case ">=":
        case "≥":
        case "⩾":
        {
            return (a, b) => a >= b;
        }
        case "&": {
            return (a, b) => Boolean(a && b);
        }
        case "|": {
            return (a, b) => Boolean(a || b);
        }
    }
}

/**
 * @param {string} op
 */
function flipOperator (op) {
    if (op === ">") return "<";
    if (op === "<") return ">";
    if (op === ">=") return "<=";
    if (op === "<=") return ">=";
    if (op === "-" || op === "/" || op === "^") throw Error(`Operator ${op} is not commutative`);
    return op;
}