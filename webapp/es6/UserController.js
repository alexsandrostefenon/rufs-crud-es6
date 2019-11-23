import {CrudController} from "./CrudController.js";
import {CrudItemJson} from "./CrudItemJson.js";
import {CrudObjJson} from "./CrudObjJson.js";
import {CrudJsonArray} from "./CrudJsonArray.js";

class UserController extends CrudController {

    constructor(serverConnection, $scope) {
    	super(serverConnection, $scope);
        this.fields["password"].htmlType = "password";
//      debugger;
    	// Regras de acesso aos serviços
		const fieldsRoles = {
    			"read":{type:"b", "defaultValue":true},
    			"query":{type:"b", "defaultValue":true},
    			"create":{type:"b", "defaultValue":false},
    			"update":{type:"b", "defaultValue":false},
    			"delete":{type:"b", "defaultValue":false}
    			};

    	const nameOptionsRoles = [];

    	for (let item of this.serverConnection.services.rufsService.list) {
    		nameOptionsRoles.push(item.name);
    	}

    	this.listItemCrudJson.push(new CrudItemJson(this, fieldsRoles, "roles", "Controle de Acesso", this.serverConnection, nameOptionsRoles));
    	//
    	// Menu do usuário
//    	$routeProvider.when("/app/:name/:action", {templateUrl: "/crud/templates/crud.html", controller: "CrudController", controllerAs: "vm"});
    	const fieldsMenu = {
    			"menu":{"defaultValue":"action", "options":["action","help","configuration","report","form"]},
    			"label":{},
    			"path":{"defaultValue":"service/action?filter={}&aggregate={}"}
    			};

    	this.listItemCrudJson.push(new CrudItemJson(this, fieldsMenu, "menu", "Menu", this.serverConnection));
    	// Configurações Json
/*
    	var fieldsConfig = {
    			"modules":{"defaultValue":"es6/CrudController.js"}
    			};

    	this.listObjCrudJson.push(new CrudObjJson(this, fieldsConfig, this.instance, "config", "Configurações", this.serverConnection));
*/
    	const fieldsRoute = {
    			"path":{"primaryKey":true, "defaultValue":"/app/xxx/:action"},
    			"templateUrl":{"defaultValue":"/crud/templates/crud.html"},
    			"controller":{"defaultValue":"CrudController"},
    			};
    	// fields, instanceExternal, fieldNameExternal, title, serverConnection, selectCallback
    	this.listCrudJsonArray.push(new CrudJsonArray(this, fieldsRoute, "routes", "Rotas de URL AngularJs", this.serverConnection));
//        this.rufsItemService = new CrudItem(this.serverConnection, "requestService", "request", this.primaryKey, 'Serviços', null, list => onServicesChanged(list), (field, id) => onServiceSelected(field, id));
    }

}

export {UserController}
