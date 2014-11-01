declare var io: any;
enum ComponentType{
		View, Utility, Controller
}
class ServerResponse {
    type: string;
    data: any;
}
interface Component{
    componentType: ComponentType;
    name: string;
    code: string;
}
class Updater{
    adapter: IAdapter;

    constructor() {
        this.adapter = new DotAdapter();
    }
	socket;
    serverUrl = "http://localhost:1337/";
	protocolVersion = "watchUpdate:0.1";
    RegisterWebSocket(): void{
        this.socket = new io(this.serverUrl);
        this.socket.on('update component', (event) => {
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
		switch(component.componentType){
			case ComponentType.View:
				this.adapter.RefreshModelFromView(component.name);
                this.adapter.RegisterView(component.name, component.code);
				break;
			case ComponentType.Utility:
                this.adapter.RegisterUtility(component.name, component.code);
				break;
			case ComponentType.Controller:
                this.adapter.RegisterController(component.name, component.code);
				break;
		}
	}
}