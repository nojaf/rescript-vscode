"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProjectRootOfFile = exports.findProjectRootOfFileInDir = exports.normalizePath = void 0;
const fs = require("fs");
const path = require("path");
const normalizePath = (filePath) => {
    return filePath != null ? path.normalize(filePath) : null;
};
exports.normalizePath = normalizePath;
const findProjectRootOfFileInDir = (source) => {
    const normalizedSource = (0, exports.normalizePath)(source);
    if (normalizedSource == null) {
        return null;
    }
    const dir = (0, exports.normalizePath)(path.dirname(normalizedSource));
    if (dir == null) {
        return null;
    }
    if (fs.existsSync(path.join(dir, "rescript.json")) ||
        fs.existsSync(path.join(dir, "bsconfig.json"))) {
        return dir;
    }
    if (dir === normalizedSource) {
        return null;
    }
    return (0, exports.findProjectRootOfFileInDir)(dir);
};
exports.findProjectRootOfFileInDir = findProjectRootOfFileInDir;
const findProjectRootOfFile = (source) => {
    const normalizedSource = (0, exports.normalizePath)(source);
    if (normalizedSource == null) {
        return null;
    }
    return (0, exports.findProjectRootOfFileInDir)(normalizedSource);
};
exports.findProjectRootOfFile = findProjectRootOfFile;
//# sourceMappingURL=projectRoots.js.map