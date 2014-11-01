var ComponentType;
(function (ComponentType) {
    ComponentType[ComponentType["View"] = 0] = "View";
    ComponentType[ComponentType["Utility"] = 1] = "Utility";
    ComponentType[ComponentType["Controller"] = 2] = "Controller";
})(ComponentType || (ComponentType = {}));
var ServerResponse = (function () {
    function ServerResponse() {
    }
    return ServerResponse;
})();

var Updater = (function () {
    function Updater() {
        this.serverUrl = "http://localhost:1337/";
        this.protocolVersion = "watchUpdate:0.1";
        this.pendingUpdates = 0;
        this.pendingFullPageUpdate = false;
        this.adapter = new DotAdapter();
    }
    Updater.prototype.RegisterWebSocket = function () {
        var _this = this;
        this.socket = new io(this.serverUrl);
        this.socket.on('update component', function (event) {
            if (_this.pendingFullPageUpdate)
                _this.UpdatePage();
            else
                _this.UpdateComponent(JSON.parse(event.data));
        });
        this.socket.on('update page', function (event) {
            _this.UpdatePage();
        });
    };

    Updater.prototype.UpdatePage = function () {
        this.pendingFullPageUpdate = true;
        this.pendingUpdates++;
        console.log('There are ' + this.pendingUpdates + ' updates pending. Refresh the page to get latest');
    };
    Updater.prototype.UpdateComponent = function (component) {
        switch (component.componentType) {
            case 0 /* View */:
                this.adapter.RefreshModelFromView(component.name);
                this.adapter.RegisterView(component.name, component.code);
                break;
            case 1 /* Utility */:
                this.adapter.RegisterUtility(component.name, component.code);
                break;
            case 2 /* Controller */:
                this.adapter.RegisterController(component.name, component.code);
                break;
        }
    };
    return Updater;
})();
//# sourceMappingURL=Updater.js.map
