import {CrudController} from "./CrudController.js";
import {CrudItemJson} from "./CrudItemJson.js";
import {CrudObjJson} from "./CrudObjJson.js";
import {CrudJsonArray} from "./CrudJsonArray.js";
import {CaseConvert} from "./CaseConvert.js";

class UserController extends CrudController {

    constructor(serverConnection, $scope) {
    	super(serverConnection, $scope);
        this.properties["password"].htmlType = "password";
//      debugger;
    	// Regras de acesso aos serviços
		const fieldsRoles = {
    			"get":{type:"boolean", "default":true},
    			"post":{type:"boolean", "default":false},
    			"patch":{type:"boolean", "default":false},
    			"put":{type:"boolean", "default":false},
    			"delete":{type:"boolean", "default":false}
    			};

    	const nameOptionsRoles = [];

    	for (let name in this.serverConnection.services) {
    		nameOptionsRoles.push(name);
    	}

    	this.listItemCrudJson.push(new CrudItemJson(this, fieldsRoles, "roles", "Controle de Acesso", this.serverConnection, nameOptionsRoles));
    	//
    	// Menu do usuário
//    	$routeProvider.when("/app/:name/:action", {templateUrl: "/crud/templates/crud.html", controller: "CrudController", controllerAs: "vm"});
    	const fieldsMenu = {
    			"menu":{"default":"action", "enum":["action","help","configuration","report","form"]},
    			"label":{},
    			"path":{"default":"service/action?filter={}&aggregate={}"}
    			};

    	this.listItemCrudJson.push(new CrudItemJson(this, fieldsMenu, "menu", "Menu", this.serverConnection));
    	// Configurações Json
/*
    	var fieldsConfig = {
    			"modules":{"default":"es6/CrudController.js"}
    			};

    	this.listObjCrudJson.push(new CrudObjJson(this, fieldsConfig, this.instance, "config", "Configurações", this.serverConnection));
*/
    	const fieldsRoute = {
    			"path":{"primaryKey":true, "default":"/app/xxx/:action"},
    			"templateUrl":{"default":"./templates/crud.html"},
    			"controller":{"default":"CrudController"},
    			};
    	// fields, instanceExternal, fieldNameExternal, title, serverConnection, selectCallback
    	this.listCrudJsonArray.push(new CrudJsonArray(this, fieldsRoute, "routes", "Rotas de URL AngularJs", this.serverConnection));
//        this.rufsItemService = new CrudItem(this.serverConnection, "requestService", "request", this.primaryKey, 'Serviços', null, list => onServicesChanged(list), (field, id) => onServiceSelected(field, id));
    }

    update() {
        const addMenu = (serviceName, menu) => {
            /*
path: 'request/search',
menu: '{"import":{"menu":"actions","label":"Importar","path":"request/import?overwrite.type=1&overwrite.state=10"},"buy":{"menu":"actions","label":"Compra","path":"request/new?overwrite={\"type\":1,\"state\":10}"},"sale":{"menu":"actions","label":"Venda","path":"request/new?overwrite={\"type\":2,\"state\":10}"},"requestPayment":{"menu":"form","label":"Financeiro","path":"request_payment/search"},"stock":{"menu":"form","label":"Estoque","path":"stock/search"},"product":{"menu":"form","label":"Produtos","path":"product/search"},"person":{"menu":"form","label":"Clientes e Fornecedores","path":"person/search"},"requests":{"menu":"form","label":"Requisições","path":"request/search"},"account":{"menu":"form","label":"Contas","path":"account/search"}}',
routes : '[{"path":"/app/request/:action","controller":"RequestController"}]'
            */
            if (menu[serviceName] == undefined) {
                menu[serviceName] = {"menu": "services", "label": serviceName, "path": `${CaseConvert.camelToUnderscore(serviceName)}/search`};
            }
        }

        const oldRoles = this.original.roles != undefined ? JSON.parse(this.original.roles) : {};
        const newRoles = this.instance.roles != undefined ? JSON.parse(this.instance.roles) : {};
        const menu = this.instance.menu != undefined ? JSON.parse(this.instance.menu) : {};

        for (let serviceName in newRoles) {
            if (oldRoles[serviceName] == undefined) {
                if (this.instance.path == undefined) {
                    this.instance.path = `${CaseConvert.camelToUnderscore(serviceName)}/search`;
                }

                const listDependencies = this.serverConnection.getDependencies(serviceName);

                for (let dependency of listDependencies) {
                    if (newRoles[dependency] == undefined) {
                        newRoles[dependency] = {};
                    }
                }

                addMenu(serviceName, menu);
            }
        }

        this.instance.roles = JSON.stringify(newRoles);
        this.instance.menu = JSON.stringify(menu);
        return super.update();
    }

}

export {UserController}
