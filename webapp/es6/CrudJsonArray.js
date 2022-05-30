import {OpenApi} from "./OpenApi.js";
import {Filter} from "./DataStore.js";
import {ServerConnection} from "./ServerConnection.js";
import {CrudUiSkeleton} from "./CrudUiSkeleton.js";

class CrudJsonArray extends CrudUiSkeleton {

	constructor(parent, fieldNameExternal, schema, options, serverConnection, selectCallback) {
		const field = parent.properties[fieldNameExternal];

		if ((schema.primaryKeys == undefined || schema.primaryKeys.length == 0) && field.$ref != undefined) {
			const schemaRef = OpenApi.getSchemaFromSchemas(serverConnection.openapi, field.$ref);
			if (schemaRef != undefined) schema.primaryKeys = schemaRef.primaryKeys;
		}

		super(serverConnection, fieldNameExternal, schema, selectCallback);
		this.parent = parent;
		this.fieldNameExternal = fieldNameExternal;
		this.title = options.title || field.title || this.serverConnection.convertCaseAnyToLabel(this.fieldNameExternal);
		this.action = options.action || "edit";
		this.convertString = field.type == "string";
		this.list = [];
	}

	get(parentInstance) {
		const data = parentInstance[this.fieldNameExternal];
		this.list = [];

		if (data != undefined) {
			if (Array.isArray(data)) {
				this.list = data;
			} else if ((typeof data === 'string' || data instanceof String) && data.length > 0) {
				this.list = JSON.parse(data);
			}
		}
		
		return this.process(this.action);
	}
	// private, use in addItem, updateItem and removeItem
	updateParent() {
		if (this.convertString == true) {
			this.parent.instance[this.fieldNameExternal] = JSON.stringify(this.list);
		} else {
			this.parent.instance[this.fieldNameExternal] = this.list;
		}

		if (this.action != "edit") return this.paginate();
		return this.parent.update().
		then(() => this.clear()).
		then(() => this.setPage()).
		then(() => this.serverConnection.$scope.$apply())
	}

	save() {
		// já verifica se é um item novo ou um update
		const obj = OpenApi.copyFields(this, this.instance);
		const primaryKey = this.getPrimaryKey(obj);

		if (primaryKey != undefined && Object.keys(primaryKey).length > 0) {
			if (Filter.findOne(this.list, primaryKey, index => this.list[index] = obj) == null) {
				this.list.push(obj);
			}
		} else {
			this.list.push(obj);
		}

		return this.updateParent();
	}

	remove(index) {
		this.list.splice(index, 1);
		return this.updateParent();
	}

	edit(index) {
		this.clear().then(() => {
			var item = this.list[index];
			return this.setValues(item, false, false);
		});
	}

	moveUp(index) {
		if (index > 0) {
			var tmp = this.list[index-1];
			this.list[index-1] = this.list[index];
			this.list[index] = tmp;
		}

		return this.updateParent();
	}

	moveDown(index) {
		if (index < (this.list.length-1)) {
			var tmp = this.list[index+1];
			this.list[index+1] = this.list[index];
			this.list[index] = tmp;
		}

		return this.updateParent();
	}

	buildFieldStr(fieldName, item) {
		let ret = super.buildFieldStr(fieldName, item);

		if (ret == "") {
			ret = super.buildFieldStr(fieldName, item);
		}

		return ret;
	}

}

CrudUiSkeleton.CrudJsonArray = CrudJsonArray;

export {CrudJsonArray}
