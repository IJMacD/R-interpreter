import interpreter from '.';

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
});

describe("range evaluation", () => {
    test("simple range", () => {
        const interpret = spawn();
        expect(interpret("1:5")).toStrictEqual([1,2,3,4,5]);
    });

    test("range with step", () => {
        const interpret = spawn();
        expect(interpret("1:5:2")).toStrictEqual([1,3,5]);
    });
});