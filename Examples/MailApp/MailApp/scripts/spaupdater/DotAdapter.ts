class DotAdapter implements IAdapter{
	RegisterController(controllerName:string,controller:any):void{
		Controller[controllerName] = controller;
	}
	RegisterUtility(utilityName:string,utility:any):void{
		Util[utilityName] = utility;
	}
	RefreshModelFromView(viewName:string):void{
		
	}
	RegisterView(viewName:string, view:any):void{
	}
}
declare var Controller: any;
declare var Util: any;