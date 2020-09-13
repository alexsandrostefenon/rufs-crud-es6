import {OpenApi} from "./OpenApi.js";
import {Utils} from "./Utils.js";
import {DataStoreItem, Filter} from "./DataStore.js";
import {ServerConnectionUI} from "./ServerConnectionUI.js";

// differ of DataStoreItem by UI features, serverConnection and field.$ref dependencies
class CrudUiSkeleton extends DataStoreItem {

	static calcPageSize() {
		let pageSize;
		let avaiableHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		const style = window.getComputedStyle(document.getElementById("header"));
		avaiableHeight -= parseFloat(style.height);
		const rowHeight = parseFloat(style.fontSize) * 2.642857143;
    	pageSize = Math.trunc(avaiableHeight / rowHeight);
    	pageSize -= 4;
    	return pageSize;
	}

	updateFields() {
		// type: "i", service: "serviceName", default: null, hiden: false, required: false, flags: ["a", "b"], readOnly: false
		for (let fieldName in this.properties) {
			let field = this.properties[fieldName];
			field.filter = {};
			field.htmlType = "text";
			field.htmlStep = "any";

			if (field.type == "boolean") {
				field.htmlType = "checkbox";
			} else if (field.type == "integer") {
				field.htmlType = "number";
				field.htmlStep = "1";
			} else if (field.type == "number") {
				field.htmlType = "number";
				
				if (field.precision == 1) {
					field.htmlStep = "0.1";
				} else if (field.precision == 2) {
					field.htmlStep = "0.01";
				} else {
					field.htmlStep = "0.001";
				}
			} else if (field.type == "date") {
				field.htmlType = "date";
			} else if (field.type == "time") {
				field.htmlType = "time";
			} else if (field.type == "date-time") {
				field.htmlType = "datetime-local";
			}

			if (field.enum == undefined && field.enumLabels == undefined && field.type == "string" && field.maxLength == 1 && (field.default == "S" || field.default == "N")) {
				field.filterResults = field.enum = ["S", "N"];
				field.filterResultsStr = field.enumLabels = ["Sim", "Não"];
			}

			if (field.htmlType == "number" || field.htmlType.includes("date") || field.htmlType.includes("time")) {
				field.htmlTypeIsRangeable = true;
			} else {
				field.htmlTypeIsRangeable = false;
			}
			
			if (field.label == undefined) {
				if (field.description != undefined && field.description.length <= 30) {
					field.label = field.description;
				} else {
					let label = this.serverConnection.convertCaseAnyToLabel(fieldName);
					field.label = label;
				}
			}

			if (field.flags != undefined) {
				field.flags = field.flags.split(",");
				field.htmlTypeIsRangeable = false;
			}

			if (field.enum != undefined) {
				if (Array.isArray(field.enum) == false) field.enum = field.enum.split(",");
				field.htmlTypeIsRangeable = false;
			}

			if (field.enumLabels != undefined) {
				if (Array.isArray(field.enumLabels) == false) field.enumLabels = field.enumLabels.split(",");
				field.htmlTypeIsRangeable = false;
			}
			
			if (field.$ref != undefined) {
				field.htmlTypeIsRangeable = false;
			}
		}
	}

	constructor(serverConnection, name, schema, selectCallback) {
		super(name, schema);
		this.serverConnection = serverConnection;
		this.translation = serverConnection.translation;
		this.formId = name + "Form";
		this.selectCallback = selectCallback;
		this.listItemCrud = [];
		this.listItemCrudJson = [];
		this.listCrudObjJson = [];
		this.listCrudJsonArray = [];
		this.listCrudObjJsonResponse = [];
		this.updateFields();
	}

	buildFieldFilterResults() {
		// faz uma referencia local a field.filterResultsStr, para permitir opção filtrada, sem alterar a referencia global
		for (let [fieldName, field] of Object.entries(this.properties)) {
			if (field.$ref != undefined) {
				const rufsService = this.serverConnection.getForeignService(this, fieldName);

				if (rufsService != undefined) {
					let fieldFilter = Object.entries(field.filter);

					if (fieldFilter.length > 0) {
						field.filterResults = [];
						field.filterResultsStr = [];
						
						for (let i = 0; i < rufsService.list.length; i++) {
							let candidate = rufsService.list[i];

							if (Filter.matchObject(field.filter, candidate, (a,b,fieldName) => a == b, false)) {
								field.filterResults.push(candidate);
								const str = rufsService.listStr[i];

								if (field.filterResultsStr.indexOf(str) < 0)
									field.filterResultsStr.push(str);
								else
									console.error(`[${this.constructor.name}.buildFieldFilterResults(${this.name})] : already exists string in filterResultsStr :`, str);
							}
						}
					} else {
						field.filterResults = rufsService.list;
						field.filterResultsStr = rufsService.listStr;
					}
				} else {
					console.warn("don't have acess to service ", field.$ref);
					field.filterResults = [];
					field.filterResultsStr = [];
				}
			} else if (field.enum != undefined) {
				field.filterResults = field.enum;
				
				if (field.enumLabels != undefined) {
					field.filterResultsStr = field.enumLabels;
				} else {
					field.filterResultsStr = field.enum;
				}
			}
			
			if (field.htmlType.includes("date")) {
				field.filterRangeOptions = [
					" hora corrente ", " hora anterior ", " uma hora ",
					" dia corrente ", " dia anterior ", " um dia ",
					" semana corrente ", " semana anterior ", " uma semana ", 
					" quinzena corrente ", " quinzena anterior ", " uma quinzena ",
					" mês corrente ", " mês anterior ", " um mês ",
					" ano corrente ", " ano anterior ", " um ano "
				];
				
				field.aggregateRangeOptions = ["", "hora", "dia", "mês", "ano"];
			}
		}
	}

	process(action, params) {
		for (let [fieldName, property] of Object.entries(this.properties)) {
			if (property.type == "object" && property.hiden != true) {
				const list = OpenApi.getDependenciesSchemas(this.openapi, {properties: property.properties});

				if (list.length == 1) {
					// 	constructor(parent, properties, fieldNameExternal, title, serverConnection) {
					this.listItemCrudJson.push(new CrudUiSkeleton.CrudItemJson(this, property.properties, fieldName, property.title, this.serverConnection));
				} else {
					// 	constructor(parent, properties, fieldNameExternal, title, serverConnection) {
					this.listCrudObjJson.push(new CrudUiSkeleton.CrudObjJson(this, property.properties, fieldName, property.title, this.serverConnection));
				}
			} else if (property.type == "array" && property.hiden != true) {
				// 	constructor(parent, properties, fieldNameExternal, title, serverConnection) {
				this.listCrudJsonArray.push(new CrudUiSkeleton.CrudJsonArray(this, property.items.properties, fieldName, {"action": action}, this.serverConnection));
			}
		}

		for (let [fieldName, field] of Object.entries(this.properties)) field.filter = {};
		this.buildFieldFilterResults();
		return super.process(action, params).then(res => {
			this.serverConnection.$scope.$apply();
			return res;
		});
	}
	// fieldName, 'view', item, false
    goToField(fieldName, action, obj) {
//    	console.log(`[${this.constructor.name}.goToField(${fieldName}, ${action})]`);
    	const field = this.properties[fieldName];
		if (field.$ref == undefined) return "";
		const item = OpenApi.getPrimaryKeyForeign(this.serverConnection.openapi, this, fieldName, obj, this.serverConnection.services);
		const service = this.serverConnection.getSchema(item.table);
		return ServerConnectionUI.buildLocationHash(service.path + "/" + action, {primaryKey: item.primaryKey});
    }

	setValues(obj, enableDefault) {
		return super.setValues(obj, enableDefault, this.serverConnection).
		then(() => {
			// fieldFirst is used in form_body html template
			this.fieldFirst = undefined;
			const list = Object.entries(this.properties);
			let filter = list.filter(([fieldName, field]) => field.hiden != true && field.readOnly != true && field.required == true && field.type != "object" && field.type != "array" && this.instance[fieldName] == undefined);
			if (filter.length == 0) filter = list.filter(([fieldName, field]) => field.hiden != true && field.readOnly != true && field.required == true && field.type != "object" && field.type != "array");
			if (filter.length == 0) filter = list.filter(([fieldName, field]) => field.hiden != true && field.readOnly != true && field.required == true);
			if (filter.length == 0) filter = list.filter(([fieldName, field]) => field.hiden != true && field.readOnly != true);
			if (filter.length == 0) filter = list.filter(([fieldName, field]) => field.hiden != true);
			if (filter.length > 0) this.fieldFirst = filter[0][0];
			// TODO : transferir para classe pai ou primeiro ancestral com referência aos this.list*Crud
			this.listItemCrudJson.forEach(item => item.get(this.instance));
			this.listCrudObjJson.forEach(item => item.get(this.instance));
			this.listCrudJsonArray.forEach(item => item.get(this.instance));
		}).
		then(() => {
			this.serverConnection.$scope.$apply();
		});
	}

	paginate(params) {
		if (params == undefined) params = {};
		if (params.pageSize == undefined) params.pageSize = CrudUiSkeleton.calcPageSize();
		if (params.pageSize < 10) params.pageSize = 10;
		return super.paginate(params).then(() => this.setPage(1));
	}

    setPage(page) {
    	this.pagination.setPage(page);

     	const next = (service, list, index) => {
     		if (index >= list.length) return Promise.resolve();
     		const item = list[index];
     		console.log(`[${this.constructor.name}.setPage(${this.name})] : updating references to register ${index}`, service.getPrimaryKey(item));
     		return this.serverConnection.getDocument(this.name, item, false).then(() => next(service, list, ++index));
     	}

		const service = this.serverConnection.getSchema(this.name);
		let promise;

    	if (service != undefined) {
			promise = next(service, this.pagination.listPage, 0).
			then(() => {
				this.serverConnection.$scope.$apply();
			});
    	} else {
    		promise = Promise.resolve();
    	}

    	return promise;
	}

    validateFieldChange(fieldName, newValue, oldValue) {
    	console.log(`[CrudUiSkeleton.validateFieldChange(fieldName=${fieldName}, newValue=${newValue}, oldValue=${oldValue})] this.instance[${fieldName}] = ${this.instance[fieldName]}`);
    	return true;
    }

	parseValue(fieldName, instance) {
		if (instance == undefined) instance = this.instance;
		const field = this.properties[fieldName];

		if (field.flags != undefined && field.flags != null) {
			// field.flags : String[], vm.instanceFlags[fieldName] : Boolean[]
			instance[fieldName] = Number.parseInt(Utils.flagsToStrAsciiHex(this.instanceFlags[fieldName]), 16);
		} else {
			let pos = field.filterResultsStr.indexOf(field.externalReferencesStr);
			
			if (pos >= 0) {
				const oldValue = instance[fieldName];
				let newValue;

				if (field.$ref != undefined) {
					const foreignData = field.filterResults[pos];
//					const foreignKey = OpenApi.getForeignKey(this.serverConnection.openapi, this, fieldName, foreignData, this.serverConnection.services);
					const foreignKey = this.serverConnection.getForeignKey(this, fieldName, foreignData);
					newValue = foreignKey[fieldName];
				} else if (field.enum != undefined) {
					newValue = field.filterResults[pos];
				}

				if (typeof newValue == "string")
					newValue = newValue.trimEnd();

				if (this.validateFieldChange(fieldName, newValue, oldValue) == true) {
					instance[fieldName] = newValue;
				}
			}
		}
	}

}

export {CrudUiSkeleton}
