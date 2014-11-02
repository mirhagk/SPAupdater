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
        document.getElementById(viewName).innerHTML = view;
        RefreshTemplates();
    }
    RegisterCustom(componentType: string, componentName: string, code: any): void {
        return null;
    }
}
declare var Controller: any;
declare var Util: any;
declare var RefreshTemplates: any;