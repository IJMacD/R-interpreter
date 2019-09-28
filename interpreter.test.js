const interpreter = require('.');

function spawn (context={}) {
    const setContext = (newContext) => Object.assign(context, newContext);
    return function (command) {
        return interpreter(command, context, setContext);
    };
}

describe("assignment", () => {
    test("left assignment", () => {
        function setContext (context) {
            if (!context['a'] || context['a'] !== 1) throw Error("assignment failed");
        }
        interpreter("a <- 1", {}, setContext);
    });

    test("right assignment", () => {
        function setContext (context) {
            if (!context['b'] || context['b'] !== 5) throw Error("assignment failed");
        }
        interpreter("5 -> b", {}, setContext);
    });

    test("left re-assignment", () => {
        function setContext (context) {
            if (!context['a'] || context['a'] !== 2) throw Error("assignment failed");
        }
        interpreter("a <- b", {b: 2}, setContext);
    });

    test("right re-assignment", () => {
        function setContext (context) {
            if (!context['b'] || context['b'] !== 4) throw Error("assignment failed");
        }
        interpreter("a -> b", {a: 4}, setContext);
    });
});

describe("evaluation assignment", () => {
    test("left assignment", () => {
        function setContext (context) {
            if (!context['a'] || context['a'] !== 4) throw Error("assignment failed");
        }
        interpreter("a <- 1 + 3", {}, setContext);
    });

    test("right assignment", () => {
        function setContext (context) {
            if (!context['b'] || context['b'] !== 10) throw Error("assignment failed");
        }
        interpreter("5 * 2 -> b", {}, setContext);
    });
});

describe("range assignment", () => {
    test("left assignment", () => {
        function setContext (context) {
            if (!context['a'] || JSON.stringify(context['a']) !== "[1,2,3]") throw Error("assignment failed");
        }
        interpreter("a <- 1:3", {}, setContext);
    });

    test("right assignment", () => {
        function setContext (context) {
            if (!context['b'] || JSON.stringify(context['b']) !== "[5,6,7,8,9]") throw Error("assignment failed");
        }
        interpreter("5:9 -> b", {}, setContext);
    });
});

describe("evaluation", () => {
    test("addition", () => {
        const interpret = spawn();
        expect(interpret("2 + 1")).toBe(3);
    });

    test("subtraction", () => {
        const interpret = spawn();
        expect(interpret("2 - 3")).toBe(-1);
    });

    test("multiplication", () => {
        const interpret = spawn();
        expect(interpret("2 * 8")).toBe(16);
    });

    test("division", () => {
        const interpret = spawn();
        expect(interpret("16 / 8")).toBe(2);
    });

    test("division", () => {
        const interpret = spawn();
        expect(interpret("2 ^ 8")).toBe(256);
    });

    test("double operation", () => {
        const interpret = spawn();
        expect(interpret("2 + 8 - 5")).toBe(5);
    });
});

describe("range evaluation", () => {
    test("simple range", () => {
        const interpret = spawn();
        expect(interpret("1:5")).toStrictEqual([1,2,3,4,5]);
    });

    test("range with step", () => {
        const interpret = spawn();
        expect(interpret("1:2:5")).toStrictEqual([1,3,5]);
    });

    test("reverse range", () => {
        const interpret = spawn();
        expect(interpret("6:2")).toStrictEqual([6,5,4,3,2]);
    });

    test("reverse range with step", () => {
        const interpret = spawn();
        expect(interpret("9:3:1")).toStrictEqual([9,6,3]);
    });

    test("range with symbol", () => {
        const interpret = spawn({a: 5, b: 7});
        expect(interpret("a:10")).toStrictEqual([5,6,7,8,9,10]);
        expect(interpret("2:a")).toStrictEqual([2,3,4,5]);
        expect(interpret("b:a")).toStrictEqual([7,6,5]);
    });
});

describe("strings", () => {
    test("simple evaluation", () => {
        const interpret = spawn();
        expect(interpret('"a"')).toStrictEqual("a");
    });

    test("string assignment", () => {
        function setContext (context) {
            if (!context['b'] || JSON.stringify(context['b']) !== '"a"') throw Error("assignment failed");
        }
        interpreter('"a" -> b', {}, setContext);
    });

    test("string addition", () => {
        const interpret = spawn();
        expect(interpret('"a" + "b"')).toStrictEqual("ab");
    });

    test("string multiplication", () => {
        const interpret = spawn();
        expect(interpret('"a" * 2')).toStrictEqual("aa");
        expect(interpret('2 * "a"')).toStrictEqual("aa");
    });

    test("string division", () => {
        const interpret = spawn();
        expect(interpret('"aa" / 2')).toStrictEqual("a");
    });

    test("string numeric addition", () => {
        const interpret = spawn();
        expect(interpret('"a" + 2')).toStrictEqual("aaa");
    });

    test("string numeric subtraction", () => {
        const interpret = spawn();
        expect(interpret('"aaaa" - 2')).toStrictEqual("aa");
    });
});

describe("Vector", () => {
    test("addition", () => {
        const interpret = spawn({a: [1,2,3], b: [4,5,6]});
        expect(interpret('a + b')).toStrictEqual([5,7,9]);
    });

    test("subtraction", () => {
        const interpret = spawn({a: [1,2,3], b: [4,5,6]});
        expect(interpret('a - b')).toStrictEqual([-3,-3,-3]);
    });

    test("multiplication", () => {
        const interpret = spawn({a: [1,2,3], b: [4,5,6]});
        expect(interpret('a * b')).toStrictEqual([4,10,18]);
    });

    test("division", () => {
        const interpret = spawn({a: [10,20,18], b: [4,5,6]});
        expect(interpret('a / b')).toStrictEqual([2.5,4,3]);
    });
});

describe("Vector Index", () => {
    test("simple", () => {
        const interpret = spawn({a: [1,2,3]});
        expect(interpret('a[2]')).toStrictEqual(2);
    });

    test("by variable", () => {
        const interpret = spawn({a: [1,2,3], b: 3});
        expect(interpret('a[b]')).toStrictEqual(3);
    });

    test("range", () => {
        const interpret = spawn({a: [1,2,3]});
        expect(interpret('a[2:3]')).toStrictEqual([2,3]);
    });

    test("reverse range", () => {
        const interpret = spawn({a: [1,2,3]});
        expect(interpret('a[2:1]')).toStrictEqual([2,1]);
    });
});

describe("Vector-Scalar", () => {
    test("addition", () => {
        const interpret = spawn({a: [1,2,3]});
        expect(interpret('a + 2')).toStrictEqual([3,4,5]);
        expect(interpret('2 + a')).toStrictEqual([3,4,5]);
    });

    test("subtraction", () => {
        const interpret = spawn({a: [1,2,3]});
        expect(interpret('a - 4')).toStrictEqual([-3,-2,-1]);
        expect(interpret('4 - a')).toStrictEqual([3,2,1]);
    });

    test("multiplication", () => {
        const interpret = spawn({a: [1,2,3]});
        expect(interpret('a * 3')).toStrictEqual([3,6,9]);
        expect(interpret('3 * a')).toStrictEqual([3,6,9]);
    });

    test("division", () => {
        const interpret = spawn({a: [2,4,6]});
        expect(interpret('a / 2')).toStrictEqual([1,2,3]);
        expect(interpret('12 / a')).toStrictEqual([6,3,2]);
    });
});

describe("Matrix", () => {
    test("identity", () => {
        const interpret = spawn({a: 2});
        expect(interpret('identity(3)')).toHaveLength(9);
        expect(interpret('identity(a)')).toHaveLength(4);
    });
});

describe("Errors", () => {
    test("rm()", () => {
        function setContext (context) {
            if (context['a'] || typeof context['a'] !== "undefined") throw Error("removal failed");
        }
        interpreter('rm(a)', {a: 1}, setContext);
    });
});

describe("Errors", () => {
    test("Bad tokens", () => {
        const interpret = spawn();
        expect(() => interpret("@")).toThrow();
    });

    test("Unknown symbol", () => {
        const interpret = spawn();
        expect(() => interpret("a")).toThrow();
    });

    test("Remove an non-symbol", () => {
        const interpret = spawn();
        expect(() => interpret("rm(1)")).toThrow();
    });

    test("Incomplete expression", () => {
        const interpret = spawn();
        expect(() => interpret("+")).toThrow();
    });

    test("Incompatiple operators ", () => {
        const interpret = spawn();
        expect(() => interpret("1 && 2 + 3")).toThrow();
    });

    test("Invalid Expression", () => {
        const interpret = spawn();
        expect(() => interpret("a b")).toThrow();
        expect(() => interpret("a b c")).toThrow();
        expect(() => interpret("a b c d")).toThrow();
        expect(() => interpret("a b c d e")).toThrow();
        expect(() => interpret("a b c d e f")).toThrow();
    });

    // Not really an error
    test("Null input", () => {
        const interpret = spawn();
        expect(interpret("")).toBeUndefined()
    });
});