interface IAdapter{
	RegisterController(controllerName:string,controller:any):void
	RegisterUtility(utilityName:string,utility:any):void
	RefreshModelFromView(viewName:string):void
	RegisterView(viewName: string, view: any): void
    RegisterCustom(componentType: string, componentName: string, code: any):void
}