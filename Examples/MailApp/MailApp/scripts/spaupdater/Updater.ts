enum ComponentType{
		View, Utility, Controller
}
class ServerResponse {
    type: string;
    data: any;
}
class Component{
    componentType: ComponentType;
    name: string;
    code: string;
    get Code() {
        return eval(this.code);
    }
}
class Updater{
    adapter: IAdapter;
	
	socket: WebSocket;
	serverUrl = "http://spaupdater.azurewebsites.net/SocketListen";
	protocolVersion = "watchUpdate:0.1";
	RegisterWebSocket():void{
		this.socket = new WebSocket(this.serverUrl,this.protocolVersion);
		this.socket.onmessage =(event)=>{
			this.OnServerResponse(JSON.parse(event.data));
		}
	}
	OnServerResponse(serverResponse: ServerResponse){
		switch (serverResponse.type){
			case "UpdateComponent":
				if (this.pendingFullPageUpdate)
					this.UpdatePage();
				else
					this.UpdateComponent(<Component>serverResponse.data);
				break;
			case "UpdatePage":
				break;
		}
	}
	pendingUpdates = 0;
	pendingFullPageUpdate=false;
	UpdatePage(){
		this.pendingFullPageUpdate = true;
		this.pendingUpdates++;
		console.log('There are '+this.pendingUpdates+' updates pending. Refresh the page to get latest');
	}
	UpdateComponent(component:Component):void{
		switch(component.componentType){
			case ComponentType.View:
				this.adapter.RefreshModelFromView(component.name);
				this.adapter.RegisterView(component.name,component.Code);
				break;
			case ComponentType.Utility:
				this.adapter.RegisterUtility(component.name,component.Code);
				break;
			case ComponentType.Controller:
				this.adapter.RegisterController(component.name,component.Code);
				break;
		}
	}
}