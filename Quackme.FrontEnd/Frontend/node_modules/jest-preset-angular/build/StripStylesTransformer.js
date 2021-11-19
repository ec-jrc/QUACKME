"use strict";
/*
 * Code is inspired by
 * https://github.com/kulshekhar/ts-jest/blob/25e1c63dd3797793b0f46fa52fdee580b46f66ae/src/transformers/hoist-jest.ts
 *
 *
 * IMPLEMENTATION DETAILS:
 * This transformer handles one concern: removing styles.
 *
 * The property 'styles' inside a @Component(...) Decorator argument will
 * be modified, even if they are not used in the context of an
 * Angular Component.
 *
 * This is the required AST to trigger the transformation:
 *
 * ClassDeclaration
 *   Decorator
 *     CallExpression
 *       ObjectLiteralExpression
 *         PropertyAssignment
 *           Identifier
 *           StringLiteral
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** Angular component decorator Styles property name */
var STYLES = 'styles';
/** Angular component decorator name */
var COMPONENT = 'Component';
/** All props to be transformed inside a decorator */
var TRANSFORM_IN_DECORATOR_PROPS = [STYLES];
/**
 * Transformer ID
 * @internal
 */
exports.name = 'angular-component-strip-styles';
// increment this each time the code is modified
/**
 * Transformer Version
 * @internal
 */
exports.version = 1;
/**
 * The factory of hoisting transformer factory
 * @internal
 */
function factory(cs) {
    /**
     * Our compiler (typescript, or a module with typescript-like interface)
     */
    var ts = cs.compilerModule;
    /**
     * Traverses the AST down inside a decorator to a styles assignment
     * and returns a boolean indicating if it should be transformed.
     */
    function isInDecoratorPropertyAssignmentToTransform(node) {
        return getInDecoratorPropertyAssignmentsToTransform(node).length > 0;
    }
    /**
     * Traverses the AST down inside a decorator to a styles assignment
     * returns it in an array.
     */
    function getInDecoratorPropertyAssignmentsToTransform(node) {
        if (!ts.isClassDeclaration(node) || !node.decorators) {
            return [];
        }
        return node.decorators
            .map(function (dec) { return dec.expression; })
            .filter(ts.isCallExpression)
            .filter(function (callExpr) {
            return ts.isIdentifier(callExpr.expression) && callExpr.expression.getText() === COMPONENT;
        })
            .reduce(function (acc, nxtCallExpr) { return Array.prototype.concat.apply(acc, nxtCallExpr.arguments
            .filter(ts.isObjectLiteralExpression)
            .reduce(function (acc, nxtArg) { return Array.prototype.concat.apply(acc, nxtArg.properties
            .filter(ts.isPropertyAssignment)
            .filter(function (propAss) {
            return ts.isIdentifier(propAss.name) &&
                TRANSFORM_IN_DECORATOR_PROPS.includes(propAss.name.text);
        })); }, [])); }, []);
    }
    /**
     * Clones the styles assignment and manipulates it.
     * @param node the property assignment to change
     */
    function transformStylesAssignmentForJest(node) {
        var mutableNode = ts.getMutableClone(node);
        var assignments = getInDecoratorPropertyAssignmentsToTransform(mutableNode);
        assignments.forEach(function (assignment) {
            if (assignment.name.text === STYLES) {
                // replace initializer array with empty array
                assignment.initializer = ts.createArrayLiteral();
            }
        });
        return mutableNode;
    }
    /**
     * Create a source file visitor which will visit all nodes in a source file
     * @param ctx The typescript transformation context
     * @param _ The owning source file
     */
    function createVisitor(ctx, _) {
        /**
         * Main visitor, which will be called recursively for each node in the source file's AST
         * @param node The node to be visited
         */
        var visitor = function (node) {
            // before we create a deep clone to modify, we make sure that
            // this is an assignment which we want to transform
            if (isInDecoratorPropertyAssignmentToTransform(node)) {
                // get transformed node with changed properties
                return transformStylesAssignmentForJest(node);
            }
            else {
                // else look for assignments inside this node recursively
                return ts.visitEachChild(node, visitor, ctx);
            }
        };
        return visitor;
    }
    return function (ctx) { return function (sf) { return ts.visitNode(sf, createVisitor(ctx, sf)); }; };
}
exports.factory = factory;
