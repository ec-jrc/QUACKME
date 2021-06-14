(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@ngrx/effects/schematics-core/utility/json-utilts", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // https://github.com/angular/angular-cli/blob/master/packages/schematics/angular/utility/json-utils.ts
    function findPropertyInAstObject(node, propertyName) {
        let maybeNode = null;
        for (const property of node.properties) {
            if (property.key.value == propertyName) {
                maybeNode = property.value;
            }
        }
        return maybeNode;
    }
    exports.findPropertyInAstObject = findPropertyInAstObject;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi11dGlsdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc2NoZW1hdGljcy1jb3JlL3V0aWxpdHkvanNvbi11dGlsdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFFQSx1R0FBdUc7SUFDdkcsU0FBZ0IsdUJBQXVCLENBQ3JDLElBQW1CLEVBQ25CLFlBQW9CO1FBRXBCLElBQUksU0FBUyxHQUF1QixJQUFJLENBQUM7UUFDekMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3RDLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksWUFBWSxFQUFFO2dCQUN0QyxTQUFTLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQzthQUM1QjtTQUNGO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQVpELDBEQVlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSnNvbkFzdE5vZGUsIEpzb25Bc3RPYmplY3QgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXItY2xpL2Jsb2IvbWFzdGVyL3BhY2thZ2VzL3NjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L2pzb24tdXRpbHMudHNcbmV4cG9ydCBmdW5jdGlvbiBmaW5kUHJvcGVydHlJbkFzdE9iamVjdChcbiAgbm9kZTogSnNvbkFzdE9iamVjdCxcbiAgcHJvcGVydHlOYW1lOiBzdHJpbmdcbik6IEpzb25Bc3ROb2RlIHwgbnVsbCB7XG4gIGxldCBtYXliZU5vZGU6IEpzb25Bc3ROb2RlIHwgbnVsbCA9IG51bGw7XG4gIGZvciAoY29uc3QgcHJvcGVydHkgb2Ygbm9kZS5wcm9wZXJ0aWVzKSB7XG4gICAgaWYgKHByb3BlcnR5LmtleS52YWx1ZSA9PSBwcm9wZXJ0eU5hbWUpIHtcbiAgICAgIG1heWJlTm9kZSA9IHByb3BlcnR5LnZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXliZU5vZGU7XG59XG4iXX0=