import {HttpRestRequest} from "./ServerConnection.js";
import {ServerConnectionUI, CrudServiceUI} from "./ServerConnectionUI.js";
import {CrudController} from "./CrudController.js";

class ServerConnectionService extends ServerConnectionUI {

	constructor($locale, $route, $rootScope, $q, $timeout, $controllerProvider, $routeProvider) {
		super($locale, $route, $rootScope, $q, $timeout, $controllerProvider, $routeProvider);
    }

    login(server, path, user, password, callbackPartial, dbUri) {
        return super.login(server, path, user, password, CrudServiceUI, callbackPartial, dbUri);
    }

}

class LoginController {

    constructor(serverConnection, server, dbUri) {
		this.serverConnection = serverConnection;
		this.server = server;
		this.dbUri = dbUri;
		this.user = "";
		this.password = "";
		this.message = "";
		console.log(`User query param dbUri=postgresql://dbuser:secretpassword@database.server.com:3211/mydb`);

	  	if (this.serverConnection.user != undefined) {
	    	this.serverConnection.logout();
	    	window.location.reload();
		}
    }

    login() {
    	// TODO : resolve path to load from UI
    	this.path = "";
    	return this.serverConnection.login(this.server, this.path, this.user.toLowerCase(), this.password, message => this.message = message, this.dbUri);
    }

}

class MenuController {

    constructor(serverConnection) {
    	this.serverConnection = serverConnection;
    	this.isCollapsed = true;
    }

    label(str) {
    	return this.serverConnection.convertCaseAnyToLabel(str);
    }

}

class Crud {
	
    static initialize($controllerProvider, $routeProvider, $compileProvider, $provide) {
    	$provide.service("ServerConnectionService", function($locale, $route, $rootScope, $q, $timeout) {
    		HttpRestRequest.$q = $q;
    		return new ServerConnectionService($locale, $route, $rootScope, $q, $timeout, $controllerProvider, $routeProvider);
    	});

    	$controllerProvider.register("CrudController", function(ServerConnectionService, $scope) {
    		return new CrudController(ServerConnectionService, $scope);
    	});

    	$controllerProvider.register('LoginController', function(ServerConnectionService) {
    		const url = new URL(window.location.hash.substring(2), window.location.href);
    		const server = url.searchParams.get("server");
    		const dbUri = url.searchParams.get("dbUri");
    		console.log("Crud.initialize : LoginController.server = ", server);
    		return new LoginController(ServerConnectionService, server, dbUri);
    	});

    	$controllerProvider.register("MenuController", function(ServerConnectionService) {
    	    return new MenuController(ServerConnectionService);
    	});

    	$compileProvider.directive('crudTable', () => {
    		return {restrict: 'E', scope: {vm: '=crud'}, templateUrl: './templates/crud-table.html'};
    	});

    	$compileProvider.directive('crudItem', () => {
    		return {restrict: 'E', scope: {vm: '=', edit: '='}, templateUrl: './templates/crud-item.html'};
    	});

    	$compileProvider.directive('crudItemJson', () => {
    		return {restrict: 'E', scope: {vm: '=', edit: '='}, templateUrl: './templates/crud-item-json.html'};
    	});

    	$compileProvider.directive('crudJsonArray', () => {
    		return {restrict: 'E', scope: {vm: '=', edit: '='}, templateUrl: './templates/crud-json-array.html'};
    	});

    	$compileProvider.directive('crudObjJson', () => {
    		return {restrict: 'E', scope: {vm: '=', edit: '='}, templateUrl: './templates/crud-obj-json.html'};
    	});
    }
    
}

export {Crud};

