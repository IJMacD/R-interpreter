export default class Matrix extends Float64Array {
    cols: number;
    rows: number;

    constructor (cols: number, rows: number) {
        super(cols * rows);

        this.cols = cols;
        this.rows = rows;

        this.fill(0);
    }

    getValue (i: number , j: number) {
        return this[i * this.rows + j];
    }

    setValue (i: number, j: number, value: number) {
        this[i * this.rows + j] = value;
    }

    add (other: Matrix) {
        if (other.length !== this.length) {
            throw RangeError(`Lengths must be the same ${this.length} vs. ${other.length}`);
        }

        for (let i = 0; i < this.length; i++) {
            this[i] += other[i];
        }
    }

    toString () {
        let str = '';

        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.cols; i++) {
                const index = i * this.rows + j;

                str += this[index] + ' ';
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
            this.set(size);
        }
    }

    getValue (j: number) {
        return this[j];
    }

    setValue (j: number, value: number) {
        this[j] = value;
    }

    toString () {
        return this.join('\n');
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
                out[index] += a[ii * rows + j] * b[i * depth + ii];
            }
        }
    }

    return out;
}