(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/effects/schematics-core/utility/ast-utils", ["require", "exports", "typescript", "@ngrx/effects/schematics-core/utility/change"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /* istanbul ignore file */
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    const ts = require("typescript");
    const change_1 = require("@ngrx/effects/schematics-core/utility/change");
    /**
     * Find all nodes from the AST in the subtree of node of SyntaxKind kind.
     * @param node
     * @param kind
     * @param max The maximum number of items to return.
     * @return all nodes of kind, or [] if none is found
     */
    function findNodes(node, kind, max = Infinity) {
        if (!node || max == 0) {
            return [];
        }
        const arr = [];
        if (node.kind === kind) {
            arr.push(node);
            max--;
        }
        if (max > 0) {
            for (const child of node.getChildren()) {
                findNodes(child, kind, max).forEach(node => {
                    if (max > 0) {
                        arr.push(node);
                    }
                    max--;
                });
                if (max <= 0) {
                    break;
                }
            }
        }
        return arr;
    }
    exports.findNodes = findNodes;
    /**
     * Get all the nodes from a source.
     * @param sourceFile The source file object.
     * @returns {Observable<ts.Node>} An observable of all the nodes in the source.
     */
    function getSourceNodes(sourceFile) {
        const nodes = [sourceFile];
        const result = [];
        while (nodes.length > 0) {
            const node = nodes.shift();
            if (node) {
                result.push(node);
                if (node.getChildCount(sourceFile) >= 0) {
                    nodes.unshift(...node.getChildren());
                }
            }
        }
        return result;
    }
    exports.getSourceNodes = getSourceNodes;
    /**
     * Helper for sorting nodes.
     * @return function to sort nodes in increasing order of position in sourceFile
     */
    function nodesByPosition(first, second) {
        return first.pos - second.pos;
    }
    /**
     * Insert `toInsert` after the last occurence of `ts.SyntaxKind[nodes[i].kind]`
     * or after the last of occurence of `syntaxKind` if the last occurence is a sub child
     * of ts.SyntaxKind[nodes[i].kind] and save the changes in file.
     *
     * @param nodes insert after the last occurence of nodes
     * @param toInsert string to insert
     * @param file file to insert changes into
     * @param fallbackPos position to insert if toInsert happens to be the first occurence
     * @param syntaxKind the ts.SyntaxKind of the subchildren to insert after
     * @return Change instance
     * @throw Error if toInsert is first occurence but fall back is not set
     */
    function insertAfterLastOccurrence(nodes, toInsert, file, fallbackPos, syntaxKind) {
        let lastItem = nodes.sort(nodesByPosition).pop();
        if (!lastItem) {
            throw new Error();
        }
        if (syntaxKind) {
            lastItem = findNodes(lastItem, syntaxKind)
                .sort(nodesByPosition)
                .pop();
        }
        if (!lastItem && fallbackPos == undefined) {
            throw new Error(`tried to insert ${toInsert} as first occurence with no fallback position`);
        }
        const lastItemPosition = lastItem ? lastItem.end : fallbackPos;
        return new change_1.InsertChange(file, lastItemPosition, toInsert);
    }
    exports.insertAfterLastOccurrence = insertAfterLastOccurrence;
    function getContentOfKeyLiteral(_source, node) {
        if (node.kind == ts.SyntaxKind.Identifier) {
            return node.text;
        }
        else if (node.kind == ts.SyntaxKind.StringLiteral) {
            return node.text;
        }
        else {
            return null;
        }
    }
    exports.getContentOfKeyLiteral = getContentOfKeyLiteral;
    function _angularImportsFromNode(node, _sourceFile) {
        const ms = node.moduleSpecifier;
        let modulePath;
        switch (ms.kind) {
            case ts.SyntaxKind.StringLiteral:
                modulePath = ms.text;
                break;
            default:
                return {};
        }
        if (!modulePath.startsWith('@angular/')) {
            return {};
        }
        if (node.importClause) {
            if (node.importClause.name) {
                // This is of the form `import Name from 'path'`. Ignore.
                return {};
            }
            else if (node.importClause.namedBindings) {
                const nb = node.importClause.namedBindings;
                if (nb.kind == ts.SyntaxKind.NamespaceImport) {
                    // This is of the form `import * as name from 'path'`. Return `name.`.
                    return {
                        [nb.name.text + '.']: modulePath,
                    };
                }
                else {
                    // This is of the form `import {a,b,c} from 'path'`
                    const namedImports = nb;
                    return namedImports.elements
                        .map((is) => is.propertyName ? is.propertyName.text : is.name.text)
                        .reduce((acc, curr) => {
                        acc[curr] = modulePath;
                        return acc;
                    }, {});
                }
            }
            return {};
        }
        else {
            // This is of the form `import 'path';`. Nothing to do.
            return {};
        }
    }
    function getDecoratorMetadata(source, identifier, module) {
        const angularImports = findNodes(source, ts.SyntaxKind.ImportDeclaration)
            .map(node => _angularImportsFromNode(node, source))
            .reduce((acc, current) => {
            for (const key of Object.keys(current)) {
                acc[key] = current[key];
            }
            return acc;
        }, {});
        return getSourceNodes(source)
            .filter(node => {
            return (node.kind == ts.SyntaxKind.Decorator &&
                node.expression.kind == ts.SyntaxKind.CallExpression);
        })
            .map(node => node.expression)
            .filter(expr => {
            if (expr.expression.kind == ts.SyntaxKind.Identifier) {
                const id = expr.expression;
                return (id.getFullText(source) == identifier &&
                    angularImports[id.getFullText(source)] === module);
            }
            else if (expr.expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
                // This covers foo.NgModule when importing * as foo.
                const paExpr = expr.expression;
                // If the left expression is not an identifier, just give up at that point.
                if (paExpr.expression.kind !== ts.SyntaxKind.Identifier) {
                    return false;
                }
                const id = paExpr.name.text;
                const moduleId = paExpr.expression.getText(source);
                return id === identifier && angularImports[moduleId + '.'] === module;
            }
            return false;
        })
            .filter(expr => expr.arguments[0] &&
            expr.arguments[0].kind == ts.SyntaxKind.ObjectLiteralExpression)
            .map(expr => expr.arguments[0]);
    }
    exports.getDecoratorMetadata = getDecoratorMetadata;
    function _addSymbolToNgModuleMetadata(source, ngModulePath, metadataField, symbolName, importPath) {
        const nodes = getDecoratorMetadata(source, 'NgModule', '@angular/core');
        let node = nodes[0]; // tslint:disable-line:no-any
        // Find the decorator declaration.
        if (!node) {
            return [];
        }
        // Get all the children property assignment of object literals.
        const matchingProperties = node.properties
            .filter(prop => prop.kind == ts.SyntaxKind.PropertyAssignment)
            // Filter out every fields that's not "metadataField". Also handles string literals
            // (but not expressions).
            .filter((prop) => {
            const name = prop.name;
            switch (name.kind) {
                case ts.SyntaxKind.Identifier:
                    return name.getText(source) == metadataField;
                case ts.SyntaxKind.StringLiteral:
                    return name.text == metadataField;
            }
            return false;
        });
        // Get the last node of the array literal.
        if (!matchingProperties) {
            return [];
        }
        if (matchingProperties.length == 0) {
            // We haven't found the field in the metadata declaration. Insert a new field.
            const expr = node;
            let position;
            let toInsert;
            if (expr.properties.length == 0) {
                position = expr.getEnd() - 1;
                toInsert = `  ${metadataField}: [${symbolName}]\n`;
            }
            else {
                node = expr.properties[expr.properties.length - 1];
                position = node.getEnd();
                // Get the indentation of the last element, if any.
                const text = node.getFullText(source);
                const matches = text.match(/^\r?\n\s*/);
                if (matches.length > 0) {
                    toInsert = `,${matches[0]}${metadataField}: [${symbolName}]`;
                }
                else {
                    toInsert = `, ${metadataField}: [${symbolName}]`;
                }
            }
            const newMetadataProperty = new change_1.InsertChange(ngModulePath, position, toInsert);
            const newMetadataImport = insertImport(source, ngModulePath, symbolName.replace(/\..*$/, ''), importPath);
            return [newMetadataProperty, newMetadataImport];
        }
        const assignment = matchingProperties[0];
        // If it's not an array, nothing we can do really.
        if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
            return [];
        }
        const arrLiteral = assignment.initializer;
        if (arrLiteral.elements.length == 0) {
            // Forward the property.
            node = arrLiteral;
        }
        else {
            node = arrLiteral.elements;
        }
        if (!node) {
            console.log('No app module found. Please add your new class to your component.');
            return [];
        }
        if (Array.isArray(node)) {
            const nodeArray = node;
            const symbolsArray = nodeArray.map(node => node.getText());
            if (symbolsArray.includes(symbolName)) {
                return [];
            }
            node = node[node.length - 1];
            const effectsModule = nodeArray.find(node => (node.getText().includes('EffectsModule.forRoot') &&
                symbolName.includes('EffectsModule.forRoot')) ||
                (node.getText().includes('EffectsModule.forFeature') &&
                    symbolName.includes('EffectsModule.forFeature')));
            if (effectsModule && symbolName.includes('EffectsModule')) {
                const effectsArgs = effectsModule.arguments.shift();
                if (effectsArgs &&
                    effectsArgs.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                    const effectsElements = effectsArgs
                        .elements;
                    const [, effectsSymbol] = symbolName.match(/\[(.*)\]/);
                    let epos;
                    if (effectsElements.length === 0) {
                        epos = effectsArgs.getStart() + 1;
                        return [new change_1.InsertChange(ngModulePath, epos, effectsSymbol)];
                    }
                    else {
                        const lastEffect = effectsElements[effectsElements.length - 1];
                        epos = lastEffect.getEnd();
                        // Get the indentation of the last element, if any.
                        const text = lastEffect.getFullText(source);
                        let effectInsert;
                        if (text.match('^\r?\r?\n')) {
                            effectInsert = `,${text.match(/^\r?\n\s+/)[0]}${effectsSymbol}`;
                        }
                        else {
                            effectInsert = `, ${effectsSymbol}`;
                        }
                        return [new change_1.InsertChange(ngModulePath, epos, effectInsert)];
                    }
                }
                else {
                    return [];
                }
            }
        }
        let toInsert;
        let position = node.getEnd();
        if (node.kind == ts.SyntaxKind.ObjectLiteralExpression) {
            // We haven't found the field in the metadata declaration. Insert a new
            // field.
            const expr = node;
            if (expr.properties.length == 0) {
                position = expr.getEnd() - 1;
                toInsert = `  ${metadataField}: [${symbolName}]\n`;
            }
            else {
                node = expr.properties[expr.properties.length - 1];
                position = node.getEnd();
                // Get the indentation of the last element, if any.
                const text = node.getFullText(source);
                if (text.match('^\r?\r?\n')) {
                    toInsert = `,${text.match(/^\r?\n\s+/)[0]}${metadataField}: [${symbolName}]`;
                }
                else {
                    toInsert = `, ${metadataField}: [${symbolName}]`;
                }
            }
        }
        else if (node.kind == ts.SyntaxKind.ArrayLiteralExpression) {
            // We found the field but it's empty. Insert it just before the `]`.
            position--;
            toInsert = `${symbolName}`;
        }
        else {
            // Get the indentation of the last element, if any.
            const text = node.getFullText(source);
            if (text.match(/^\r?\n/)) {
                toInsert = `,${text.match(/^\r?\n(\r?)\s+/)[0]}${symbolName}`;
            }
            else {
                toInsert = `, ${symbolName}`;
            }
        }
        const insert = new change_1.InsertChange(ngModulePath, position, toInsert);
        const importInsert = insertImport(source, ngModulePath, symbolName.replace(/\..*$/, ''), importPath);
        return [insert, importInsert];
    }
    /**
     * Custom function to insert a declaration (component, pipe, directive)
     * into NgModule declarations. It also imports the component.
     */
    function addDeclarationToModule(source, modulePath, classifiedName, importPath) {
        return _addSymbolToNgModuleMetadata(source, modulePath, 'declarations', classifiedName, importPath);
    }
    exports.addDeclarationToModule = addDeclarationToModule;
    /**
     * Custom function to insert a declaration (component, pipe, directive)
     * into NgModule declarations. It also imports the component.
     */
    function addImportToModule(source, modulePath, classifiedName, importPath) {
        return _addSymbolToNgModuleMetadata(source, modulePath, 'imports', classifiedName, importPath);
    }
    exports.addImportToModule = addImportToModule;
    /**
     * Custom function to insert a provider into NgModule. It also imports it.
     */
    function addProviderToModule(source, modulePath, classifiedName, importPath) {
        return _addSymbolToNgModuleMetadata(source, modulePath, 'providers', classifiedName, importPath);
    }
    exports.addProviderToModule = addProviderToModule;
    /**
     * Custom function to insert an export into NgModule. It also imports it.
     */
    function addExportToModule(source, modulePath, classifiedName, importPath) {
        return _addSymbolToNgModuleMetadata(source, modulePath, 'exports', classifiedName, importPath);
    }
    exports.addExportToModule = addExportToModule;
    /**
     * Custom function to insert an export into NgModule. It also imports it.
     */
    function addBootstrapToModule(source, modulePath, classifiedName, importPath) {
        return _addSymbolToNgModuleMetadata(source, modulePath, 'bootstrap', classifiedName, importPath);
    }
    exports.addBootstrapToModule = addBootstrapToModule;
    /**
     * Add Import `import { symbolName } from fileName` if the import doesn't exit
     * already. Assumes fileToEdit can be resolved and accessed.
     * @param fileToEdit (file we want to add import to)
     * @param symbolName (item to import)
     * @param fileName (path to the file)
     * @param isDefault (if true, import follows style for importing default exports)
     * @return Change
     */
    function insertImport(source, fileToEdit, symbolName, fileName, isDefault = false) {
        const rootNode = source;
        const allImports = findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);
        // get nodes that map to import statements from the file fileName
        const relevantImports = allImports.filter(node => {
            // StringLiteral of the ImportDeclaration is the import file (fileName in this case).
            const importFiles = node
                .getChildren()
                .filter(child => child.kind === ts.SyntaxKind.StringLiteral)
                .map(n => n.text);
            return importFiles.filter(file => file === fileName).length === 1;
        });
        if (relevantImports.length > 0) {
            let importsAsterisk = false;
            // imports from import file
            const imports = [];
            relevantImports.forEach(n => {
                Array.prototype.push.apply(imports, findNodes(n, ts.SyntaxKind.Identifier));
                if (findNodes(n, ts.SyntaxKind.AsteriskToken).length > 0) {
                    importsAsterisk = true;
                }
            });
            // if imports * from fileName, don't add symbolName
            if (importsAsterisk) {
                return new change_1.NoopChange();
            }
            const importTextNodes = imports.filter(n => n.text === symbolName);
            // insert import if it's not there
            if (importTextNodes.length === 0) {
                const fallbackPos = findNodes(relevantImports[0], ts.SyntaxKind.CloseBraceToken)[0].getStart() ||
                    findNodes(relevantImports[0], ts.SyntaxKind.FromKeyword)[0].getStart();
                return insertAfterLastOccurrence(imports, `, ${symbolName}`, fileToEdit, fallbackPos);
            }
            return new change_1.NoopChange();
        }
        // no such import declaration exists
        const useStrict = findNodes(rootNode, ts.SyntaxKind.StringLiteral).filter(n => n.getText() === 'use strict');
        let fallbackPos = 0;
        if (useStrict.length > 0) {
            fallbackPos = useStrict[0].end;
        }
        const open = isDefault ? '' : '{ ';
        const close = isDefault ? '' : ' }';
        // if there are no imports or 'use strict' statement, insert import at beginning of file
        const insertAtBeginning = allImports.length === 0 && useStrict.length === 0;
        const separator = insertAtBeginning ? '' : ';\n';
        const toInsert = `${separator}import ${open}${symbolName}${close}` +
            ` from '${fileName}'${insertAtBeginning ? ';\n' : ''}`;
        return insertAfterLastOccurrence(allImports, toInsert, fileToEdit, fallbackPos, ts.SyntaxKind.StringLiteral);
    }
    exports.insertImport = insertImport;
    function replaceImport(sourceFile, path, importFrom, importAsIs, importToBe) {
        const imports = sourceFile.statements
            .filter(ts.isImportDeclaration)
            .filter(({ moduleSpecifier }) => moduleSpecifier.getText(sourceFile) === `'${importFrom}'` ||
            moduleSpecifier.getText(sourceFile) === `"${importFrom}"`);
        if (imports.length === 0) {
            return [];
        }
        const importText = (specifier) => {
            if (specifier.name.text) {
                return specifier.name.text;
            }
            // if import is renamed
            if (specifier.propertyName && specifier.propertyName.text) {
                return specifier.propertyName.text;
            }
            return '';
        };
        const changes = imports.map(p => {
            const importSpecifiers = p.importClause.namedBindings
                .elements;
            const isAlreadyImported = importSpecifiers
                .map(importText)
                .includes(importToBe);
            const importChanges = importSpecifiers.map((specifier, index) => {
                const text = importText(specifier);
                // import is not the one we're looking for, can be skipped
                if (text !== importAsIs) {
                    return undefined;
                }
                // identifier has not been imported, simply replace the old text with the new text
                if (!isAlreadyImported) {
                    return change_1.createReplaceChange(sourceFile, specifier, importAsIs, importToBe);
                }
                const nextIdentifier = importSpecifiers[index + 1];
                // identifer is not the last, also clean up the comma
                if (nextIdentifier) {
                    return change_1.createRemoveChange(sourceFile, specifier, specifier.getStart(sourceFile), nextIdentifier.getStart(sourceFile));
                }
                // there are no imports following, just remove it
                return change_1.createRemoveChange(sourceFile, specifier, specifier.getStart(sourceFile), specifier.getEnd());
            });
            return importChanges.filter(Boolean);
        });
        return changes.reduce((imports, curr) => imports.concat(curr), []);
    }
    exports.replaceImport = replaceImport;
    function containsProperty(objectLiteral, propertyName) {
        return (objectLiteral &&
            objectLiteral.properties.some(prop => ts.isPropertyAssignment(prop) &&
                ts.isIdentifier(prop.name) &&
                prop.name.text === propertyName));
    }
    exports.containsProperty = containsProperty;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0LXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbW9kdWxlcy9lZmZlY3RzL3NjaGVtYXRpY3MtY29yZS91dGlsaXR5L2FzdC11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBLDBCQUEwQjtJQUMxQjs7Ozs7O09BTUc7SUFDSCxpQ0FBaUM7SUFDakMseUVBUWtCO0lBR2xCOzs7Ozs7T0FNRztJQUNILFNBQWdCLFNBQVMsQ0FDdkIsSUFBYSxFQUNiLElBQW1CLEVBQ25CLEdBQUcsR0FBRyxRQUFRO1FBRWQsSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFO1lBQ3JCLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxNQUFNLEdBQUcsR0FBYyxFQUFFLENBQUM7UUFDMUIsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtZQUN0QixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsR0FBRyxFQUFFLENBQUM7U0FDUDtRQUNELElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtZQUNYLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUN0QyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3pDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTt3QkFDWCxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNoQjtvQkFDRCxHQUFHLEVBQUUsQ0FBQztnQkFDUixDQUFDLENBQUMsQ0FBQztnQkFFSCxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUU7b0JBQ1osTUFBTTtpQkFDUDthQUNGO1NBQ0Y7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUE5QkQsOEJBOEJDO0lBRUQ7Ozs7T0FJ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QUFFLENBQ25CLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sYUFBYSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQXFDLENBQUM7UUFDM0UsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFsRkQsc0NBa0ZDO0lBRUQsU0FBZ0IsZ0JBQWdCLENBQzlCLGFBQXlDLEVBQ3pDLFlBQW9CO1FBRXBCLE9BQU8sQ0FDTCxhQUFhO1lBQ2IsYUFBYSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQzNCLElBQUksQ0FBQyxFQUFFLENBQ0wsRUFBRSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQztnQkFDN0IsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxZQUFZLENBQ2xDLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFiRCw0Q0FhQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGlzdGFuYnVsIGlnbm9yZSBmaWxlICovXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7XG4gIENoYW5nZSxcbiAgSW5zZXJ0Q2hhbmdlLFxuICBOb29wQ2hhbmdlLFxuICBjcmVhdGVSZXBsYWNlQ2hhbmdlLFxuICBSZXBsYWNlQ2hhbmdlLFxuICBSZW1vdmVDaGFuZ2UsXG4gIGNyZWF0ZVJlbW92ZUNoYW5nZSxcbn0gZnJvbSAnLi9jaGFuZ2UnO1xuaW1wb3J0IHsgUGF0aCB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcblxuLyoqXG4gKiBGaW5kIGFsbCBub2RlcyBmcm9tIHRoZSBBU1QgaW4gdGhlIHN1YnRyZWUgb2Ygbm9kZSBvZiBTeW50YXhLaW5kIGtpbmQuXG4gKiBAcGFyYW0gbm9kZVxuICogQHBhcmFtIGtpbmRcbiAqIEBwYXJhbSBtYXggVGhlIG1heGltdW0gbnVtYmVyIG9mIGl0ZW1zIHRvIHJldHVybi5cbiAqIEByZXR1cm4gYWxsIG5vZGVzIG9mIGtpbmQsIG9yIFtdIGlmIG5vbmUgaXMgZm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmROb2RlcyhcbiAgbm9kZTogdHMuTm9kZSxcbiAga2luZDogdHMuU3ludGF4S2luZCxcbiAgbWF4ID0gSW5maW5pdHlcbik6IHRzLk5vZGVbXSB7XG4gIGlmICghbm9kZSB8fCBtYXggPT0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGNvbnN0IGFycjogdHMuTm9kZVtdID0gW107XG4gIGlmIChub2RlLmtpbmQgPT09IGtpbmQpIHtcbiAgICBhcnIucHVzaChub2RlKTtcbiAgICBtYXgtLTtcbiAgfVxuICBpZiAobWF4ID4gMCkge1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2Ygbm9kZS5nZXRDaGlsZHJlbigpKSB7XG4gICAgICBmaW5kTm9kZXMoY2hpbGQsIGtpbmQsIG1heCkuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgaWYgKG1heCA+IDApIHtcbiAgICAgICAgICBhcnIucHVzaChub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBtYXgtLTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobWF4IDw9IDApIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFycjtcbn1cblxuLyoqXG4gKiBHZXQgYWxsIHRoZSBub2RlcyBmcm9tIGEgc291cmNlLlxuICogQHBhcmFtIHNvdXJjZUZpbGUgVGhlIHNvdXJjZSBmaWxlIG9iamVjdC5cbiAqIEByZXR1cm5zIHtPYnNlcnZhYmxlPHRzLk5vZGU+fSBBbiBvYnNlcnZhYmxlIG9mIGFsbCB0aGUgbm9kZXMgaW4gdGhlIHNvdXJjZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNvdXJjZU5vZGVzKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiB0cy5Ob2RlW10ge1xuICBjb25zdCBub2RlczogdHMuTm9kZVtdID0gW3NvdXJjZUZpbGVdO1xuICBjb25zdCByZXN1bHQgPSBbXTtcblxuICB3aGlsZSAobm9kZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IG5vZGUgPSBub2Rlcy5zaGlmdCgpO1xuXG4gICAgaWYgKG5vZGUpIHtcbiAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xuICAgICAgaWYgKG5vZGUuZ2V0Q2hpbGRDb3VudChzb3VyY2VGaWxlKSA+PSAwKSB7XG4gICAgICAgIG5vZGVzLnVuc2hpZnQoLi4ubm9kZS5nZXRDaGlsZHJlbigpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEhlbHBlciBmb3Igc29ydGluZyBub2Rlcy5cbiAqIEByZXR1cm4gZnVuY3Rpb24gdG8gc29ydCBub2RlcyBpbiBpbmNyZWFzaW5nIG9yZGVyIG9mIHBvc2l0aW9uIGluIHNvdXJjZUZpbGVcbiAqL1xuZnVuY3Rpb24gbm9kZXNCeVBvc2l0aW9uKGZpcnN0OiB0cy5Ob2RlLCBzZWNvbmQ6IHRzLk5vZGUpOiBudW1iZXIge1xuICByZXR1cm4gZmlyc3QucG9zIC0gc2Vjb25kLnBvcztcbn1cblxuLyoqXG4gKiBJbnNlcnQgYHRvSW5zZXJ0YCBhZnRlciB0aGUgbGFzdCBvY2N1cmVuY2Ugb2YgYHRzLlN5bnRheEtpbmRbbm9kZXNbaV0ua2luZF1gXG4gKiBvciBhZnRlciB0aGUgbGFzdCBvZiBvY2N1cmVuY2Ugb2YgYHN5bnRheEtpbmRgIGlmIHRoZSBsYXN0IG9jY3VyZW5jZSBpcyBhIHN1YiBjaGlsZFxuICogb2YgdHMuU3ludGF4S2luZFtub2Rlc1tpXS5raW5kXSBhbmQgc2F2ZSB0aGUgY2hhbmdlcyBpbiBmaWxlLlxuICpcbiAqIEBwYXJhbSBub2RlcyBpbnNlcnQgYWZ0ZXIgdGhlIGxhc3Qgb2NjdXJlbmNlIG9mIG5vZGVzXG4gKiBAcGFyYW0gdG9JbnNlcnQgc3RyaW5nIHRvIGluc2VydFxuICogQHBhcmFtIGZpbGUgZmlsZSB0byBpbnNlcnQgY2hhbmdlcyBpbnRvXG4gKiBAcGFyYW0gZmFsbGJhY2tQb3MgcG9zaXRpb24gdG8gaW5zZXJ0IGlmIHRvSW5zZXJ0IGhhcHBlbnMgdG8gYmUgdGhlIGZpcnN0IG9jY3VyZW5jZVxuICogQHBhcmFtIHN5bnRheEtpbmQgdGhlIHRzLlN5bnRheEtpbmQgb2YgdGhlIHN1YmNoaWxkcmVuIHRvIGluc2VydCBhZnRlclxuICogQHJldHVybiBDaGFuZ2UgaW5zdGFuY2VcbiAqIEB0aHJvdyBFcnJvciBpZiB0b0luc2VydCBpcyBmaXJzdCBvY2N1cmVuY2UgYnV0IGZhbGwgYmFjayBpcyBub3Qgc2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnRBZnRlckxhc3RPY2N1cnJlbmNlKFxuICBub2RlczogdHMuTm9kZVtdLFxuICB0b0luc2VydDogc3RyaW5nLFxuICBmaWxlOiBzdHJpbmcsXG4gIGZhbGxiYWNrUG9zOiBudW1iZXIsXG4gIHN5bnRheEtpbmQ/OiB0cy5TeW50YXhLaW5kXG4pOiBDaGFuZ2Uge1xuICBsZXQgbGFzdEl0ZW0gPSBub2Rlcy5zb3J0KG5vZGVzQnlQb3NpdGlvbikucG9wKCk7XG4gIGlmICghbGFzdEl0ZW0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgfVxuICBpZiAoc3ludGF4S2luZCkge1xuICAgIGxhc3RJdGVtID0gZmluZE5vZGVzKGxhc3RJdGVtLCBzeW50YXhLaW5kKVxuICAgICAgLnNvcnQobm9kZXNCeVBvc2l0aW9uKVxuICAgICAgLnBvcCgpO1xuICB9XG4gIGlmICghbGFzdEl0ZW0gJiYgZmFsbGJhY2tQb3MgPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYHRyaWVkIHRvIGluc2VydCAke3RvSW5zZXJ0fSBhcyBmaXJzdCBvY2N1cmVuY2Ugd2l0aCBubyBmYWxsYmFjayBwb3NpdGlvbmBcbiAgICApO1xuICB9XG4gIGNvbnN0IGxhc3RJdGVtUG9zaXRpb246IG51bWJlciA9IGxhc3RJdGVtID8gbGFzdEl0ZW0uZW5kIDogZmFsbGJhY2tQb3M7XG5cbiAgcmV0dXJuIG5ldyBJbnNlcnRDaGFuZ2UoZmlsZSwgbGFzdEl0ZW1Qb3NpdGlvbiwgdG9JbnNlcnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGVudE9mS2V5TGl0ZXJhbChcbiAgX3NvdXJjZTogdHMuU291cmNlRmlsZSxcbiAgbm9kZTogdHMuTm9kZVxuKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmIChub2RlLmtpbmQgPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgcmV0dXJuIChub2RlIGFzIHRzLklkZW50aWZpZXIpLnRleHQ7XG4gIH0gZWxzZSBpZiAobm9kZS5raW5kID09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCkge1xuICAgIHJldHVybiAobm9kZSBhcyB0cy5TdHJpbmdMaXRlcmFsKS50ZXh0O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9hbmd1bGFySW1wb3J0c0Zyb21Ob2RlKFxuICBub2RlOiB0cy5JbXBvcnREZWNsYXJhdGlvbixcbiAgX3NvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGVcbik6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9IHtcbiAgY29uc3QgbXMgPSBub2RlLm1vZHVsZVNwZWNpZmllcjtcbiAgbGV0IG1vZHVsZVBhdGg6IHN0cmluZztcbiAgc3dpdGNoIChtcy5raW5kKSB7XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6XG4gICAgICBtb2R1bGVQYXRoID0gKG1zIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQ7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgaWYgKCFtb2R1bGVQYXRoLnN0YXJ0c1dpdGgoJ0Bhbmd1bGFyLycpKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgaWYgKG5vZGUuaW1wb3J0Q2xhdXNlKSB7XG4gICAgaWYgKG5vZGUuaW1wb3J0Q2xhdXNlLm5hbWUpIHtcbiAgICAgIC8vIFRoaXMgaXMgb2YgdGhlIGZvcm0gYGltcG9ydCBOYW1lIGZyb20gJ3BhdGgnYC4gSWdub3JlLlxuICAgICAgcmV0dXJuIHt9O1xuICAgIH0gZWxzZSBpZiAobm9kZS5pbXBvcnRDbGF1c2UubmFtZWRCaW5kaW5ncykge1xuICAgICAgY29uc3QgbmIgPSBub2RlLmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzO1xuICAgICAgaWYgKG5iLmtpbmQgPT0gdHMuU3ludGF4S2luZC5OYW1lc3BhY2VJbXBvcnQpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBvZiB0aGUgZm9ybSBgaW1wb3J0ICogYXMgbmFtZSBmcm9tICdwYXRoJ2AuIFJldHVybiBgbmFtZS5gLlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIFsobmIgYXMgdHMuTmFtZXNwYWNlSW1wb3J0KS5uYW1lLnRleHQgKyAnLiddOiBtb2R1bGVQYXRoLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhpcyBpcyBvZiB0aGUgZm9ybSBgaW1wb3J0IHthLGIsY30gZnJvbSAncGF0aCdgXG4gICAgICAgIGNvbnN0IG5hbWVkSW1wb3J0cyA9IG5iIGFzIHRzLk5hbWVkSW1wb3J0cztcblxuICAgICAgICByZXR1cm4gbmFtZWRJbXBvcnRzLmVsZW1lbnRzXG4gICAgICAgICAgLm1hcChcbiAgICAgICAgICAgIChpczogdHMuSW1wb3J0U3BlY2lmaWVyKSA9PlxuICAgICAgICAgICAgICBpcy5wcm9wZXJ0eU5hbWUgPyBpcy5wcm9wZXJ0eU5hbWUudGV4dCA6IGlzLm5hbWUudGV4dFxuICAgICAgICAgIClcbiAgICAgICAgICAucmVkdWNlKChhY2M6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9LCBjdXJyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGFjY1tjdXJyXSA9IG1vZHVsZVBhdGg7XG5cbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgfSwge30pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7fTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGlzIGlzIG9mIHRoZSBmb3JtIGBpbXBvcnQgJ3BhdGgnO2AuIE5vdGhpbmcgdG8gZG8uXG4gICAgcmV0dXJuIHt9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWNvcmF0b3JNZXRhZGF0YShcbiAgc291cmNlOiB0cy5Tb3VyY2VGaWxlLFxuICBpZGVudGlmaWVyOiBzdHJpbmcsXG4gIG1vZHVsZTogc3RyaW5nXG4pOiB0cy5Ob2RlW10ge1xuICBjb25zdCBhbmd1bGFySW1wb3J0czogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0gPSBmaW5kTm9kZXMoXG4gICAgc291cmNlLFxuICAgIHRzLlN5bnRheEtpbmQuSW1wb3J0RGVjbGFyYXRpb25cbiAgKVxuICAgIC5tYXAobm9kZSA9PiBfYW5ndWxhckltcG9ydHNGcm9tTm9kZShub2RlIGFzIHRzLkltcG9ydERlY2xhcmF0aW9uLCBzb3VyY2UpKVxuICAgIC5yZWR1Y2UoXG4gICAgICAoXG4gICAgICAgIGFjYzogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0sXG4gICAgICAgIGN1cnJlbnQ6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9XG4gICAgICApID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoY3VycmVudCkpIHtcbiAgICAgICAgICBhY2Nba2V5XSA9IGN1cnJlbnRba2V5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgICB9LFxuICAgICAge31cbiAgICApO1xuXG4gIHJldHVybiBnZXRTb3VyY2VOb2Rlcyhzb3VyY2UpXG4gICAgLmZpbHRlcihub2RlID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIG5vZGUua2luZCA9PSB0cy5TeW50YXhLaW5kLkRlY29yYXRvciAmJlxuICAgICAgICAobm9kZSBhcyB0cy5EZWNvcmF0b3IpLmV4cHJlc3Npb24ua2luZCA9PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uXG4gICAgICApO1xuICAgIH0pXG4gICAgLm1hcChub2RlID0+IChub2RlIGFzIHRzLkRlY29yYXRvcikuZXhwcmVzc2lvbiBhcyB0cy5DYWxsRXhwcmVzc2lvbilcbiAgICAuZmlsdGVyKGV4cHIgPT4ge1xuICAgICAgaWYgKGV4cHIuZXhwcmVzc2lvbi5raW5kID09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgICBjb25zdCBpZCA9IGV4cHIuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgaWQuZ2V0RnVsbFRleHQoc291cmNlKSA9PSBpZGVudGlmaWVyICYmXG4gICAgICAgICAgYW5ndWxhckltcG9ydHNbaWQuZ2V0RnVsbFRleHQoc291cmNlKV0gPT09IG1vZHVsZVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgZXhwci5leHByZXNzaW9uLmtpbmQgPT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb25cbiAgICAgICkge1xuICAgICAgICAvLyBUaGlzIGNvdmVycyBmb28uTmdNb2R1bGUgd2hlbiBpbXBvcnRpbmcgKiBhcyBmb28uXG4gICAgICAgIGNvbnN0IHBhRXhwciA9IGV4cHIuZXhwcmVzc2lvbiBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb247XG4gICAgICAgIC8vIElmIHRoZSBsZWZ0IGV4cHJlc3Npb24gaXMgbm90IGFuIGlkZW50aWZpZXIsIGp1c3QgZ2l2ZSB1cCBhdCB0aGF0IHBvaW50LlxuICAgICAgICBpZiAocGFFeHByLmV4cHJlc3Npb24ua2luZCAhPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaWQgPSBwYUV4cHIubmFtZS50ZXh0O1xuICAgICAgICBjb25zdCBtb2R1bGVJZCA9IChwYUV4cHIuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyKS5nZXRUZXh0KHNvdXJjZSk7XG5cbiAgICAgICAgcmV0dXJuIGlkID09PSBpZGVudGlmaWVyICYmIGFuZ3VsYXJJbXBvcnRzW21vZHVsZUlkICsgJy4nXSA9PT0gbW9kdWxlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSlcbiAgICAuZmlsdGVyKFxuICAgICAgZXhwciA9PlxuICAgICAgICBleHByLmFyZ3VtZW50c1swXSAmJlxuICAgICAgICBleHByLmFyZ3VtZW50c1swXS5raW5kID09IHRzLlN5bnRheEtpbmQuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb25cbiAgICApXG4gICAgLm1hcChleHByID0+IGV4cHIuYXJndW1lbnRzWzBdIGFzIHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uKTtcbn1cblxuZnVuY3Rpb24gX2FkZFN5bWJvbFRvTmdNb2R1bGVNZXRhZGF0YShcbiAgc291cmNlOiB0cy5Tb3VyY2VGaWxlLFxuICBuZ01vZHVsZVBhdGg6IHN0cmluZyxcbiAgbWV0YWRhdGFGaWVsZDogc3RyaW5nLFxuICBzeW1ib2xOYW1lOiBzdHJpbmcsXG4gIGltcG9ydFBhdGg6IHN0cmluZ1xuKTogQ2hhbmdlW10ge1xuICBjb25zdCBub2RlcyA9IGdldERlY29yYXRvck1ldGFkYXRhKHNvdXJjZSwgJ05nTW9kdWxlJywgJ0Bhbmd1bGFyL2NvcmUnKTtcbiAgbGV0IG5vZGU6IGFueSA9IG5vZGVzWzBdOyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWFueVxuXG4gIC8vIEZpbmQgdGhlIGRlY29yYXRvciBkZWNsYXJhdGlvbi5cbiAgaWYgKCFub2RlKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgLy8gR2V0IGFsbCB0aGUgY2hpbGRyZW4gcHJvcGVydHkgYXNzaWdubWVudCBvZiBvYmplY3QgbGl0ZXJhbHMuXG4gIGNvbnN0IG1hdGNoaW5nUHJvcGVydGllczogdHMuT2JqZWN0TGl0ZXJhbEVsZW1lbnRbXSA9IChub2RlIGFzIHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uKS5wcm9wZXJ0aWVzXG4gICAgLmZpbHRlcihwcm9wID0+IHByb3Aua2luZCA9PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QXNzaWdubWVudClcbiAgICAvLyBGaWx0ZXIgb3V0IGV2ZXJ5IGZpZWxkcyB0aGF0J3Mgbm90IFwibWV0YWRhdGFGaWVsZFwiLiBBbHNvIGhhbmRsZXMgc3RyaW5nIGxpdGVyYWxzXG4gICAgLy8gKGJ1dCBub3QgZXhwcmVzc2lvbnMpLlxuICAgIC5maWx0ZXIoKHByb3A6IGFueSkgPT4ge1xuICAgICAgY29uc3QgbmFtZSA9IHByb3AubmFtZTtcbiAgICAgIHN3aXRjaCAobmFtZS5raW5kKSB7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5JZGVudGlmaWVyOlxuICAgICAgICAgIHJldHVybiAobmFtZSBhcyB0cy5JZGVudGlmaWVyKS5nZXRUZXh0KHNvdXJjZSkgPT0gbWV0YWRhdGFGaWVsZDtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgICAgcmV0dXJuIChuYW1lIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQgPT0gbWV0YWRhdGFGaWVsZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gIC8vIEdldCB0aGUgbGFzdCBub2RlIG9mIHRoZSBhcnJheSBsaXRlcmFsLlxuICBpZiAoIW1hdGNoaW5nUHJvcGVydGllcykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBpZiAobWF0Y2hpbmdQcm9wZXJ0aWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgLy8gV2UgaGF2ZW4ndCBmb3VuZCB0aGUgZmllbGQgaW4gdGhlIG1ldGFkYXRhIGRlY2xhcmF0aW9uLiBJbnNlcnQgYSBuZXcgZmllbGQuXG4gICAgY29uc3QgZXhwciA9IG5vZGUgYXMgdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb247XG4gICAgbGV0IHBvc2l0aW9uOiBudW1iZXI7XG4gICAgbGV0IHRvSW5zZXJ0OiBzdHJpbmc7XG4gICAgaWYgKGV4cHIucHJvcGVydGllcy5sZW5ndGggPT0gMCkge1xuICAgICAgcG9zaXRpb24gPSBleHByLmdldEVuZCgpIC0gMTtcbiAgICAgIHRvSW5zZXJ0ID0gYCAgJHttZXRhZGF0YUZpZWxkfTogWyR7c3ltYm9sTmFtZX1dXFxuYDtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZSA9IGV4cHIucHJvcGVydGllc1tleHByLnByb3BlcnRpZXMubGVuZ3RoIC0gMV07XG4gICAgICBwb3NpdGlvbiA9IG5vZGUuZ2V0RW5kKCk7XG4gICAgICAvLyBHZXQgdGhlIGluZGVudGF0aW9uIG9mIHRoZSBsYXN0IGVsZW1lbnQsIGlmIGFueS5cbiAgICAgIGNvbnN0IHRleHQgPSBub2RlLmdldEZ1bGxUZXh0KHNvdXJjZSk7XG4gICAgICBjb25zdCBtYXRjaGVzID0gdGV4dC5tYXRjaCgvXlxccj9cXG5cXHMqLyk7XG4gICAgICBpZiAobWF0Y2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRvSW5zZXJ0ID0gYCwke21hdGNoZXNbMF19JHttZXRhZGF0YUZpZWxkfTogWyR7c3ltYm9sTmFtZX1dYDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvSW5zZXJ0ID0gYCwgJHttZXRhZGF0YUZpZWxkfTogWyR7c3ltYm9sTmFtZX1dYDtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbmV3TWV0YWRhdGFQcm9wZXJ0eSA9IG5ldyBJbnNlcnRDaGFuZ2UoXG4gICAgICBuZ01vZHVsZVBhdGgsXG4gICAgICBwb3NpdGlvbixcbiAgICAgIHRvSW5zZXJ0XG4gICAgKTtcbiAgICBjb25zdCBuZXdNZXRhZGF0YUltcG9ydCA9IGluc2VydEltcG9ydChcbiAgICAgIHNvdXJjZSxcbiAgICAgIG5nTW9kdWxlUGF0aCxcbiAgICAgIHN5bWJvbE5hbWUucmVwbGFjZSgvXFwuLiokLywgJycpLFxuICAgICAgaW1wb3J0UGF0aFxuICAgICk7XG5cbiAgICByZXR1cm4gW25ld01ldGFkYXRhUHJvcGVydHksIG5ld01ldGFkYXRhSW1wb3J0XTtcbiAgfVxuXG4gIGNvbnN0IGFzc2lnbm1lbnQgPSBtYXRjaGluZ1Byb3BlcnRpZXNbMF0gYXMgdHMuUHJvcGVydHlBc3NpZ25tZW50O1xuXG4gIC8vIElmIGl0J3Mgbm90IGFuIGFycmF5LCBub3RoaW5nIHdlIGNhbiBkbyByZWFsbHkuXG4gIGlmIChhc3NpZ25tZW50LmluaXRpYWxpemVyLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbikge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGNvbnN0IGFyckxpdGVyYWwgPSBhc3NpZ25tZW50LmluaXRpYWxpemVyIGFzIHRzLkFycmF5TGl0ZXJhbEV4cHJlc3Npb247XG4gIGlmIChhcnJMaXRlcmFsLmVsZW1lbnRzLmxlbmd0aCA9PSAwKSB7XG4gICAgLy8gRm9yd2FyZCB0aGUgcHJvcGVydHkuXG4gICAgbm9kZSA9IGFyckxpdGVyYWw7XG4gIH0gZWxzZSB7XG4gICAgbm9kZSA9IGFyckxpdGVyYWwuZWxlbWVudHM7XG4gIH1cblxuICBpZiAoIW5vZGUpIHtcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgICdObyBhcHAgbW9kdWxlIGZvdW5kLiBQbGVhc2UgYWRkIHlvdXIgbmV3IGNsYXNzIHRvIHlvdXIgY29tcG9uZW50LidcbiAgICApO1xuXG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHtcbiAgICBjb25zdCBub2RlQXJyYXkgPSAobm9kZSBhcyB7fSkgYXMgQXJyYXk8dHMuTm9kZT47XG4gICAgY29uc3Qgc3ltYm9sc0FycmF5ID0gbm9kZUFycmF5Lm1hcChub2RlID0+IG5vZGUuZ2V0VGV4dCgpKTtcbiAgICBpZiAoc3ltYm9sc0FycmF5LmluY2x1ZGVzKHN5bWJvbE5hbWUpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgbm9kZSA9IG5vZGVbbm9kZS5sZW5ndGggLSAxXTtcblxuICAgIGNvbnN0IGVmZmVjdHNNb2R1bGUgPSBub2RlQXJyYXkuZmluZChcbiAgICAgIG5vZGUgPT5cbiAgICAgICAgKG5vZGUuZ2V0VGV4dCgpLmluY2x1ZGVzKCdFZmZlY3RzTW9kdWxlLmZvclJvb3QnKSAmJlxuICAgICAgICAgIHN5bWJvbE5hbWUuaW5jbHVkZXMoJ0VmZmVjdHNNb2R1bGUuZm9yUm9vdCcpKSB8fFxuICAgICAgICAobm9kZS5nZXRUZXh0KCkuaW5jbHVkZXMoJ0VmZmVjdHNNb2R1bGUuZm9yRmVhdHVyZScpICYmXG4gICAgICAgICAgc3ltYm9sTmFtZS5pbmNsdWRlcygnRWZmZWN0c01vZHVsZS5mb3JGZWF0dXJlJykpXG4gICAgKTtcblxuICAgIGlmIChlZmZlY3RzTW9kdWxlICYmIHN5bWJvbE5hbWUuaW5jbHVkZXMoJ0VmZmVjdHNNb2R1bGUnKSkge1xuICAgICAgY29uc3QgZWZmZWN0c0FyZ3MgPSAoZWZmZWN0c01vZHVsZSBhcyBhbnkpLmFyZ3VtZW50cy5zaGlmdCgpO1xuXG4gICAgICBpZiAoXG4gICAgICAgIGVmZmVjdHNBcmdzICYmXG4gICAgICAgIGVmZmVjdHNBcmdzLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvblxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGVmZmVjdHNFbGVtZW50cyA9IChlZmZlY3RzQXJncyBhcyB0cy5BcnJheUxpdGVyYWxFeHByZXNzaW9uKVxuICAgICAgICAgIC5lbGVtZW50cztcbiAgICAgICAgY29uc3QgWywgZWZmZWN0c1N5bWJvbF0gPSAoPGFueT5zeW1ib2xOYW1lKS5tYXRjaCgvXFxbKC4qKVxcXS8pO1xuXG4gICAgICAgIGxldCBlcG9zO1xuICAgICAgICBpZiAoZWZmZWN0c0VsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGVwb3MgPSBlZmZlY3RzQXJncy5nZXRTdGFydCgpICsgMTtcbiAgICAgICAgICByZXR1cm4gW25ldyBJbnNlcnRDaGFuZ2UobmdNb2R1bGVQYXRoLCBlcG9zLCBlZmZlY3RzU3ltYm9sKV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgbGFzdEVmZmVjdCA9IGVmZmVjdHNFbGVtZW50c1tcbiAgICAgICAgICAgIGVmZmVjdHNFbGVtZW50cy5sZW5ndGggLSAxXG4gICAgICAgICAgXSBhcyB0cy5FeHByZXNzaW9uO1xuICAgICAgICAgIGVwb3MgPSBsYXN0RWZmZWN0LmdldEVuZCgpO1xuICAgICAgICAgIC8vIEdldCB0aGUgaW5kZW50YXRpb24gb2YgdGhlIGxhc3QgZWxlbWVudCwgaWYgYW55LlxuICAgICAgICAgIGNvbnN0IHRleHQ6IGFueSA9IGxhc3RFZmZlY3QuZ2V0RnVsbFRleHQoc291cmNlKTtcblxuICAgICAgICAgIGxldCBlZmZlY3RJbnNlcnQ6IHN0cmluZztcbiAgICAgICAgICBpZiAodGV4dC5tYXRjaCgnXlxccj9cXHI/XFxuJykpIHtcbiAgICAgICAgICAgIGVmZmVjdEluc2VydCA9IGAsJHt0ZXh0Lm1hdGNoKC9eXFxyP1xcblxccysvKVswXX0ke2VmZmVjdHNTeW1ib2x9YDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWZmZWN0SW5zZXJ0ID0gYCwgJHtlZmZlY3RzU3ltYm9sfWA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFtuZXcgSW5zZXJ0Q2hhbmdlKG5nTW9kdWxlUGF0aCwgZXBvcywgZWZmZWN0SW5zZXJ0KV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBsZXQgdG9JbnNlcnQ6IHN0cmluZztcbiAgbGV0IHBvc2l0aW9uID0gbm9kZS5nZXRFbmQoKTtcbiAgaWYgKG5vZGUua2luZCA9PSB0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uKSB7XG4gICAgLy8gV2UgaGF2ZW4ndCBmb3VuZCB0aGUgZmllbGQgaW4gdGhlIG1ldGFkYXRhIGRlY2xhcmF0aW9uLiBJbnNlcnQgYSBuZXdcbiAgICAvLyBmaWVsZC5cbiAgICBjb25zdCBleHByID0gbm9kZSBhcyB0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbjtcbiAgICBpZiAoZXhwci5wcm9wZXJ0aWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICBwb3NpdGlvbiA9IGV4cHIuZ2V0RW5kKCkgLSAxO1xuICAgICAgdG9JbnNlcnQgPSBgICAke21ldGFkYXRhRmllbGR9OiBbJHtzeW1ib2xOYW1lfV1cXG5gO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlID0gZXhwci5wcm9wZXJ0aWVzW2V4cHIucHJvcGVydGllcy5sZW5ndGggLSAxXTtcbiAgICAgIHBvc2l0aW9uID0gbm9kZS5nZXRFbmQoKTtcbiAgICAgIC8vIEdldCB0aGUgaW5kZW50YXRpb24gb2YgdGhlIGxhc3QgZWxlbWVudCwgaWYgYW55LlxuICAgICAgY29uc3QgdGV4dCA9IG5vZGUuZ2V0RnVsbFRleHQoc291cmNlKTtcbiAgICAgIGlmICh0ZXh0Lm1hdGNoKCdeXFxyP1xccj9cXG4nKSkge1xuICAgICAgICB0b0luc2VydCA9IGAsJHtcbiAgICAgICAgICB0ZXh0Lm1hdGNoKC9eXFxyP1xcblxccysvKVswXVxuICAgICAgICB9JHttZXRhZGF0YUZpZWxkfTogWyR7c3ltYm9sTmFtZX1dYDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvSW5zZXJ0ID0gYCwgJHttZXRhZGF0YUZpZWxkfTogWyR7c3ltYm9sTmFtZX1dYDtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAobm9kZS5raW5kID09IHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbikge1xuICAgIC8vIFdlIGZvdW5kIHRoZSBmaWVsZCBidXQgaXQncyBlbXB0eS4gSW5zZXJ0IGl0IGp1c3QgYmVmb3JlIHRoZSBgXWAuXG4gICAgcG9zaXRpb24tLTtcbiAgICB0b0luc2VydCA9IGAke3N5bWJvbE5hbWV9YDtcbiAgfSBlbHNlIHtcbiAgICAvLyBHZXQgdGhlIGluZGVudGF0aW9uIG9mIHRoZSBsYXN0IGVsZW1lbnQsIGlmIGFueS5cbiAgICBjb25zdCB0ZXh0ID0gbm9kZS5nZXRGdWxsVGV4dChzb3VyY2UpO1xuICAgIGlmICh0ZXh0Lm1hdGNoKC9eXFxyP1xcbi8pKSB7XG4gICAgICB0b0luc2VydCA9IGAsJHt0ZXh0Lm1hdGNoKC9eXFxyP1xcbihcXHI/KVxccysvKVswXX0ke3N5bWJvbE5hbWV9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9JbnNlcnQgPSBgLCAke3N5bWJvbE5hbWV9YDtcbiAgICB9XG4gIH1cbiAgY29uc3QgaW5zZXJ0ID0gbmV3IEluc2VydENoYW5nZShuZ01vZHVsZVBhdGgsIHBvc2l0aW9uLCB0b0luc2VydCk7XG4gIGNvbnN0IGltcG9ydEluc2VydDogQ2hhbmdlID0gaW5zZXJ0SW1wb3J0KFxuICAgIHNvdXJjZSxcbiAgICBuZ01vZHVsZVBhdGgsXG4gICAgc3ltYm9sTmFtZS5yZXBsYWNlKC9cXC4uKiQvLCAnJyksXG4gICAgaW1wb3J0UGF0aFxuICApO1xuXG4gIHJldHVybiBbaW5zZXJ0LCBpbXBvcnRJbnNlcnRdO1xufVxuXG4vKipcbiAqIEN1c3RvbSBmdW5jdGlvbiB0byBpbnNlcnQgYSBkZWNsYXJhdGlvbiAoY29tcG9uZW50LCBwaXBlLCBkaXJlY3RpdmUpXG4gKiBpbnRvIE5nTW9kdWxlIGRlY2xhcmF0aW9ucy4gSXQgYWxzbyBpbXBvcnRzIHRoZSBjb21wb25lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGREZWNsYXJhdGlvblRvTW9kdWxlKFxuICBzb3VyY2U6IHRzLlNvdXJjZUZpbGUsXG4gIG1vZHVsZVBhdGg6IHN0cmluZyxcbiAgY2xhc3NpZmllZE5hbWU6IHN0cmluZyxcbiAgaW1wb3J0UGF0aDogc3RyaW5nXG4pOiBDaGFuZ2VbXSB7XG4gIHJldHVybiBfYWRkU3ltYm9sVG9OZ01vZHVsZU1ldGFkYXRhKFxuICAgIHNvdXJjZSxcbiAgICBtb2R1bGVQYXRoLFxuICAgICdkZWNsYXJhdGlvbnMnLFxuICAgIGNsYXNzaWZpZWROYW1lLFxuICAgIGltcG9ydFBhdGhcbiAgKTtcbn1cblxuLyoqXG4gKiBDdXN0b20gZnVuY3Rpb24gdG8gaW5zZXJ0IGEgZGVjbGFyYXRpb24gKGNvbXBvbmVudCwgcGlwZSwgZGlyZWN0aXZlKVxuICogaW50byBOZ01vZHVsZSBkZWNsYXJhdGlvbnMuIEl0IGFsc28gaW1wb3J0cyB0aGUgY29tcG9uZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkSW1wb3J0VG9Nb2R1bGUoXG4gIHNvdXJjZTogdHMuU291cmNlRmlsZSxcbiAgbW9kdWxlUGF0aDogc3RyaW5nLFxuICBjbGFzc2lmaWVkTmFtZTogc3RyaW5nLFxuICBpbXBvcnRQYXRoOiBzdHJpbmdcbik6IENoYW5nZVtdIHtcbiAgcmV0dXJuIF9hZGRTeW1ib2xUb05nTW9kdWxlTWV0YWRhdGEoXG4gICAgc291cmNlLFxuICAgIG1vZHVsZVBhdGgsXG4gICAgJ2ltcG9ydHMnLFxuICAgIGNsYXNzaWZpZWROYW1lLFxuICAgIGltcG9ydFBhdGhcbiAgKTtcbn1cblxuLyoqXG4gKiBDdXN0b20gZnVuY3Rpb24gdG8gaW5zZXJ0IGEgcHJvdmlkZXIgaW50byBOZ01vZHVsZS4gSXQgYWxzbyBpbXBvcnRzIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkUHJvdmlkZXJUb01vZHVsZShcbiAgc291cmNlOiB0cy5Tb3VyY2VGaWxlLFxuICBtb2R1bGVQYXRoOiBzdHJpbmcsXG4gIGNsYXNzaWZpZWROYW1lOiBzdHJpbmcsXG4gIGltcG9ydFBhdGg6IHN0cmluZ1xuKTogQ2hhbmdlW10ge1xuICByZXR1cm4gX2FkZFN5bWJvbFRvTmdNb2R1bGVNZXRhZGF0YShcbiAgICBzb3VyY2UsXG4gICAgbW9kdWxlUGF0aCxcbiAgICAncHJvdmlkZXJzJyxcbiAgICBjbGFzc2lmaWVkTmFtZSxcbiAgICBpbXBvcnRQYXRoXG4gICk7XG59XG5cbi8qKlxuICogQ3VzdG9tIGZ1bmN0aW9uIHRvIGluc2VydCBhbiBleHBvcnQgaW50byBOZ01vZHVsZS4gSXQgYWxzbyBpbXBvcnRzIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRXhwb3J0VG9Nb2R1bGUoXG4gIHNvdXJjZTogdHMuU291cmNlRmlsZSxcbiAgbW9kdWxlUGF0aDogc3RyaW5nLFxuICBjbGFzc2lmaWVkTmFtZTogc3RyaW5nLFxuICBpbXBvcnRQYXRoOiBzdHJpbmdcbik6IENoYW5nZVtdIHtcbiAgcmV0dXJuIF9hZGRTeW1ib2xUb05nTW9kdWxlTWV0YWRhdGEoXG4gICAgc291cmNlLFxuICAgIG1vZHVsZVBhdGgsXG4gICAgJ2V4cG9ydHMnLFxuICAgIGNsYXNzaWZpZWROYW1lLFxuICAgIGltcG9ydFBhdGhcbiAgKTtcbn1cblxuLyoqXG4gKiBDdXN0b20gZnVuY3Rpb24gdG8gaW5zZXJ0IGFuIGV4cG9ydCBpbnRvIE5nTW9kdWxlLiBJdCBhbHNvIGltcG9ydHMgaXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRCb290c3RyYXBUb01vZHVsZShcbiAgc291cmNlOiB0cy5Tb3VyY2VGaWxlLFxuICBtb2R1bGVQYXRoOiBzdHJpbmcsXG4gIGNsYXNzaWZpZWROYW1lOiBzdHJpbmcsXG4gIGltcG9ydFBhdGg6IHN0cmluZ1xuKTogQ2hhbmdlW10ge1xuICByZXR1cm4gX2FkZFN5bWJvbFRvTmdNb2R1bGVNZXRhZGF0YShcbiAgICBzb3VyY2UsXG4gICAgbW9kdWxlUGF0aCxcbiAgICAnYm9vdHN0cmFwJyxcbiAgICBjbGFzc2lmaWVkTmFtZSxcbiAgICBpbXBvcnRQYXRoXG4gICk7XG59XG5cbi8qKlxuICogQWRkIEltcG9ydCBgaW1wb3J0IHsgc3ltYm9sTmFtZSB9IGZyb20gZmlsZU5hbWVgIGlmIHRoZSBpbXBvcnQgZG9lc24ndCBleGl0XG4gKiBhbHJlYWR5LiBBc3N1bWVzIGZpbGVUb0VkaXQgY2FuIGJlIHJlc29sdmVkIGFuZCBhY2Nlc3NlZC5cbiAqIEBwYXJhbSBmaWxlVG9FZGl0IChmaWxlIHdlIHdhbnQgdG8gYWRkIGltcG9ydCB0bylcbiAqIEBwYXJhbSBzeW1ib2xOYW1lIChpdGVtIHRvIGltcG9ydClcbiAqIEBwYXJhbSBmaWxlTmFtZSAocGF0aCB0byB0aGUgZmlsZSlcbiAqIEBwYXJhbSBpc0RlZmF1bHQgKGlmIHRydWUsIGltcG9ydCBmb2xsb3dzIHN0eWxlIGZvciBpbXBvcnRpbmcgZGVmYXVsdCBleHBvcnRzKVxuICogQHJldHVybiBDaGFuZ2VcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaW5zZXJ0SW1wb3J0KFxuICBzb3VyY2U6IHRzLlNvdXJjZUZpbGUsXG4gIGZpbGVUb0VkaXQ6IHN0cmluZyxcbiAgc3ltYm9sTmFtZTogc3RyaW5nLFxuICBmaWxlTmFtZTogc3RyaW5nLFxuICBpc0RlZmF1bHQgPSBmYWxzZVxuKTogQ2hhbmdlIHtcbiAgY29uc3Qgcm9vdE5vZGUgPSBzb3VyY2U7XG4gIGNvbnN0IGFsbEltcG9ydHMgPSBmaW5kTm9kZXMocm9vdE5vZGUsIHRzLlN5bnRheEtpbmQuSW1wb3J0RGVjbGFyYXRpb24pO1xuXG4gIC8vIGdldCBub2RlcyB0aGF0IG1hcCB0byBpbXBvcnQgc3RhdGVtZW50cyBmcm9tIHRoZSBmaWxlIGZpbGVOYW1lXG4gIGNvbnN0IHJlbGV2YW50SW1wb3J0cyA9IGFsbEltcG9ydHMuZmlsdGVyKG5vZGUgPT4ge1xuICAgIC8vIFN0cmluZ0xpdGVyYWwgb2YgdGhlIEltcG9ydERlY2xhcmF0aW9uIGlzIHRoZSBpbXBvcnQgZmlsZSAoZmlsZU5hbWUgaW4gdGhpcyBjYXNlKS5cbiAgICBjb25zdCBpbXBvcnRGaWxlcyA9IG5vZGVcbiAgICAgIC5nZXRDaGlsZHJlbigpXG4gICAgICAuZmlsdGVyKGNoaWxkID0+IGNoaWxkLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbClcbiAgICAgIC5tYXAobiA9PiAobiBhcyB0cy5TdHJpbmdMaXRlcmFsKS50ZXh0KTtcblxuICAgIHJldHVybiBpbXBvcnRGaWxlcy5maWx0ZXIoZmlsZSA9PiBmaWxlID09PSBmaWxlTmFtZSkubGVuZ3RoID09PSAxO1xuICB9KTtcblxuICBpZiAocmVsZXZhbnRJbXBvcnRzLmxlbmd0aCA+IDApIHtcbiAgICBsZXQgaW1wb3J0c0FzdGVyaXNrID0gZmFsc2U7XG4gICAgLy8gaW1wb3J0cyBmcm9tIGltcG9ydCBmaWxlXG4gICAgY29uc3QgaW1wb3J0czogdHMuTm9kZVtdID0gW107XG4gICAgcmVsZXZhbnRJbXBvcnRzLmZvckVhY2gobiA9PiB7XG4gICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShcbiAgICAgICAgaW1wb3J0cyxcbiAgICAgICAgZmluZE5vZGVzKG4sIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcilcbiAgICAgICk7XG4gICAgICBpZiAoZmluZE5vZGVzKG4sIHRzLlN5bnRheEtpbmQuQXN0ZXJpc2tUb2tlbikubGVuZ3RoID4gMCkge1xuICAgICAgICBpbXBvcnRzQXN0ZXJpc2sgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gaWYgaW1wb3J0cyAqIGZyb20gZmlsZU5hbWUsIGRvbid0IGFkZCBzeW1ib2xOYW1lXG4gICAgaWYgKGltcG9ydHNBc3Rlcmlzaykge1xuICAgICAgcmV0dXJuIG5ldyBOb29wQ2hhbmdlKCk7XG4gICAgfVxuXG4gICAgY29uc3QgaW1wb3J0VGV4dE5vZGVzID0gaW1wb3J0cy5maWx0ZXIoXG4gICAgICBuID0+IChuIGFzIHRzLklkZW50aWZpZXIpLnRleHQgPT09IHN5bWJvbE5hbWVcbiAgICApO1xuXG4gICAgLy8gaW5zZXJ0IGltcG9ydCBpZiBpdCdzIG5vdCB0aGVyZVxuICAgIGlmIChpbXBvcnRUZXh0Tm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zdCBmYWxsYmFja1BvcyA9XG4gICAgICAgIGZpbmROb2RlcyhcbiAgICAgICAgICByZWxldmFudEltcG9ydHNbMF0sXG4gICAgICAgICAgdHMuU3ludGF4S2luZC5DbG9zZUJyYWNlVG9rZW5cbiAgICAgICAgKVswXS5nZXRTdGFydCgpIHx8XG4gICAgICAgIGZpbmROb2RlcyhyZWxldmFudEltcG9ydHNbMF0sIHRzLlN5bnRheEtpbmQuRnJvbUtleXdvcmQpWzBdLmdldFN0YXJ0KCk7XG5cbiAgICAgIHJldHVybiBpbnNlcnRBZnRlckxhc3RPY2N1cnJlbmNlKFxuICAgICAgICBpbXBvcnRzLFxuICAgICAgICBgLCAke3N5bWJvbE5hbWV9YCxcbiAgICAgICAgZmlsZVRvRWRpdCxcbiAgICAgICAgZmFsbGJhY2tQb3NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBOb29wQ2hhbmdlKCk7XG4gIH1cblxuICAvLyBubyBzdWNoIGltcG9ydCBkZWNsYXJhdGlvbiBleGlzdHNcbiAgY29uc3QgdXNlU3RyaWN0ID0gZmluZE5vZGVzKHJvb3ROb2RlLCB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpLmZpbHRlcihcbiAgICBuID0+IG4uZ2V0VGV4dCgpID09PSAndXNlIHN0cmljdCdcbiAgKTtcbiAgbGV0IGZhbGxiYWNrUG9zID0gMDtcbiAgaWYgKHVzZVN0cmljdC5sZW5ndGggPiAwKSB7XG4gICAgZmFsbGJhY2tQb3MgPSB1c2VTdHJpY3RbMF0uZW5kO1xuICB9XG4gIGNvbnN0IG9wZW4gPSBpc0RlZmF1bHQgPyAnJyA6ICd7ICc7XG4gIGNvbnN0IGNsb3NlID0gaXNEZWZhdWx0ID8gJycgOiAnIH0nO1xuICAvLyBpZiB0aGVyZSBhcmUgbm8gaW1wb3J0cyBvciAndXNlIHN0cmljdCcgc3RhdGVtZW50LCBpbnNlcnQgaW1wb3J0IGF0IGJlZ2lubmluZyBvZiBmaWxlXG4gIGNvbnN0IGluc2VydEF0QmVnaW5uaW5nID0gYWxsSW1wb3J0cy5sZW5ndGggPT09IDAgJiYgdXNlU3RyaWN0Lmxlbmd0aCA9PT0gMDtcbiAgY29uc3Qgc2VwYXJhdG9yID0gaW5zZXJ0QXRCZWdpbm5pbmcgPyAnJyA6ICc7XFxuJztcbiAgY29uc3QgdG9JbnNlcnQgPVxuICAgIGAke3NlcGFyYXRvcn1pbXBvcnQgJHtvcGVufSR7c3ltYm9sTmFtZX0ke2Nsb3NlfWAgK1xuICAgIGAgZnJvbSAnJHtmaWxlTmFtZX0nJHtpbnNlcnRBdEJlZ2lubmluZyA/ICc7XFxuJyA6ICcnfWA7XG5cbiAgcmV0dXJuIGluc2VydEFmdGVyTGFzdE9jY3VycmVuY2UoXG4gICAgYWxsSW1wb3J0cyxcbiAgICB0b0luc2VydCxcbiAgICBmaWxlVG9FZGl0LFxuICAgIGZhbGxiYWNrUG9zLFxuICAgIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVwbGFjZUltcG9ydChcbiAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSxcbiAgcGF0aDogUGF0aCxcbiAgaW1wb3J0RnJvbTogc3RyaW5nLFxuICBpbXBvcnRBc0lzOiBzdHJpbmcsXG4gIGltcG9ydFRvQmU6IHN0cmluZ1xuKTogKFJlcGxhY2VDaGFuZ2UgfCBSZW1vdmVDaGFuZ2UpW10ge1xuICBjb25zdCBpbXBvcnRzID0gc291cmNlRmlsZS5zdGF0ZW1lbnRzXG4gICAgLmZpbHRlcih0cy5pc0ltcG9ydERlY2xhcmF0aW9uKVxuICAgIC5maWx0ZXIoXG4gICAgICAoeyBtb2R1bGVTcGVjaWZpZXIgfSkgPT5cbiAgICAgICAgbW9kdWxlU3BlY2lmaWVyLmdldFRleHQoc291cmNlRmlsZSkgPT09IGAnJHtpbXBvcnRGcm9tfSdgIHx8XG4gICAgICAgIG1vZHVsZVNwZWNpZmllci5nZXRUZXh0KHNvdXJjZUZpbGUpID09PSBgXCIke2ltcG9ydEZyb219XCJgXG4gICAgKTtcblxuICBpZiAoaW1wb3J0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBpbXBvcnRUZXh0ID0gKHNwZWNpZmllcjogdHMuSW1wb3J0U3BlY2lmaWVyKSA9PiB7XG4gICAgaWYgKHNwZWNpZmllci5uYW1lLnRleHQpIHtcbiAgICAgIHJldHVybiBzcGVjaWZpZXIubmFtZS50ZXh0O1xuICAgIH1cblxuICAgIC8vIGlmIGltcG9ydCBpcyByZW5hbWVkXG4gICAgaWYgKHNwZWNpZmllci5wcm9wZXJ0eU5hbWUgJiYgc3BlY2lmaWVyLnByb3BlcnR5TmFtZS50ZXh0KSB7XG4gICAgICByZXR1cm4gc3BlY2lmaWVyLnByb3BlcnR5TmFtZS50ZXh0O1xuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfTtcblxuICBjb25zdCBjaGFuZ2VzID0gaW1wb3J0cy5tYXAocCA9PiB7XG4gICAgY29uc3QgaW1wb3J0U3BlY2lmaWVycyA9IChwLmltcG9ydENsYXVzZSEubmFtZWRCaW5kaW5ncyEgYXMgdHMuTmFtZWRJbXBvcnRzKVxuICAgICAgLmVsZW1lbnRzO1xuXG4gICAgY29uc3QgaXNBbHJlYWR5SW1wb3J0ZWQgPSBpbXBvcnRTcGVjaWZpZXJzXG4gICAgICAubWFwKGltcG9ydFRleHQpXG4gICAgICAuaW5jbHVkZXMoaW1wb3J0VG9CZSk7XG5cbiAgICBjb25zdCBpbXBvcnRDaGFuZ2VzID0gaW1wb3J0U3BlY2lmaWVycy5tYXAoKHNwZWNpZmllciwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHRleHQgPSBpbXBvcnRUZXh0KHNwZWNpZmllcik7XG5cbiAgICAgIC8vIGltcG9ydCBpcyBub3QgdGhlIG9uZSB3ZSdyZSBsb29raW5nIGZvciwgY2FuIGJlIHNraXBwZWRcbiAgICAgIGlmICh0ZXh0ICE9PSBpbXBvcnRBc0lzKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIGlkZW50aWZpZXIgaGFzIG5vdCBiZWVuIGltcG9ydGVkLCBzaW1wbHkgcmVwbGFjZSB0aGUgb2xkIHRleHQgd2l0aCB0aGUgbmV3IHRleHRcbiAgICAgIGlmICghaXNBbHJlYWR5SW1wb3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVJlcGxhY2VDaGFuZ2UoXG4gICAgICAgICAgc291cmNlRmlsZSxcbiAgICAgICAgICBzcGVjaWZpZXIhLFxuICAgICAgICAgIGltcG9ydEFzSXMsXG4gICAgICAgICAgaW1wb3J0VG9CZVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBuZXh0SWRlbnRpZmllciA9IGltcG9ydFNwZWNpZmllcnNbaW5kZXggKyAxXTtcbiAgICAgIC8vIGlkZW50aWZlciBpcyBub3QgdGhlIGxhc3QsIGFsc28gY2xlYW4gdXAgdGhlIGNvbW1hXG4gICAgICBpZiAobmV4dElkZW50aWZpZXIpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVJlbW92ZUNoYW5nZShcbiAgICAgICAgICBzb3VyY2VGaWxlLFxuICAgICAgICAgIHNwZWNpZmllcixcbiAgICAgICAgICBzcGVjaWZpZXIuZ2V0U3RhcnQoc291cmNlRmlsZSksXG4gICAgICAgICAgbmV4dElkZW50aWZpZXIuZ2V0U3RhcnQoc291cmNlRmlsZSlcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gdGhlcmUgYXJlIG5vIGltcG9ydHMgZm9sbG93aW5nLCBqdXN0IHJlbW92ZSBpdFxuICAgICAgcmV0dXJuIGNyZWF0ZVJlbW92ZUNoYW5nZShcbiAgICAgICAgc291cmNlRmlsZSxcbiAgICAgICAgc3BlY2lmaWVyLFxuICAgICAgICBzcGVjaWZpZXIuZ2V0U3RhcnQoc291cmNlRmlsZSksXG4gICAgICAgIHNwZWNpZmllci5nZXRFbmQoKVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBpbXBvcnRDaGFuZ2VzLmZpbHRlcihCb29sZWFuKSBhcyAoUmVwbGFjZUNoYW5nZSB8IFJlbW92ZUNoYW5nZSlbXTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNoYW5nZXMucmVkdWNlKChpbXBvcnRzLCBjdXJyKSA9PiBpbXBvcnRzLmNvbmNhdChjdXJyKSwgW10pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNQcm9wZXJ0eShcbiAgb2JqZWN0TGl0ZXJhbDogdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24sXG4gIHByb3BlcnR5TmFtZTogc3RyaW5nXG4pIHtcbiAgcmV0dXJuIChcbiAgICBvYmplY3RMaXRlcmFsICYmXG4gICAgb2JqZWN0TGl0ZXJhbC5wcm9wZXJ0aWVzLnNvbWUoXG4gICAgICBwcm9wID0+XG4gICAgICAgIHRzLmlzUHJvcGVydHlBc3NpZ25tZW50KHByb3ApICYmXG4gICAgICAgIHRzLmlzSWRlbnRpZmllcihwcm9wLm5hbWUpICYmXG4gICAgICAgIHByb3AubmFtZS50ZXh0ID09PSBwcm9wZXJ0eU5hbWVcbiAgICApXG4gICk7XG59XG4iXX0=