/** @typedef {{ [name: string]: any }} Context */
/** @typedef {number[]} Vector */
/** @typedef {number|string|boolean|number[]|string[]|boolean[]|Matrix} ValueType */
/** @typedef {import('./tokenizer').Token} Token */

const { evaluateExpression, evaluateVector, evaluateNumeric, isNumeric, evaluateValue, isVector } = require('./evaluate');
const tokenizer = require('./tokenizer');
const { Matrix, identity } = require('./matrix');

module.exports = interpreter;

/**
 *
 * @param {string} command
 * @param {Context} context
 * @param {(context: Context) => void} setContext
 * @returns {ValueType}
 */
function interpreter (command, context, setContext) {
    if (command.length === 0) {
        return;
    }

    const tokens = tokenizer(command);

    if (tokens.length === 1) {
        /*
         * evaluate symbol
         * e.g.  n
         */
        if (tokens[0].type === "name") {
            if (tokens[0].value in context) {
                return context[tokens[0].value];
            } else {
                throw Error("symbol not found: " + tokens[0].value);
            }
        }

        /*
         * evaluate value
         * e.g.  1
         */
        if (tokens[0].type === "number" || tokens[0].type === "string") {
            return tokens[0].value;
        }

        throw Error("Invalid expression");
    }

    if (tokens.length === 3) {
        const t1 = tokens[0];
        const t2 = tokens[1];
        const t3 = tokens[2];


        /*
         * evaluate range
         * e.g.  1:5
         */
        if (isNumeric(context, t1) && t2.type === "range" && isNumeric(context, t3)) {
            return range(evaluateNumeric(context, t1), evaluateNumeric(context, t3));
        }

        if (t2.type !== "operator") {
            throw Error("Expression not supported");
        }

        const op = assertString(t2.value);

        /*
         * evaluate assignment
         * e.g.  a <- 1
         * e.g.  b <- a
         */
        if (isAssignmentOp(t2, "left") && t1.type === "name") {
            assignVariable(context, setContext, t1.value, evaluateValue(context, t3));
            return;
        }

        /*
         * evaluate assignment
         * e.g.  2 -> b
         * e.g.  a -> b
         */
        if (isAssignmentOp(t2, "right") && t3.type === "name") {
            assignVariable(context, setContext, t3.value, evaluateValue(context, t1));
            return;
        }

        /*
         * evaluate operation
         * e.g.  1 + 3
         * e.g.  1 - b
         * e.g.  a / b
         * e.g.  2 * 9
         * e.g.  2 ^ 9
         */
        return evaluateExpression(context, t1, op, t3);
    }

    if (tokens.length === 4) {
        const t1 = tokens[0];
        const t2 = tokens[1];
        const t3 = tokens[2];
        const t4 = tokens[3];

        /*
         * call function
         * e.g.  rm(a)
         */
        if (t1.type === "name" && t2.type === "bracket" &&
            t4.type === "bracket")
        {
            switch (t1.value) {
                case "rm":
                {
                    if (t3.type !== "name") throw Error("Argument to `rm` must be a name");
                    removeVariable(context, setContext, t3.value);
                    return;
                }
                case "identity":
                {
                    const d = evaluateNumeric(context, t3);
                    return identity(d);
                }
            }
        }

        /*
         * index into vector
         * e.g.  aa[1]
         * e.g.  aa[b]
         */
        if (t1.type === "name" && t2.type === "index_bracket" &&
            t4.type === "index_bracket")
        {
            const v = evaluateVector(context, t1);
            const i = evaluateNumeric(context, t3);

            if (i < 1 || i >= v.length) {
                throw Error(`Index out of range: ${i}/${v.length}`);
            }

            return v[i-1|0];
        }
    }

    if (tokens.length === 5) {
        const t1 = tokens[0];
        const t2 = tokens[1];
        const t3 = tokens[2];
        const t4 = tokens[3];
        const t5 = tokens[4];

        /*
         * evaluate range with step
         * e.g.  1:10:2
         */
        if (isNumeric(context, t1) && t2.type === "range" &&
            isNumeric(context, t3) && t4.type === "range" &&
            isNumeric(context, t5))
        {
            return range(evaluateNumeric(context, t1), evaluateNumeric(context, t3), evaluateNumeric(context, t5));
        }

        /*
         * assignment of range
         * e.g.  aa <- 1:5
         */
        if (t1.type === "name" &&
            t2.type === "operator" && isAssignmentOp(t2, "left") &&
            isNumeric(context, t3) &&
            t4.type === "range" &&
            isNumeric(context, t5)
        ) {
            const val = range(evaluateNumeric(context, t3), evaluateNumeric(context, t5));
            assignVariable(context, setContext, t1.value, val);
            return;
        }

        /*
         * assignment of range
         * e.g. 1:5 -> aa
         */
        if (
            isNumeric(context, t1) &&
            t2.type === "range" &&
            isNumeric(context, t3) &&
            t4.type === "operator" && isAssignmentOp(t4, "right") &&
            t5.type === "name"
        ) {
            const val = range(evaluateNumeric(context, t1), evaluateNumeric(context, t3));
            assignVariable(context, setContext, t5.value, val);
            return;
        }

        if (t2.type !== "operator" || t4.type !== "operator")
        {
            throw Error("Expression not supported");
        }

        const op2 = assertString(t2.value);
        const op4 = assertString(t4.value);

        /*
         * assignment of operation
         * e.g.  a <- 1 + 5
         */
        if (isAssignmentOp(t2, "left") && !isAssignmentOp(t4) && t1.type === "name") {
            const val = evaluateExpression(context, t3, op4, t5);
            assignVariable(context, setContext, t1.value, val);
            return;
        }

        /*
         * assignment of operation
         * e.g.  1 + 5 -> a
         */
        if (isAssignmentOp(t4, "right") && !isAssignmentOp(t2) && t5.type === "name") {
            const val = evaluateExpression(context, t1, op2, t3);
            assignVariable(context, setContext, t5.value, val);
            return;
        }

        /*
         * evaluation of double operation
         * e.g.  10 + 1 - 5
         * e.g.  a + 4 + 5
         */
        const val = evaluateExpression(context, t1, op2, t3);
        if (typeof val === "boolean") throw Error("Bad expression");
        return evaluateExpression(context, val, op4, t5);
    }

    if (tokens.length === 6) {
        const t1 = tokens[0];
        const t2 = tokens[1];
        const t3 = tokens[2];
        const t4 = tokens[3];
        const t5 = tokens[4];
        const t6 = tokens[5];

        /*
         * evaluation of range index
         * e.g.  aa[2:4]
         */
        if (t1.type === "name" && isVector(context, t1) &&
            t2.type === "index_bracket" &&
            isNumeric(context, t3) &&
            t4.type === "range" &&
            isNumeric(context, t5) &&
            t6.type === "index_bracket")
        {
            const v = evaluateVector(context, t1);
            const start = evaluateNumeric(context, t3);
            const end = evaluateNumeric(context, t5);
            return start < end ? v.slice(start - 1, end) : v.slice(end - 1, start).reverse();
        }
    }

    throw Error(`Command not recognised: '${command}'`);
}

/**
 *
 * @param {Context} context
 * @param {(Context) => void} setContext
 * @param {string} name
 * @param {ValueType} value
 */
function assignVariable (context, setContext, name, value) {
    setContext({
        ...context,
        [name]: value,
    });
}

function removeVariable (context, setContext, name) {
    const { [name]: toRemove, ...rest } = context;
    setContext(rest);
}

/**
 * Range from `start` to `end` inclusive. With optional `step`
 * @param {number} start
 * @param {number} end
 * @param {number} step
 */
function range (start, end, step=1) {
    return Array(Math.floor((end - start)/step) + 1).fill(0).map((n,i) => (i * step) + start);
}

function assertString (x) {
    if (process.env.NODE_ENV === "production") return x;
    if (typeof x !== "string") {
        throw Error("Assertion Error");
    }
    return x;
}

/**
 *
 * @param {Token} t
 * @param {string} [dir]
 */
function isAssignmentOp(t, dir=null) {
    if (t.type !== "operator") return false;

    const tDir = (t.value === "<-" || t.value === "←") ? "left" :
        (t.value === "->" || t.value === "→") ? "right" :
        false;

    return tDir && (dir ? dir === tDir : true);
}