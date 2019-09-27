REM npx typescript --lib es6 ./matrix.ts
wsl sed -i 's/var _this = _super.call(this, cols \* rows) ^|^| this;/var _this = new _super(cols * rows) ^|^| this; _this["__proto__"] = Matrix.prototype;/' matrix.js
