module.exports = tokenizer;

const GRAMMAR = {
    string: {
        match: /^"([^"]*)"/,
        map: m => m[1],
    },
    number: {
        match: /^-?[0-9]+(?:\.[0-9]+)?/,
        map: m => +m[0],
    },
    name: {
        match: /^[a-z][a-z0-9_.]*/i,
    },
    operator: {
        match: /^(<-|->|==|!=|<=|>=|&&|\|\||[-+*/<>&|^×÷←→≠≤≥⩽⩾])/,
    },
    bracket: {
        match: /^[()]/,
    },
    index_bracket: {
        match: /^[[\]]/,
    },
    range: {
        match: /^:/,
    },
    whitespace: {
        match: /^\s+/,
        ignore: true,
    },
};

/** @typedef {"string"|"number"|"name"|"operator"|"bracket"|"index_bracket"|"range"|"whitespace"} TokenTypes */

/**
 * @typedef Token
 * @prop {TokenTypes} type
 * @prop {string|number} value
 */

/**
 *
 * @param {string} input
 * @returns {Token[]}
 */
function tokenizer (input) {
    let i = 0;
    const tokens = [];

    while (i < input.length) {
        let tail = input.substr(i);
        let match;

        for (const key in GRAMMAR) {
            const type = /** @type {TokenTypes} */ (key);
            const g = GRAMMAR[type];
            match = g.match.exec(tail);
            if (match) {
                if (!g.ignore) {
                    tokens.push({
                        type,
                        value: g.map ? g.map(match) : match[0],
                    });
                }
                i += match[0].length;
                break;
            }
        }

        if (!match) {
            throw Error("Unrecognised Input: " + tail.trim().substr(0, 10));
        }
    }

    return tokens;
}