class DotAdapter implements IAdapter{
	RegisterController(controllerName:string,controller:any):void{
		Controller[controllerName] = new Function(controller);
	}
	RegisterUtility(utilityName:string,utility:any):void{
		Util[utilityName] = new Function(utility);
	}
	RefreshModelFromView(viewName:string):void{
		
	}
    RegisterView(viewName: string, view: any): void{
        document.getElementById(viewName + 'Template').innerHTML = view;
        RefreshTemplates();
	}
}
declare var Controller: any;
declare var Util: any;
declare var RefreshTemplates: any;