(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/effects/migrations/9_0_0/index", ["require", "exports", "@angular-devkit/schematics", "@ngrx/effects/schematics-core", "@ngrx/effects/schematics-core", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const schematics_1 = require("@angular-devkit/schematics");
    const schematics_core_1 = require("@ngrx/effects/schematics-core");
    const schematics_core_2 = require("@ngrx/effects/schematics-core");
    const ts = require("typescript");
    function renameErrorHandlerConfig() {
        return (tree, ctx) => {
            schematics_core_1.visitTSSourceFiles(tree, sourceFile => {
                const changes = replaceEffectConfigKeys(sourceFile, 'resubscribeOnError', 'useEffectsErrorHandler');
                schematics_core_1.commitChanges(tree, sourceFile.fileName, changes);
                if (changes.length) {
                    ctx.logger.info(`[@ngrx/effects] Updated Effects configuration, see the migration guide (https://ngrx.io/guide/migration/v9#effects) for more info`);
                }
            });
        };
    }
    function replaceEffectConfigKeys(sourceFile, oldText, newText) {
        const changes = [];
        ts.forEachChild(sourceFile, node => {
            visitCreateEffectFunctionCreator(node, createEffectNode => {
                const [effectDeclaration, configNode] = createEffectNode.arguments;
                if (configNode) {
                    findAndReplaceText(configNode);
                }
            });
            visitEffectDecorator(node, effectDecoratorNode => {
                findAndReplaceText(effectDecoratorNode);
            });
        });
        return changes;
        function findAndReplaceText(node) {
            visitIdentifierWithText(node, oldText, match => {
                changes.push(schematics_core_2.createReplaceChange(sourceFile, match, oldText, newText));
            });
        }
    }
    function visitIdentifierWithText(node, text, visitor) {
        if (ts.isIdentifier(node) && node.text === text) {
            visitor(node);
        }
        ts.forEachChild(node, childNode => visitIdentifierWithText(childNode, text, visitor));
    }
    function visitEffectDecorator(node, visitor) {
        if (ts.isDecorator(node) &&
            ts.isCallExpression(node.expression) &&
            ts.isIdentifier(node.expression.expression) &&
            node.expression.expression.text === 'Effect') {
            visitor(node);
        }
        ts.forEachChild(node, childNode => visitEffectDecorator(childNode, visitor));
    }
    function visitCreateEffectFunctionCreator(node, visitor) {
        if (ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === 'createEffect') {
            visitor(node);
        }
        ts.forEachChild(node, childNode => visitCreateEffectFunctionCreator(childNode, visitor));
    }
    function default_1() {
        return schematics_1.chain([renameErrorHandlerConfig()]);
    }
    exports.default = default_1;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvbWlncmF0aW9ucy85XzBfMC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBLDJEQUtvQztJQUNwQyxtRUFHdUM7SUFDdkMsbUVBR3VDO0lBQ3ZDLGlDQUFpQztJQUVqQyxTQUFTLHdCQUF3QjtRQUMvQixPQUFPLENBQUMsSUFBVSxFQUFFLEdBQXFCLEVBQUUsRUFBRTtZQUMzQyxvQ0FBa0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUU7Z0JBQ3BDLE1BQU0sT0FBTyxHQUFvQix1QkFBdUIsQ0FDdEQsVUFBVSxFQUNWLG9CQUFvQixFQUNwQix3QkFBd0IsQ0FDekIsQ0FBQztnQkFFRiwrQkFBYSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUVsRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7b0JBQ2xCLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNiLG1JQUFtSSxDQUNwSSxDQUFDO2lCQUNIO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsU0FBUyx1QkFBdUIsQ0FDOUIsVUFBeUIsRUFDekIsT0FBZSxFQUNmLE9BQWU7UUFFZixNQUFNLE9BQU8sR0FBb0IsRUFBRSxDQUFDO1FBRXBDLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ2pDLGdDQUFnQyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUN4RCxNQUFNLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDO2dCQUNuRSxJQUFJLFVBQVUsRUFBRTtvQkFDZCxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDaEM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILG9CQUFvQixDQUFDLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxFQUFFO2dCQUMvQyxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQzFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE9BQU8sQ0FBQztRQUVmLFNBQVMsa0JBQWtCLENBQUMsSUFBYTtZQUN2Qyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFFO2dCQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLHFDQUFtQixDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDekUsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVMsdUJBQXVCLENBQzlCLElBQWEsRUFDYixJQUFZLEVBQ1osT0FBZ0M7UUFFaEMsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQy9DLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNmO1FBRUQsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FDaEMsdUJBQXVCLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FDbEQsQ0FBQztJQUNKLENBQUM7SUFFRCxTQUFTLG9CQUFvQixDQUFDLElBQWEsRUFBRSxPQUFnQztRQUMzRSxJQUNFLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1lBQ3BCLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ3BDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7WUFDM0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFDNUM7WUFDQSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDZjtRQUVELEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVELFNBQVMsZ0NBQWdDLENBQ3ZDLElBQWEsRUFDYixPQUEwQztRQUUxQyxJQUNFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7WUFDekIsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLGNBQWMsRUFDdkM7WUFDQSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDZjtRQUVELEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQ2hDLGdDQUFnQyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FDckQsQ0FBQztJQUNKLENBQUM7SUFFRDtRQUNFLE9BQU8sa0JBQUssQ0FBQyxDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFGRCw0QkFFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGNoYWluLFxuICBSdWxlLFxuICBTY2hlbWF0aWNDb250ZXh0LFxuICBUcmVlLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge1xuICBjb21taXRDaGFuZ2VzLFxuICB2aXNpdFRTU291cmNlRmlsZXMsXG59IGZyb20gJ0BuZ3J4L2VmZmVjdHMvc2NoZW1hdGljcy1jb3JlJztcbmltcG9ydCB7XG4gIGNyZWF0ZVJlcGxhY2VDaGFuZ2UsXG4gIFJlcGxhY2VDaGFuZ2UsXG59IGZyb20gJ0BuZ3J4L2VmZmVjdHMvc2NoZW1hdGljcy1jb3JlJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5mdW5jdGlvbiByZW5hbWVFcnJvckhhbmRsZXJDb25maWcoKTogUnVsZSB7XG4gIHJldHVybiAodHJlZTogVHJlZSwgY3R4OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgdmlzaXRUU1NvdXJjZUZpbGVzKHRyZWUsIHNvdXJjZUZpbGUgPT4ge1xuICAgICAgY29uc3QgY2hhbmdlczogUmVwbGFjZUNoYW5nZVtdID0gcmVwbGFjZUVmZmVjdENvbmZpZ0tleXMoXG4gICAgICAgIHNvdXJjZUZpbGUsXG4gICAgICAgICdyZXN1YnNjcmliZU9uRXJyb3InLFxuICAgICAgICAndXNlRWZmZWN0c0Vycm9ySGFuZGxlcidcbiAgICAgICk7XG5cbiAgICAgIGNvbW1pdENoYW5nZXModHJlZSwgc291cmNlRmlsZS5maWxlTmFtZSwgY2hhbmdlcyk7XG5cbiAgICAgIGlmIChjaGFuZ2VzLmxlbmd0aCkge1xuICAgICAgICBjdHgubG9nZ2VyLmluZm8oXG4gICAgICAgICAgYFtAbmdyeC9lZmZlY3RzXSBVcGRhdGVkIEVmZmVjdHMgY29uZmlndXJhdGlvbiwgc2VlIHRoZSBtaWdyYXRpb24gZ3VpZGUgKGh0dHBzOi8vbmdyeC5pby9ndWlkZS9taWdyYXRpb24vdjkjZWZmZWN0cykgZm9yIG1vcmUgaW5mb2BcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZUVmZmVjdENvbmZpZ0tleXMoXG4gIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsXG4gIG9sZFRleHQ6IHN0cmluZyxcbiAgbmV3VGV4dDogc3RyaW5nXG4pOiBSZXBsYWNlQ2hhbmdlW10ge1xuICBjb25zdCBjaGFuZ2VzOiBSZXBsYWNlQ2hhbmdlW10gPSBbXTtcblxuICB0cy5mb3JFYWNoQ2hpbGQoc291cmNlRmlsZSwgbm9kZSA9PiB7XG4gICAgdmlzaXRDcmVhdGVFZmZlY3RGdW5jdGlvbkNyZWF0b3Iobm9kZSwgY3JlYXRlRWZmZWN0Tm9kZSA9PiB7XG4gICAgICBjb25zdCBbZWZmZWN0RGVjbGFyYXRpb24sIGNvbmZpZ05vZGVdID0gY3JlYXRlRWZmZWN0Tm9kZS5hcmd1bWVudHM7XG4gICAgICBpZiAoY29uZmlnTm9kZSkge1xuICAgICAgICBmaW5kQW5kUmVwbGFjZVRleHQoY29uZmlnTm9kZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2aXNpdEVmZmVjdERlY29yYXRvcihub2RlLCBlZmZlY3REZWNvcmF0b3JOb2RlID0+IHtcbiAgICAgIGZpbmRBbmRSZXBsYWNlVGV4dChlZmZlY3REZWNvcmF0b3JOb2RlKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNoYW5nZXM7XG5cbiAgZnVuY3Rpb24gZmluZEFuZFJlcGxhY2VUZXh0KG5vZGU6IHRzLk5vZGUpOiB2b2lkIHtcbiAgICB2aXNpdElkZW50aWZpZXJXaXRoVGV4dChub2RlLCBvbGRUZXh0LCBtYXRjaCA9PiB7XG4gICAgICBjaGFuZ2VzLnB1c2goY3JlYXRlUmVwbGFjZUNoYW5nZShzb3VyY2VGaWxlLCBtYXRjaCwgb2xkVGV4dCwgbmV3VGV4dCkpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHZpc2l0SWRlbnRpZmllcldpdGhUZXh0KFxuICBub2RlOiB0cy5Ob2RlLFxuICB0ZXh0OiBzdHJpbmcsXG4gIHZpc2l0b3I6IChub2RlOiB0cy5Ob2RlKSA9PiB2b2lkXG4pIHtcbiAgaWYgKHRzLmlzSWRlbnRpZmllcihub2RlKSAmJiBub2RlLnRleHQgPT09IHRleHQpIHtcbiAgICB2aXNpdG9yKG5vZGUpO1xuICB9XG5cbiAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIGNoaWxkTm9kZSA9PlxuICAgIHZpc2l0SWRlbnRpZmllcldpdGhUZXh0KGNoaWxkTm9kZSwgdGV4dCwgdmlzaXRvcilcbiAgKTtcbn1cblxuZnVuY3Rpb24gdmlzaXRFZmZlY3REZWNvcmF0b3Iobm9kZTogdHMuTm9kZSwgdmlzaXRvcjogKG5vZGU6IHRzLk5vZGUpID0+IHZvaWQpIHtcbiAgaWYgKFxuICAgIHRzLmlzRGVjb3JhdG9yKG5vZGUpICYmXG4gICAgdHMuaXNDYWxsRXhwcmVzc2lvbihub2RlLmV4cHJlc3Npb24pICYmXG4gICAgdHMuaXNJZGVudGlmaWVyKG5vZGUuZXhwcmVzc2lvbi5leHByZXNzaW9uKSAmJlxuICAgIG5vZGUuZXhwcmVzc2lvbi5leHByZXNzaW9uLnRleHQgPT09ICdFZmZlY3QnXG4gICkge1xuICAgIHZpc2l0b3Iobm9kZSk7XG4gIH1cblxuICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgY2hpbGROb2RlID0+IHZpc2l0RWZmZWN0RGVjb3JhdG9yKGNoaWxkTm9kZSwgdmlzaXRvcikpO1xufVxuXG5mdW5jdGlvbiB2aXNpdENyZWF0ZUVmZmVjdEZ1bmN0aW9uQ3JlYXRvcihcbiAgbm9kZTogdHMuTm9kZSxcbiAgdmlzaXRvcjogKG5vZGU6IHRzLkNhbGxFeHByZXNzaW9uKSA9PiB2b2lkXG4pIHtcbiAgaWYgKFxuICAgIHRzLmlzQ2FsbEV4cHJlc3Npb24obm9kZSkgJiZcbiAgICB0cy5pc0lkZW50aWZpZXIobm9kZS5leHByZXNzaW9uKSAmJlxuICAgIG5vZGUuZXhwcmVzc2lvbi50ZXh0ID09PSAnY3JlYXRlRWZmZWN0J1xuICApIHtcbiAgICB2aXNpdG9yKG5vZGUpO1xuICB9XG5cbiAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIGNoaWxkTm9kZSA9PlxuICAgIHZpc2l0Q3JlYXRlRWZmZWN0RnVuY3Rpb25DcmVhdG9yKGNoaWxkTm9kZSwgdmlzaXRvcilcbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKTogUnVsZSB7XG4gIHJldHVybiBjaGFpbihbcmVuYW1lRXJyb3JIYW5kbGVyQ29uZmlnKCldKTtcbn1cbiJdfQ==