export default class Matrix {
    data: Float64Array;
    cols: number;
    rows: number;

    constructor (cols: number, rows: number) {
        this.data = new Float64Array(cols * rows);

        this.cols = cols;
        this.rows = rows;

        this.data.fill(0);
    }

    get length () {
        return this.cols * this.rows;
    }

    getValue (i: number , j: number) {
        return this.data[i * this.rows + j];
    }

    setValue (i: number, j: number, value: number) {
        this.data[i * this.rows + j] = value;
    }

    add (other: Matrix) {
        if (other.length !== this.length) {
            throw RangeError(`Lengths must be the same ${this.length} vs. ${other.length}`);
        }

        for (let i = 0; i < this.length; i++) {
            this.data[i] += other.data[i];
        }
    }

    toString () {
        let str = '';

        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.cols; i++) {
                const index = i * this.rows + j;

                str += this.data[index] + ' ';
            }
            str += '\n';
        }

        return str;
    }
}

export class Vector extends Matrix {
    constructor (size: number|number[]) {
        if (typeof size === "number") {
            super(1, size);
        } else {
            super(1, size.length);
            this.data.set(size);
        }
    }

    getValue (j: number) {
        return this.data[j];
    }

    setValue (j: number, value: number) {
        this.data[j] = value;
    }

    toString () {
        return this.data.join('\n');
    }
}

export function identity (size: number) {
    const m = new Matrix(size, size);

    for (let i = 0; i < size; i++) {
        m.setValue(i, i, 1);
    }

    return m;
}

export function cross (a: Matrix, b: Matrix) {
    if (a.cols !== b.rows) {
        throw RangeError(`Matrix size mismatch. Cols(${a.cols}) must match Rows(${b.rows})`);
    }

    const { cols } = b;
    const { rows } = a;
    const { cols: depth } = a;

    const out = new Matrix(cols, rows);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const index = i * rows + j;

            for (let ii = 0; ii < depth; ii++) {
                out.data[index] += a.data[ii * rows + j] * b.data[i * depth + ii];
            }
        }
    }

    return out;
}