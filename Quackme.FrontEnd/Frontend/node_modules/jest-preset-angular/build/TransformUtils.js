"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * returns the compiler function to create a string literal. If an old version
 * of the TypeScript module is used, it will create a function that replaces the
 * behavior of the `createStringLiteral` function.
 * @param ts TypeScript compiler module
 */
function getCreateStringLiteral(ts) {
    if (ts.createStringLiteral && typeof ts.createStringLiteral === 'function') {
        return ts.createStringLiteral;
    }
    return function createStringLiteral(text) {
        var node = (ts.createNode(ts.SyntaxKind.StringLiteral, -1, -1));
        node.text = text;
        node.flags |= ts.NodeFlags.Synthesized;
        return node;
    };
}
exports.getCreateStringLiteral = getCreateStringLiteral;
