(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/effects/schematics-core", ["require", "exports", "@ngrx/effects/schematics-core/utility/strings", "@ngrx/effects/schematics-core/utility/angular-utils", "@ngrx/effects/schematics-core/utility/ast-utils", "@ngrx/effects/schematics-core/utility/change", "@ngrx/effects/schematics-core/utility/config", "@ngrx/effects/schematics-core/utility/find-module", "@ngrx/effects/schematics-core/utility/json-utilts", "@ngrx/effects/schematics-core/utility/ngrx-utils", "@ngrx/effects/schematics-core/utility/project", "@ngrx/effects/schematics-core/utility/update", "@ngrx/effects/schematics-core/utility/parse-name", "@ngrx/effects/schematics-core/utility/package", "@ngrx/effects/schematics-core/utility/libs-version", "@ngrx/effects/schematics-core/utility/visitors"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const strings_1 = require("@ngrx/effects/schematics-core/utility/strings");
    var angular_utils_1 = require("@ngrx/effects/schematics-core/utility/angular-utils");
    exports.isIvyEnabled = angular_utils_1.isIvyEnabled;
    var ast_utils_1 = require("@ngrx/effects/schematics-core/utility/ast-utils");
    exports.findNodes = ast_utils_1.findNodes;
    exports.getSourceNodes = ast_utils_1.getSourceNodes;
    exports.getDecoratorMetadata = ast_utils_1.getDecoratorMetadata;
    exports.getContentOfKeyLiteral = ast_utils_1.getContentOfKeyLiteral;
    exports.insertAfterLastOccurrence = ast_utils_1.insertAfterLastOccurrence;
    exports.insertImport = ast_utils_1.insertImport;
    exports.addBootstrapToModule = ast_utils_1.addBootstrapToModule;
    exports.addDeclarationToModule = ast_utils_1.addDeclarationToModule;
    exports.addExportToModule = ast_utils_1.addExportToModule;
    exports.addImportToModule = ast_utils_1.addImportToModule;
    exports.addProviderToModule = ast_utils_1.addProviderToModule;
    exports.replaceImport = ast_utils_1.replaceImport;
    exports.containsProperty = ast_utils_1.containsProperty;
    var change_1 = require("@ngrx/effects/schematics-core/utility/change");
    exports.NoopChange = change_1.NoopChange;
    exports.InsertChange = change_1.InsertChange;
    exports.RemoveChange = change_1.RemoveChange;
    exports.ReplaceChange = change_1.ReplaceChange;
    exports.createReplaceChange = change_1.createReplaceChange;
    exports.createChangeRecorder = change_1.createChangeRecorder;
    exports.commitChanges = change_1.commitChanges;
    var config_1 = require("@ngrx/effects/schematics-core/utility/config");
    exports.getWorkspace = config_1.getWorkspace;
    exports.getWorkspacePath = config_1.getWorkspacePath;
    var find_module_1 = require("@ngrx/effects/schematics-core/utility/find-module");
    exports.findModule = find_module_1.findModule;
    exports.findModuleFromOptions = find_module_1.findModuleFromOptions;
    exports.buildRelativePath = find_module_1.buildRelativePath;
    var json_utilts_1 = require("@ngrx/effects/schematics-core/utility/json-utilts");
    exports.findPropertyInAstObject = json_utilts_1.findPropertyInAstObject;
    var ngrx_utils_1 = require("@ngrx/effects/schematics-core/utility/ngrx-utils");
    exports.addReducerToState = ngrx_utils_1.addReducerToState;
    exports.addReducerToStateInterface = ngrx_utils_1.addReducerToStateInterface;
    exports.addReducerImportToNgModule = ngrx_utils_1.addReducerImportToNgModule;
    exports.addReducerToActionReducerMap = ngrx_utils_1.addReducerToActionReducerMap;
    exports.omit = ngrx_utils_1.omit;
    var project_1 = require("@ngrx/effects/schematics-core/utility/project");
    exports.getProjectPath = project_1.getProjectPath;
    exports.getProject = project_1.getProject;
    exports.isLib = project_1.isLib;
    exports.stringUtils = {
        dasherize: strings_1.dasherize,
        decamelize: strings_1.decamelize,
        camelize: strings_1.camelize,
        classify: strings_1.classify,
        underscore: strings_1.underscore,
        group: strings_1.group,
        capitalize: strings_1.capitalize,
        featurePath: strings_1.featurePath,
        pluralize: strings_1.pluralize,
    };
    var update_1 = require("@ngrx/effects/schematics-core/utility/update");
    exports.updatePackage = update_1.updatePackage;
    var parse_name_1 = require("@ngrx/effects/schematics-core/utility/parse-name");
    exports.parseName = parse_name_1.parseName;
    var package_1 = require("@ngrx/effects/schematics-core/utility/package");
    exports.addPackageToPackageJson = package_1.addPackageToPackageJson;
    var libs_version_1 = require("@ngrx/effects/schematics-core/utility/libs-version");
    exports.platformVersion = libs_version_1.platformVersion;
    var visitors_1 = require("@ngrx/effects/schematics-core/utility/visitors");
    exports.visitTSSourceFiles = visitors_1.visitTSSourceFiles;
    exports.visitNgModuleImports = visitors_1.visitNgModuleImports;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc2NoZW1hdGljcy1jb3JlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUEsMkVBVTJCO0lBRTNCLHFGQUF1RDtJQUE5Qyx1Q0FBQSxZQUFZLENBQUE7SUFFckIsNkVBYzZCO0lBYjNCLGdDQUFBLFNBQVMsQ0FBQTtJQUNULHFDQUFBLGNBQWMsQ0FBQTtJQUNkLDJDQUFBLG9CQUFvQixDQUFBO0lBQ3BCLDZDQUFBLHNCQUFzQixDQUFBO0lBQ3RCLGdEQUFBLHlCQUF5QixDQUFBO0lBQ3pCLG1DQUFBLFlBQVksQ0FBQTtJQUNaLDJDQUFBLG9CQUFvQixDQUFBO0lBQ3BCLDZDQUFBLHNCQUFzQixDQUFBO0lBQ3RCLHdDQUFBLGlCQUFpQixDQUFBO0lBQ2pCLHdDQUFBLGlCQUFpQixDQUFBO0lBQ2pCLDBDQUFBLG1CQUFtQixDQUFBO0lBQ25CLG9DQUFBLGFBQWEsQ0FBQTtJQUNiLHVDQUFBLGdCQUFnQixDQUFBO0lBR2xCLHVFQVUwQjtJQVB4Qiw4QkFBQSxVQUFVLENBQUE7SUFDVixnQ0FBQSxZQUFZLENBQUE7SUFDWixnQ0FBQSxZQUFZLENBQUE7SUFDWixpQ0FBQSxhQUFhLENBQUE7SUFDYix1Q0FBQSxtQkFBbUIsQ0FBQTtJQUNuQix3Q0FBQSxvQkFBb0IsQ0FBQTtJQUNwQixpQ0FBQSxhQUFhLENBQUE7SUFHZix1RUFBNkU7SUFBekQsZ0NBQUEsWUFBWSxDQUFBO0lBQUUsb0NBQUEsZ0JBQWdCLENBQUE7SUFFbEQsaUZBSytCO0lBSjdCLG1DQUFBLFVBQVUsQ0FBQTtJQUNWLDhDQUFBLHFCQUFxQixDQUFBO0lBQ3JCLDBDQUFBLGlCQUFpQixDQUFBO0lBSW5CLGlGQUFnRTtJQUF2RCxnREFBQSx1QkFBdUIsQ0FBQTtJQUVoQywrRUFNOEI7SUFMNUIseUNBQUEsaUJBQWlCLENBQUE7SUFDakIsa0RBQUEsMEJBQTBCLENBQUE7SUFDMUIsa0RBQUEsMEJBQTBCLENBQUE7SUFDMUIsb0RBQUEsNEJBQTRCLENBQUE7SUFDNUIsNEJBQUEsSUFBSSxDQUFBO0lBR04seUVBQXNFO0lBQTdELG1DQUFBLGNBQWMsQ0FBQTtJQUFFLCtCQUFBLFVBQVUsQ0FBQTtJQUFFLDBCQUFBLEtBQUssQ0FBQTtJQUU3QixRQUFBLFdBQVcsR0FBRztRQUN6QixTQUFTLEVBQVQsbUJBQVM7UUFDVCxVQUFVLEVBQVYsb0JBQVU7UUFDVixRQUFRLEVBQVIsa0JBQVE7UUFDUixRQUFRLEVBQVIsa0JBQVE7UUFDUixVQUFVLEVBQVYsb0JBQVU7UUFDVixLQUFLLEVBQUwsZUFBSztRQUNMLFVBQVUsRUFBVixvQkFBVTtRQUNWLFdBQVcsRUFBWCxxQkFBVztRQUNYLFNBQVMsRUFBVCxtQkFBUztLQUNWLENBQUM7SUFFRix1RUFBaUQ7SUFBeEMsaUNBQUEsYUFBYSxDQUFBO0lBRXRCLCtFQUFpRDtJQUF4QyxpQ0FBQSxTQUFTLENBQUE7SUFFbEIseUVBQTREO0lBQW5ELDRDQUFBLHVCQUF1QixDQUFBO0lBRWhDLG1GQUF5RDtJQUFoRCx5Q0FBQSxlQUFlLENBQUE7SUFFeEIsMkVBQThFO0lBQXJFLHdDQUFBLGtCQUFrQixDQUFBO0lBQUUsMENBQUEsb0JBQW9CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBkYXNoZXJpemUsXG4gIGRlY2FtZWxpemUsXG4gIGNhbWVsaXplLFxuICBjbGFzc2lmeSxcbiAgdW5kZXJzY29yZSxcbiAgZ3JvdXAsXG4gIGNhcGl0YWxpemUsXG4gIGZlYXR1cmVQYXRoLFxuICBwbHVyYWxpemUsXG59IGZyb20gJy4vdXRpbGl0eS9zdHJpbmdzJztcblxuZXhwb3J0IHsgaXNJdnlFbmFibGVkIH0gZnJvbSAnLi91dGlsaXR5L2FuZ3VsYXItdXRpbHMnO1xuXG5leHBvcnQge1xuICBmaW5kTm9kZXMsXG4gIGdldFNvdXJjZU5vZGVzLFxuICBnZXREZWNvcmF0b3JNZXRhZGF0YSxcbiAgZ2V0Q29udGVudE9mS2V5TGl0ZXJhbCxcbiAgaW5zZXJ0QWZ0ZXJMYXN0T2NjdXJyZW5jZSxcbiAgaW5zZXJ0SW1wb3J0LFxuICBhZGRCb290c3RyYXBUb01vZHVsZSxcbiAgYWRkRGVjbGFyYXRpb25Ub01vZHVsZSxcbiAgYWRkRXhwb3J0VG9Nb2R1bGUsXG4gIGFkZEltcG9ydFRvTW9kdWxlLFxuICBhZGRQcm92aWRlclRvTW9kdWxlLFxuICByZXBsYWNlSW1wb3J0LFxuICBjb250YWluc1Byb3BlcnR5LFxufSBmcm9tICcuL3V0aWxpdHkvYXN0LXV0aWxzJztcblxuZXhwb3J0IHtcbiAgSG9zdCxcbiAgQ2hhbmdlLFxuICBOb29wQ2hhbmdlLFxuICBJbnNlcnRDaGFuZ2UsXG4gIFJlbW92ZUNoYW5nZSxcbiAgUmVwbGFjZUNoYW5nZSxcbiAgY3JlYXRlUmVwbGFjZUNoYW5nZSxcbiAgY3JlYXRlQ2hhbmdlUmVjb3JkZXIsXG4gIGNvbW1pdENoYW5nZXMsXG59IGZyb20gJy4vdXRpbGl0eS9jaGFuZ2UnO1xuXG5leHBvcnQgeyBBcHBDb25maWcsIGdldFdvcmtzcGFjZSwgZ2V0V29ya3NwYWNlUGF0aCB9IGZyb20gJy4vdXRpbGl0eS9jb25maWcnO1xuXG5leHBvcnQge1xuICBmaW5kTW9kdWxlLFxuICBmaW5kTW9kdWxlRnJvbU9wdGlvbnMsXG4gIGJ1aWxkUmVsYXRpdmVQYXRoLFxuICBNb2R1bGVPcHRpb25zLFxufSBmcm9tICcuL3V0aWxpdHkvZmluZC1tb2R1bGUnO1xuXG5leHBvcnQgeyBmaW5kUHJvcGVydHlJbkFzdE9iamVjdCB9IGZyb20gJy4vdXRpbGl0eS9qc29uLXV0aWx0cyc7XG5cbmV4cG9ydCB7XG4gIGFkZFJlZHVjZXJUb1N0YXRlLFxuICBhZGRSZWR1Y2VyVG9TdGF0ZUludGVyZmFjZSxcbiAgYWRkUmVkdWNlckltcG9ydFRvTmdNb2R1bGUsXG4gIGFkZFJlZHVjZXJUb0FjdGlvblJlZHVjZXJNYXAsXG4gIG9taXQsXG59IGZyb20gJy4vdXRpbGl0eS9uZ3J4LXV0aWxzJztcblxuZXhwb3J0IHsgZ2V0UHJvamVjdFBhdGgsIGdldFByb2plY3QsIGlzTGliIH0gZnJvbSAnLi91dGlsaXR5L3Byb2plY3QnO1xuXG5leHBvcnQgY29uc3Qgc3RyaW5nVXRpbHMgPSB7XG4gIGRhc2hlcml6ZSxcbiAgZGVjYW1lbGl6ZSxcbiAgY2FtZWxpemUsXG4gIGNsYXNzaWZ5LFxuICB1bmRlcnNjb3JlLFxuICBncm91cCxcbiAgY2FwaXRhbGl6ZSxcbiAgZmVhdHVyZVBhdGgsXG4gIHBsdXJhbGl6ZSxcbn07XG5cbmV4cG9ydCB7IHVwZGF0ZVBhY2thZ2UgfSBmcm9tICcuL3V0aWxpdHkvdXBkYXRlJztcblxuZXhwb3J0IHsgcGFyc2VOYW1lIH0gZnJvbSAnLi91dGlsaXR5L3BhcnNlLW5hbWUnO1xuXG5leHBvcnQgeyBhZGRQYWNrYWdlVG9QYWNrYWdlSnNvbiB9IGZyb20gJy4vdXRpbGl0eS9wYWNrYWdlJztcblxuZXhwb3J0IHsgcGxhdGZvcm1WZXJzaW9uIH0gZnJvbSAnLi91dGlsaXR5L2xpYnMtdmVyc2lvbic7XG5cbmV4cG9ydCB7IHZpc2l0VFNTb3VyY2VGaWxlcywgdmlzaXROZ01vZHVsZUltcG9ydHMgfSBmcm9tICcuL3V0aWxpdHkvdmlzaXRvcnMnO1xuIl19