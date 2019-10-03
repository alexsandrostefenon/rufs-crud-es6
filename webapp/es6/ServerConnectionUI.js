import {HttpRestRequest, RufsService, ServerConnection} from "/es6/ServerConnection.js";
import {CrudController} from "./CrudController.js";

class CrudServiceUI extends RufsService {

	constructor(serverConnection, params, httpRest) {
		super(serverConnection, params, httpRest);
		this.label = (params.title == undefined || params.title == null) ? serverConnection.convertCaseAnyToLabel(this.path) : params.title;
		this.listStr = [];
	}
	// private
    buildItemStr(item) {
		let stringBuffer = [];
		let str = "";
		for (let fieldName of this.shortDescriptionList) this.buildField(stringBuffer, fieldName, item);
		if (stringBuffer.length > 0) str = stringBuffer.join(" - ");
		return str;
    }

    buildListStr(list) {
		console.time("buildListStr : " + this.label);
    	var ret = [];

    	for (var i = 0; i < list.length; i++) {
    		var item = list[i];
    		var str = this.buildItemStr(item);
    		ret.push(str);
    	}

		console.timeEnd("buildListStr : " + this.label);
    	return ret;
    }
	// private, params.data, params.oldPos, params.newPos
	updateListStr(params) {
		if (params == null) {
			console.error("CrudServiceUI.updateListStr : received null parameter");
			return null;
		}

		let str = params.data == undefined ? null : this.buildItemStr(params.data);

        if (params.oldPos == undefined && params.newPos == undefined) {
        	// add
        	this.listStr.push(str);
        } else if (params.oldPos != undefined && params.newPos == undefined) {
        	// remove
        	this.listStr.splice(params.oldPos, 1);
        } else if (params.newPos == params.oldPos) {
        	// replace
        	this.listStr[params.newPos] = str;
        } else if (params.oldPos != undefined && params.newPos != undefined) {
        	// remove and add
        	this.listStr.splice(params.oldPos, 1);
        	this.listStr.splice(params.newPos, 0, str);
        }
        
        return params;
	}
	// used by websocket
	removeInternal(primaryKey) {
		console.log("CrudServiceUI.removeInternal : calling super...");
		let response = super.removeInternal(primaryKey);
		console.log("CrudServiceUI.removeInternal : ...super response = ", response);

		if (response != null) {
			console.log("CrudServiceUI.removeInternal : doing updateListStr :", this.listStr[response.oldPos]);
	        return this.updateListStr(response);
		} else {
			console.log("CrudServiceUI.removeInternal : alread removed, primaryKey = ", primaryKey);
			return null;
		}
	}
	// used by websocket
	getRemote(primaryKey) {
    	return super.getRemote(primaryKey).then(response => this.updateListStr(response));
	}

	save(itemSend) {
    	return super.save(itemSend).then(response => this.updateListStr(response));
	}

	update(primaryKey, itemSend) {
        return super.update(primaryKey, itemSend).then(response => this.updateListStr(response));
	}

	remove(primaryKey) {
        // data may be null
    	return super.remove(primaryKey);//.then(response => this.updateListStr(response));
	}

	queryRemote(params) {
    	return super.queryRemote(params).then(list => {
    		this.listStr = this.buildListStr(this.list);
            // também atualiza a lista de nomes de todos os serviços que dependem deste
			if (this.fields.oneToMany != undefined) {
				for (let item of this.fields.oneToMany.list) {
					let service = this.serverConnection.services[item.table];

					if (service != undefined) {
						console.log("[CrudServiceUI] queryRemote, update listStr from", service.label, service.list.length, "by", this.label, this.list.length);
						service.listStr = service.buildListStr(service.list);
					}
				}
			}

			return list;
    	});
	}

}

class ServerConnectionUI extends ServerConnection {

	static buildLocationHash(hashPath, primaryKey) {
//		TODO
		function objectToParams(object) {
			let isJsObject = p => typeof(p) == "object";

			function subObjectToParams(key, object) {
				if (object == undefined) return "";
				return Object.keys(object).map((childKey) => isJsObject(object[childKey]) ?
						subObjectToParams(`${key}.${encodeURIComponent(childKey)}`, object[childKey]) :
						`${key}.${encodeURIComponent(childKey)}=${encodeURIComponent(object[childKey])}`
				).join('&');
			}

			return Object.keys(object).map((key) => isJsObject(object[key]) ?
				subObjectToParams(encodeURIComponent(key), object[key]) :
				`${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`
			).join('&');
		}

		let hash = "#!/app/" + hashPath;

		if (primaryKey != undefined) {
//			let hashSearchObj = {primaryKey:JSON.stringify(primaryKey)};
			let hashSearchObj = objectToParams({primaryKey:primaryKey});
			let searchParams = new URLSearchParams(hashSearchObj);
			hash = hash + "?" + searchParams.toString();
		}
		
		return hash;
	}

	static changeLocationHash(hashPath, hashSearchObj) {
		const hash = ServerConnectionUI.buildLocationHash(hashPath, hashSearchObj);
		console.log(`ServerConnectionUI.changeLocationHash(${hashPath}, ${hashSearchObj}) : ${hash}`);
		window.location.assign(hash);
	}

	constructor($locale, $route, $rootScope, $q, $timeout, $controllerProvider, $routeProvider) {
		super();
    	this.localeId = $locale.id;
    	this.$route = $route;
    	this.$rootScope = $rootScope;
    	this.$q = $q;
    	this.$timeout = $timeout;
    	this.$controllerProvider = $controllerProvider;
    	this.$routeProvider = $routeProvider;
    	// força o browser a iniciar sempre da página de login
    	if (window.location.hash.indexOf("/login") < 0) {
			ServerConnectionUI.changeLocationHash("login");
    	}

		this.translation = {};
		this.translation.new = "New";
		this.translation.exit = "Exit";
		this.translation.clear = "Limpar";
		this.translation.saveAsNew = "Save as New";
		this.translation.view = "View";
		this.translation.edit = "Edit";
		this.translation.delete = "Delete";
		this.translation.create = "Create";
		this.translation.search = "Search";
		this.translation.cancel = "Cancel";
		this.translation.save = "Save";
		this.translation.filter = "Filter";
	}
    // private <- login
	loginDone() {
        this.menu = {user:[{path:"login", label:"Exit"}]};
        // user menu
		if (this.user.menu != undefined && this.user.menu.length > 0) {
			console.log("user.menu :", this.user.menu);
			const menus = JSON.parse(this.user.menu);

			for (var menuId in menus) {
				let menuItem = menus[menuId];
				let menuName = menuItem.menu;

				if (this.menu[menuName] == undefined) {
					this.menu[menuName] = [];
				}

				this.menu[menuName].unshift(menuItem);
			}
		}
		// system menu
		if (this.user.showSystemMenu == true) {
			for (let serviceName in this.services) {
				let service = this.services[serviceName];
	    		let menuName = service.params.menu || "Services";

	    		if (menuName.length > 0) {
	    			if (this.menu[menuName] == undefined) {
	    				this.menu[menuName] = [];
	    			}

	    			let menuItem = {path: service.path + "/search", label: service.label};
	    			this.menu[menuName].unshift(menuItem);
	    		}
			}
		}
    	// tradução
		if (this.services.rufsTranslation != undefined) {
	    	for (var fieldName in this.translation) {
	    		const str = this.translation[fieldName];
		    	const item = this.services.rufsTranslation.findOne({name:str,locale:this.localeId});

	    		if (item != null && item.translation != undefined) {
	        		this.translation[fieldName] = item.translation;
	    		}
	    	}
		}
        // routes and modules
//		var config = JSON.parse(this.user.config);
		const promises = [];
		this.$routeProvider.when('/app/login',{templateUrl:'crud/templates/login.html', controller:'LoginController', controllerAs: "vm"});

		if (this.user.routes != undefined && this.user.routes != null) {
			let routes = [];

			if (Array.isArray(this.user.routes) == true) {
				routes = this.user.routes;
			} else if (typeof this.user.routes === 'string' || this.user.routes instanceof String) {
				try {
					routes = JSON.parse(this.user.routes);
				} catch (e) {
					console.error("fail to parse json from string this.user.routes : ", this.user.routes, "err : ", e);
				}
			} else {
				console.err("invalid routes");
			}

			for (let route of routes) {
				if (route.templateUrl == undefined || route.templateUrl.length == 0) {
					route.templateUrl = "crud/templates/crud.html";
				}
				
				let path = route.controller.startsWith("/") ? "" : "./";

				let promise = import(path + route.controller + ".js").then(module => {
					const controllerName = route.controller.substring(route.controller.lastIndexOf("/")+1);
					console.log("loaded:", controllerName, "route:", route);

					this.$controllerProvider.register(controllerName, function(ServerConnectionService, $scope) {
						const _class = module[controllerName];
						return new _class(ServerConnectionService, $scope);
					});

					this.$routeProvider.when(route.path, {"templateUrl":route.templateUrl, "controller": controllerName, controllerAs: "vm"});
				});
				
				promises.push(promise);
			}
		}

		return Promise.all(promises).then(() => {
			console.log("Promise.all:", promises);
			this.$routeProvider.when("/app/:name/:action", {templateUrl: "crud/templates/crud.html", controller: "CrudController", controllerAs: "vm"});
			this.$routeProvider.otherwise({redirectTo: '/app/login'});

	        if (this.user.path != undefined && this.user.path != null && this.user.path.length > 0) {
	        	this.$route.reload();
	        	ServerConnectionUI.changeLocationHash(this.user.path);
	        }
		});
    }
    // public
    login(server, path, user, password, RufsServiceClass, callbackPartial, dbUri) {
    	if (server == null || server.length == 0) {
    		server = window.location.origin;
    	}

    	if (path == null || path.length == 0) {
    		path = window.location.pathname;
    	}

        return super.login(server, path, user, password, RufsServiceClass, callbackPartial, dbUri).then(loginResponse => this.loginDone());
    }

    logout() {
    	super.logout();
        this.menu = {};
		ServerConnectionUI.changeLocationHash("login", {"server":this.url});
    }

	convertCaseAnyToLabel(str) {
		if (str == undefined) {
			console.error(`ServerConnectionUI.convertCaseAnyToLabel(${str})`);
			return "";
		}

		var ret = "";
		var nextIsUpper = true;

		for (var i = 0; i < str.length; i++) {
			var ch = str[i];

			if (nextIsUpper == true) {
				ret = ret + ch.toUpperCase();
				nextIsUpper = false;
			} else if (ch >= 'A' && ch <= 'Z') {
				ret = ret + ' ' + ch;
			} else if (ch == '-' || ch == '_') {
				ret = ret + ' ';
				nextIsUpper = true;
			} else {
				ret = ret + ch;
			}
		}

		if (this.services.rufsTranslation != undefined) {
	    	var item = this.services.rufsTranslation.findOne({name:str,locale:this.localeId});

	    	if (item != null && item.translation != null && item.translation != undefined) {
	    		ret = item.translation;
	    	}
		}

		return ret;
	}

}

export {CrudServiceUI, ServerConnectionUI}
