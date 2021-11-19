(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/effects/schematics-core/utility/visitors", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ts = require("typescript");
    function visitTSSourceFiles(tree, visitor) {
        let result = undefined;
        for (const sourceFile of visit(tree.root)) {
            result = visitor(sourceFile, tree, result);
        }
        return result;
    }
    exports.visitTSSourceFiles = visitTSSourceFiles;
    function* visit(directory) {
        for (const path of directory.subfiles) {
            if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
                const entry = directory.file(path);
                if (entry) {
                    const content = entry.content;
                    const source = ts.createSourceFile(entry.path, content.toString().replace(/^\uFEFF/, ''), ts.ScriptTarget.Latest, true);
                    yield source;
                }
            }
        }
        for (const path of directory.subdirs) {
            if (path === 'node_modules') {
                continue;
            }
            yield* visit(directory.dir(path));
        }
    }
    function visitNgModuleImports(sourceFile, callback) {
        ts.forEachChild(sourceFile, function findDecorator(node) {
            if (!ts.isDecorator(node)) {
                ts.forEachChild(node, findDecorator);
                return;
            }
            ts.forEachChild(node, function findImportsNode(n) {
                if (ts.isPropertyAssignment(n) &&
                    ts.isArrayLiteralExpression(n.initializer) &&
                    ts.isIdentifier(n.name) &&
                    n.name.text === 'imports') {
                    callback(n, n.initializer.elements);
                }
                ts.forEachChild(n, findImportsNode);
            });
        });
    }
    exports.visitNgModuleImports = visitNgModuleImports;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc2NoZW1hdGljcy1jb3JlL3V0aWxpdHkvdmlzaXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQSxpQ0FBaUM7SUFHakMsU0FBZ0Isa0JBQWtCLENBQ2hDLElBQVUsRUFDVixPQUl1QjtRQUV2QixJQUFJLE1BQU0sR0FBdUIsU0FBUyxDQUFDO1FBQzNDLEtBQUssTUFBTSxVQUFVLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN6QyxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDNUM7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBZEQsZ0RBY0M7SUFFRCxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBbUI7UUFDakMsS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFO1lBQ3JDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ25ELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLElBQUksS0FBSyxFQUFFO29CQUNULE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7b0JBQzlCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDaEMsS0FBSyxDQUFDLElBQUksRUFDVixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFDekMsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQ3RCLElBQUksQ0FDTCxDQUFDO29CQUNGLE1BQU0sTUFBTSxDQUFDO2lCQUNkO2FBQ0Y7U0FDRjtRQUVELEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRTtZQUNwQyxJQUFJLElBQUksS0FBSyxjQUFjLEVBQUU7Z0JBQzNCLFNBQVM7YUFDVjtZQUVELEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDbkM7SUFDSCxDQUFDO0lBRUQsU0FBZ0Isb0JBQW9CLENBQ2xDLFVBQXlCLEVBQ3pCLFFBR1M7UUFFVCxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxTQUFTLGFBQWEsQ0FBQyxJQUFJO1lBQ3JELElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN6QixFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDckMsT0FBTzthQUNSO1lBRUQsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxlQUFlLENBQUMsQ0FBQztnQkFDOUMsSUFDRSxFQUFFLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO29CQUMxQixFQUFFLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztvQkFDMUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQ3pCO29CQUNBLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDckM7Z0JBRUQsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUExQkQsb0RBMEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgeyBUcmVlLCBEaXJFbnRyeSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0VFNTb3VyY2VGaWxlczxSZXN1bHQgPSB2b2lkPihcbiAgdHJlZTogVHJlZSxcbiAgdmlzaXRvcjogKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsXG4gICAgdHJlZTogVHJlZSxcbiAgICByZXN1bHQ/OiBSZXN1bHRcbiAgKSA9PiBSZXN1bHQgfCB1bmRlZmluZWRcbik6IFJlc3VsdCB8IHVuZGVmaW5lZCB7XG4gIGxldCByZXN1bHQ6IFJlc3VsdCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgZm9yIChjb25zdCBzb3VyY2VGaWxlIG9mIHZpc2l0KHRyZWUucm9vdCkpIHtcbiAgICByZXN1bHQgPSB2aXNpdG9yKHNvdXJjZUZpbGUsIHRyZWUsIHJlc3VsdCk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiogdmlzaXQoZGlyZWN0b3J5OiBEaXJFbnRyeSk6IEl0ZXJhYmxlSXRlcmF0b3I8dHMuU291cmNlRmlsZT4ge1xuICBmb3IgKGNvbnN0IHBhdGggb2YgZGlyZWN0b3J5LnN1YmZpbGVzKSB7XG4gICAgaWYgKHBhdGguZW5kc1dpdGgoJy50cycpICYmICFwYXRoLmVuZHNXaXRoKCcuZC50cycpKSB7XG4gICAgICBjb25zdCBlbnRyeSA9IGRpcmVjdG9yeS5maWxlKHBhdGgpO1xuICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBlbnRyeS5jb250ZW50O1xuICAgICAgICBjb25zdCBzb3VyY2UgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKFxuICAgICAgICAgIGVudHJ5LnBhdGgsXG4gICAgICAgICAgY29udGVudC50b1N0cmluZygpLnJlcGxhY2UoL15cXHVGRUZGLywgJycpLFxuICAgICAgICAgIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuICAgICAgICB5aWVsZCBzb3VyY2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBwYXRoIG9mIGRpcmVjdG9yeS5zdWJkaXJzKSB7XG4gICAgaWYgKHBhdGggPT09ICdub2RlX21vZHVsZXMnKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB5aWVsZCogdmlzaXQoZGlyZWN0b3J5LmRpcihwYXRoKSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0TmdNb2R1bGVJbXBvcnRzKFxuICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLFxuICBjYWxsYmFjazogKFxuICAgIGltcG9ydE5vZGU6IHRzLlByb3BlcnR5QXNzaWdubWVudCxcbiAgICBlbGVtZW50RXhwcmVzc2lvbnM6IHRzLk5vZGVBcnJheTx0cy5FeHByZXNzaW9uPlxuICApID0+IHZvaWRcbikge1xuICB0cy5mb3JFYWNoQ2hpbGQoc291cmNlRmlsZSwgZnVuY3Rpb24gZmluZERlY29yYXRvcihub2RlKSB7XG4gICAgaWYgKCF0cy5pc0RlY29yYXRvcihub2RlKSkge1xuICAgICAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIGZpbmREZWNvcmF0b3IpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRzLmZvckVhY2hDaGlsZChub2RlLCBmdW5jdGlvbiBmaW5kSW1wb3J0c05vZGUobikge1xuICAgICAgaWYgKFxuICAgICAgICB0cy5pc1Byb3BlcnR5QXNzaWdubWVudChuKSAmJlxuICAgICAgICB0cy5pc0FycmF5TGl0ZXJhbEV4cHJlc3Npb24obi5pbml0aWFsaXplcikgJiZcbiAgICAgICAgdHMuaXNJZGVudGlmaWVyKG4ubmFtZSkgJiZcbiAgICAgICAgbi5uYW1lLnRleHQgPT09ICdpbXBvcnRzJ1xuICAgICAgKSB7XG4gICAgICAgIGNhbGxiYWNrKG4sIG4uaW5pdGlhbGl6ZXIuZWxlbWVudHMpO1xuICAgICAgfVxuXG4gICAgICB0cy5mb3JFYWNoQ2hpbGQobiwgZmluZEltcG9ydHNOb2RlKTtcbiAgICB9KTtcbiAgfSk7XG59XG4iXX0=