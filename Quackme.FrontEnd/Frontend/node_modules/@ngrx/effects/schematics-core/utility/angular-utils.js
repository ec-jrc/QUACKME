(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/effects/schematics-core/utility/angular-utils", ["require", "exports", "@angular-devkit/core", "@ngrx/effects/schematics-core/utility/json-utilts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const core_1 = require("@angular-devkit/core");
    const json_utilts_1 = require("@ngrx/effects/schematics-core/utility/json-utilts");
    // https://github.com/angular/angular-cli/blob/master/packages/schematics/angular/migrations/update-9/utils.ts
    function isIvyEnabled(tree, tsConfigPath) {
        // In version 9, Ivy is turned on by default
        // Ivy is opted out only when 'enableIvy' is set to false.
        const buffer = tree.read(tsConfigPath);
        if (!buffer) {
            return true;
        }
        const tsCfgAst = core_1.parseJsonAst(buffer.toString(), core_1.JsonParseMode.Loose);
        if (tsCfgAst.kind !== 'object') {
            return true;
        }
        const ngCompilerOptions = json_utilts_1.findPropertyInAstObject(tsCfgAst, 'angularCompilerOptions');
        if (ngCompilerOptions && ngCompilerOptions.kind === 'object') {
            const enableIvy = json_utilts_1.findPropertyInAstObject(ngCompilerOptions, 'enableIvy');
            if (enableIvy) {
                return !!enableIvy.value;
            }
        }
        const configExtends = json_utilts_1.findPropertyInAstObject(tsCfgAst, 'extends');
        if (configExtends && configExtends.kind === 'string') {
            const extendedTsConfigPath = core_1.resolve(core_1.dirname(core_1.normalize(tsConfigPath)), core_1.normalize(configExtends.value));
            return isIvyEnabled(tree, extendedTsConfigPath);
        }
        return true;
    }
    exports.isIvyEnabled = isIvyEnabled;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZWZmZWN0cy9zY2hlbWF0aWNzLWNvcmUvdXRpbGl0eS9hbmd1bGFyLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUEsK0NBTThCO0lBRTlCLG1GQUF3RDtJQUV4RCw4R0FBOEc7SUFDOUcsU0FBZ0IsWUFBWSxDQUFDLElBQVUsRUFBRSxZQUFvQjtRQUMzRCw0Q0FBNEM7UUFDNUMsMERBQTBEO1FBRTFELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNYLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxNQUFNLFFBQVEsR0FBRyxtQkFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxvQkFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXRFLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE1BQU0saUJBQWlCLEdBQUcscUNBQXVCLENBQy9DLFFBQVEsRUFDUix3QkFBd0IsQ0FDekIsQ0FBQztRQUNGLElBQUksaUJBQWlCLElBQUksaUJBQWlCLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUM1RCxNQUFNLFNBQVMsR0FBRyxxQ0FBdUIsQ0FBQyxpQkFBaUIsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUUxRSxJQUFJLFNBQVMsRUFBRTtnQkFDYixPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO2FBQzFCO1NBQ0Y7UUFFRCxNQUFNLGFBQWEsR0FBRyxxQ0FBdUIsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDbkUsSUFBSSxhQUFhLElBQUksYUFBYSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDcEQsTUFBTSxvQkFBb0IsR0FBRyxjQUFPLENBQ2xDLGNBQU8sQ0FBQyxnQkFBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQ2hDLGdCQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUMvQixDQUFDO1lBRUYsT0FBTyxZQUFZLENBQUMsSUFBSSxFQUFFLG9CQUFvQixDQUFDLENBQUM7U0FDakQ7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUF0Q0Qsb0NBc0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgSnNvblBhcnNlTW9kZSxcbiAgZGlybmFtZSxcbiAgbm9ybWFsaXplLFxuICBwYXJzZUpzb25Bc3QsXG4gIHJlc29sdmUsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IFRyZWUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyBmaW5kUHJvcGVydHlJbkFzdE9iamVjdCB9IGZyb20gJy4vanNvbi11dGlsdHMnO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLWNsaS9ibG9iL21hc3Rlci9wYWNrYWdlcy9zY2hlbWF0aWNzL2FuZ3VsYXIvbWlncmF0aW9ucy91cGRhdGUtOS91dGlscy50c1xuZXhwb3J0IGZ1bmN0aW9uIGlzSXZ5RW5hYmxlZCh0cmVlOiBUcmVlLCB0c0NvbmZpZ1BhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAvLyBJbiB2ZXJzaW9uIDksIEl2eSBpcyB0dXJuZWQgb24gYnkgZGVmYXVsdFxuICAvLyBJdnkgaXMgb3B0ZWQgb3V0IG9ubHkgd2hlbiAnZW5hYmxlSXZ5JyBpcyBzZXQgdG8gZmFsc2UuXG5cbiAgY29uc3QgYnVmZmVyID0gdHJlZS5yZWFkKHRzQ29uZmlnUGF0aCk7XG4gIGlmICghYnVmZmVyKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdCB0c0NmZ0FzdCA9IHBhcnNlSnNvbkFzdChidWZmZXIudG9TdHJpbmcoKSwgSnNvblBhcnNlTW9kZS5Mb29zZSk7XG5cbiAgaWYgKHRzQ2ZnQXN0LmtpbmQgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdCBuZ0NvbXBpbGVyT3B0aW9ucyA9IGZpbmRQcm9wZXJ0eUluQXN0T2JqZWN0KFxuICAgIHRzQ2ZnQXN0LFxuICAgICdhbmd1bGFyQ29tcGlsZXJPcHRpb25zJ1xuICApO1xuICBpZiAobmdDb21waWxlck9wdGlvbnMgJiYgbmdDb21waWxlck9wdGlvbnMua2luZCA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCBlbmFibGVJdnkgPSBmaW5kUHJvcGVydHlJbkFzdE9iamVjdChuZ0NvbXBpbGVyT3B0aW9ucywgJ2VuYWJsZUl2eScpO1xuXG4gICAgaWYgKGVuYWJsZUl2eSkge1xuICAgICAgcmV0dXJuICEhZW5hYmxlSXZ5LnZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGNvbmZpZ0V4dGVuZHMgPSBmaW5kUHJvcGVydHlJbkFzdE9iamVjdCh0c0NmZ0FzdCwgJ2V4dGVuZHMnKTtcbiAgaWYgKGNvbmZpZ0V4dGVuZHMgJiYgY29uZmlnRXh0ZW5kcy5raW5kID09PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IGV4dGVuZGVkVHNDb25maWdQYXRoID0gcmVzb2x2ZShcbiAgICAgIGRpcm5hbWUobm9ybWFsaXplKHRzQ29uZmlnUGF0aCkpLFxuICAgICAgbm9ybWFsaXplKGNvbmZpZ0V4dGVuZHMudmFsdWUpXG4gICAgKTtcblxuICAgIHJldHVybiBpc0l2eUVuYWJsZWQodHJlZSwgZXh0ZW5kZWRUc0NvbmZpZ1BhdGgpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=