declare var io: any;
enum ComponentType{
		View, Utility, Controller
}
class ServerResponse {
    type: string;
    data: any;
}
interface Component{
    component: string;
    name: string;
    code: string;
}
class Updater{
    adapter: IAdapter;

    constructor() {
        this.adapter = new DotAdapter();
        Ajax.Get(this.serverUrl + '/api/latestcommit', (res) => {
            this.lastCommit = JSON.parse(res).Commit;
            this.CheckForUpdate();
        });
    }
    pollingRate = 2000;
    lastCommit = null;
    CheckForUpdate(): void {
        Ajax.Get(this.serverUrl + '/api/getchanges', (res) => {
            console.log(res);
            var commits = JSON.parse(res);
            commits.forEach(commit=> {
                commit.Updates.forEach(update=> {
                    if (update.updateType == "page update")
                        this.UpdatePage();
                    else if (update.updateType == "component update") {
                        var component = <Component>update;
                        this.UpdateComponent(component);
                    }
                });
                this.lastCommit = commit.Commit;
            });
        }, { lastCommit: this.lastCommit });
        if (this.pollingRate)
            window.setTimeout(() => this.CheckForUpdate(), this.pollingRate);
    }
	socket;
    serverUrl = "http://drivethruspa.cloudapp.net:1337";
	protocolVersion = "watchUpdate:0.1";
    RegisterWebSocket(): void{
        this.socket = new io(this.serverUrl);
        this.socket.on('component update', (event) => {
            if (this.pendingFullPageUpdate)
                this.UpdatePage();
            else
                this.UpdateComponent(<Component>JSON.parse(event.data));
        });
        this.socket.on('update page', (event) => {
            this.UpdatePage();
        });
	}
	pendingUpdates = 0;
	pendingFullPageUpdate=false;
	UpdatePage(){
		this.pendingFullPageUpdate = true;
		this.pendingUpdates++;
		console.log('There are '+this.pendingUpdates+' updates pending. Refresh the page to get latest');
	}
    UpdateComponent(component: Component): void{
        if (this.pendingFullPageUpdate) {
            this.UpdatePage();
        }
		switch(component.component){
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
	}
}