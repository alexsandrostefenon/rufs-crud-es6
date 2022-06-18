import { OpenApi } from "./OpenApi.js";
import { CrudController } from "./CrudController.js";
import { CrudItemJson } from "./CrudItemJson.js";
import { CrudJsonArray } from "./CrudJsonArray.js";
import { CaseConvert } from "./CaseConvert.js";
import { HttpRestRequest } from "./ServerConnection.js";

class UserController extends CrudController {

	constructor(serverConnection, $scope) {
		super(serverConnection, $scope);
		this.properties["password"].htmlType = "password";

		const schemaRole = {
			primaryKeys: ["path"],
			properties: {
				"path": {
					type: "string",
					enum: Object.keys(this.serverConnection.openapi.paths)
				},
				"mask": {
					type: "integer",
					"default": 0x01
				},
				"get": {
					type: "boolean",
					"default": true
				},
				"post": {
					type: "boolean",
					"default": false
				},
				"patch": {
					type: "boolean",
					"default": false
				},
				"put": {
					type: "boolean",
					"default": false
				},
				"delete": {
					type: "boolean",
					"default": false
				}
			}
		}

		this.crudJsonArrayRoles = new CrudJsonArray(this, "roles", schemaRole, {"title": "Controle de Acesso"}, this.serverConnection)
		this.listCrudJsonArray.push(this.crudJsonArrayRoles);
		//    	routeProvider.when("/app/:name/:action", {templateUrl: "/crud/templates/crud.html", controller: "CrudController", controllerAs: "vm"});
		const fieldsMenu = {
			"menu": {
				"default": "action"
			},
			"label": {},
			"path": {
				"default": "service/action?filter={}&aggregate={}"
			}
		};

		this.listItemCrudJson.push(new CrudItemJson(this, fieldsMenu, "menu", "Menu", this.serverConnection));
		// Configurações Json
		const fieldsRoute = {
			"path": {
				"primaryKey": true,
				"default": "/app/xxx/:action"
			},
			"templateUrl": {
				"default": "./templates/crud.html"
			},
			"controller": {
				"default": "CrudController"
			},
		};
		this.listCrudJsonArray.push(new CrudJsonArray(this, "routes", {
			"properties": fieldsRoute
		}, {
			"title": "Rotas de URL AngularJs"
		}, this.serverConnection));
		this.rufsService.params.saveAndExit = false;
	}

	get(primaryKey) {
		const genRolesFromMask = roles => {
			for (const role of roles) {
				role["_name"] = role.path.substring(1)
				
				for (let i = 0; i < OpenApi.methods.length; i++) {
					if ((role.mask & (1 << i)) != 0) {
						role[OpenApi.methods[i]] = true
					} else {
						role[OpenApi.methods[i]] = false
					}
				}
			}
		}

		return super.get(primaryKey).then(response => {
			if (response.data.roles == null) {
				response.data.roles = [];
			}

			genRolesFromMask(response.data.roles)
			this.crudJsonArrayRoles.get(this.instance).then(() => {
				this.crudJsonArrayRoles.paginate({pageSize: 1000})
				this.serverConnection.$scope.$apply();
				return response
			})
		})
	}

	save() {
		this.instance.password = HttpRestRequest.MD5(this.instance.password);
		return super.save();
	}

	update() {
		this.instance.menu = this.instance.menu || {};

		for (let role of this.instance.roles) {
			role.mask = 0x00

			for (let i = 0; i < OpenApi.methods.length; i++) {
				if (role[OpenApi.methods[i]] == true) {
					role.mask |= (1 << i)
				}
			}

			const oldRole = this.original.roles.find(item => item.path == role.path)

			if (oldRole == undefined) {
				if (this.instance.path == undefined) {
					this.instance.path = `${role.path}/search`;
				}

				const serviceName = CaseConvert.underscoreToCamel(role.path, false)
				const listDependencies = this.serverConnection.getDependencies(serviceName);

				for (let dependency of listDependencies) {
					if (this.instance.roles.find(item => item.path == dependency) == undefined) {
						this.instance.roles.push({
							path: dependency,
							mask: 0x01
						})
					}
				}

				if (this.instance.menu[serviceName] == null) {
					this.instance.menu[serviceName] = {
						"menu": "services",
						"label": serviceName,
						"path": `${role.path}/search`
					};
				}
			}
		}

		if (this.instance.password != null && this.instance.password.length < 32)
			this.instance.password = HttpRestRequest.MD5(this.instance.password);
		return super.update();
	}

}

export { UserController }
