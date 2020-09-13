import {OpenApi} from "./OpenApi.js";
import {CaseConvert} from "./CaseConvert.js";
import {RufsSchema} from "./DataStore.js";
import {HttpRestRequest} from "./ServerConnection.js";
import {CrudCommom} from "./CrudCommom.js";
import {CrudItem} from "./CrudItem.js";
import {CrudItemJson} from "./CrudItemJson.js";
import {CrudObjJson} from "./CrudObjJson.js";
import {CrudJsonArray} from "./CrudJsonArray.js";
import {ServerConnectionUI} from "./ServerConnectionUI.js";
// CrudController differ of CrudCommom by angular $scope dependency, used in $scope.apply() pos promise rendering
class CrudController extends CrudCommom {

    constructor(serverConnection, $scope) {
    	serverConnection.clearRemoteListeners();
    	serverConnection.$scope = $scope;
    	const url = new URL(window.location.hash.substring(2), window.location.href);
    	const path = url.pathname;
		const list = path.split('/');
		const action = list[list.length-1];
		const serviceName = CaseConvert.underscoreToCamel(list[list.length-2]);
		const service = serverConnection.services[serviceName];

		if (service == undefined) {
			const msg = `[CrudController.constructor(${serviceName})] : service not registred in serverConnection`;
			console.error(msg);
			throw new Error(msg);
		}

    	super(serverConnection, serverConnection.services[serviceName]);
    	this.searchParams = HttpRestRequest.urlSearchParamsToJson(url.search, this.properties);
    	this.process(action, this.searchParams);
    }

	process(action, params) {
		return super.process(action, params).then(res => {
			this.serverConnection.$scope.$apply();
			return res;
		});
	}

    clickFilter() {
		this.searchParams.filter = this.instanceFilter; 
		this.searchParams.filterRangeMin = this.instanceFilterRangeMin; 
		this.searchParams.filterRangeMax = this.instanceFilterRangeMax; 
		ServerConnectionUI.changeLocationHash(this.rufsService.path + "/" + "search", this.searchParams);
    }

	onNotify(schemaName, primaryKey, action) {
		let ret = super.onNotify(schemaName, primaryKey, action);
//   		this.$scope.$apply();
		return ret;
	}

    get(primaryKey) {
    	return super.get(primaryKey).then(response => {
			// monta a lista dos CrudItem
    		const dependents = this.serverConnection.getDependents(this.rufsService.name);

			for (let item of dependents) {
				const rufsServiceOther = this.serverConnection.services[item.table];

				if (rufsServiceOther != undefined) {
					let field = rufsServiceOther.properties[item.field];

					if (field != undefined) {
//						console.log(`[crudController.get] : checking CrudItem for ${item.field} to table ${item.table}`, this.rufsService.properties);
						if (field.title != undefined)
							this.listItemCrud.push(new CrudItem(this.serverConnection, item.table, item.field, this.primaryKey));
					} else {
						console.error(`[crudController.get] : invalid CrudItem configuration for table ${this.rufsService.name} : wrong field ${item.field} to table ${item.table}`, this.rufsService.properties);
					}
				} else {
					console.error(`[crudController.get] : unknow service ${item.table}, knowed services :`, this.serverConnection);
				}
			}

			this.serverConnection.$scope.$apply();
    		return response;
    	});
    }
	
	remove(primaryKey) {
		return super.remove(primaryKey).then(data => {
            // data may be null
			this.goToSearch();
			return data;
		});
	}

	update() {
		return super.update().then(response => {
			var primaryKey = this.rufsService.getPrimaryKey(response.data);
			// TODO : load saveAndExit from method process(action,params)
			if (this.rufsService.params.saveAndExit != false) {
				this.goToSearch();
			} else {
				ServerConnectionUI.changeLocationHash(this.rufsService.path + "/" + "edit", {primaryKey});
			}
			
			return response;
		});
	}

	save() {
		return super.save().then(response => {
			var primaryKey = this.rufsService.getPrimaryKey(response.data);

			if (primaryKey != undefined && primaryKey != null && Object.entries(primaryKey).length > 0) {
				for (let item of this.listItemCrud) {
					item.clone(primaryKey);
				}
				// TODO : load saveAndExit from method process(action,params)
				if (this.rufsService.params.saveAndExit != false) {
					this.goToSearch();
				} else {
					ServerConnectionUI.changeLocationHash(this.rufsService.path + "/" + "edit", {primaryKey});
				}
			} else {
				const schema = OpenApi.getSchemaFromSchemas(this.serverConnection.openapi, this.rufsService.name);
				const crudObjJson = new CrudObjJson(this, schema.properties, "", `Resposta ${this.listCrudObjJsonResponse.length + 1}`, this.serverConnection);
				crudObjJson.get(response.data);
		    	this.listCrudObjJsonResponse.unshift(crudObjJson);
			}

			return response;
		});
	}
	
	saveAsNew() {
		if (this.instance.id != undefined) {
			this.instance.id = undefined;
		}
		
		return this.save();
	}

	toggleFullscreen() {
	  let elem = document.documentElement;

	  if (!document.fullscreenElement) {
	    elem.requestFullscreen().then({}).catch(err => {
	      alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
	    });
	  } else {
	    //document.exitFullscreen();
	  }
	}

}

export {CrudController}
