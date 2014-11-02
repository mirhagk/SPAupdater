var DotAdapter = (function () {
    function DotAdapter() {
    }
    DotAdapter.prototype.RegisterController = function (controllerName, controller) {
        Controller[controllerName] = new Function(controller);
    };
    DotAdapter.prototype.RegisterUtility = function (utilityName, utility) {
        Util[utilityName] = new Function(utility);
    };
    DotAdapter.prototype.RefreshModelFromView = function (viewName) {
    };
    DotAdapter.prototype.RegisterView = function (viewName, view) {
        document.getElementById(viewName).innerHTML = view;
        RefreshTemplates();
    };
    DotAdapter.prototype.RegisterCustom = function (componentType, componentName, code) {
        return null;
    };
    return DotAdapter;
})();
//# sourceMappingURL=DotAdapter.js.map
