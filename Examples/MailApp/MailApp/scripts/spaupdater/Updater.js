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
        var _this = this;
        this.pollingRate = 2000;
        this.lastCommit = null;
        this.serverUrl = "http://drivethruspa.cloudapp.net:1337";
        this.protocolVersion = "watchUpdate:0.1";
        this.pendingUpdates = 0;
        this.pendingFullPageUpdate = false;
        this.adapter = new DotAdapter();
        Ajax.Get(this.serverUrl + '/api/latestcommit', function (res) {
            _this.lastCommit = JSON.parse(res).Commit;
            _this.CheckForUpdate();
        });
    }
    Updater.prototype.CheckForUpdate = function () {
        var _this = this;
        Ajax.Get(this.serverUrl + '/api/getchanges', function (res) {
            console.log(res);
            var commits = JSON.parse(res);
            commits.forEach(function (commit) {
                commit.Updates.forEach(function (update) {
                    if (update.updateType == "page update")
                        _this.UpdatePage();
                    else if (update.updateType == "component update") {
                        var component = update;
                        _this.UpdateComponent(component);
                    }
                });
                _this.lastCommit = commit.Commit;
            });
        }, { lastCommit: this.lastCommit });
        if (this.pollingRate)
            window.setTimeout(function () {
                return _this.CheckForUpdate();
            }, this.pollingRate);
    };

    Updater.prototype.RegisterWebSocket = function () {
        var _this = this;
        this.socket = new io(this.serverUrl);
        this.socket.on('component update', function (event) {
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
        if (this.pendingFullPageUpdate) {
            this.UpdatePage();
        }
        switch (component.component) {
            case "view":
                this.adapter.RefreshModelFromView(component.name);
                this.adapter.RegisterView(component.name, component.code);
                break;
            case "utility":
                this.adapter.RegisterUtility(component.name, component.code);
                break;
            case "controller":
                this.adapter.RegisterController(component.name, component.code);
                break;
        }
    };
    return Updater;
})();
//# sourceMappingURL=Updater.js.map
