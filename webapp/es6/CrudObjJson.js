import {CrudUiSkeleton} from "./CrudUiSkeleton.js";
import {CrudJsonArray} from "./CrudJsonArray.js";

class CrudObjJson extends CrudUiSkeleton {

	constructor(parent, properties, fieldNameExternal, title, serverConnection, selectCallback) {
		super(serverConnection, fieldNameExternal, {"properties": properties}, selectCallback);
		this.parent = parent;
		this.fieldNameExternal = fieldNameExternal;
		this.title = title;

		for (var fieldName in this.properties) {
			var field = this.properties[fieldName];
			field._label = serverConnection.convertCaseAnyToLabel(fieldName);
		}

		if (this.fieldNameExternal != undefined && this.fieldNameExternal != null && this.fieldNameExternal.length > 0) {
			var obj = JSON.parse(this.instanceExternal[this.fieldNameExternal]);

			for (var fieldName in obj) {
				this.instance[fieldName] = obj[fieldName];
			}
		}

		for (let [fieldName, property] of Object.entries(properties)) {
			if (property.type == "array" && property.hiden != true) {
				// 	constructor(parent, properties, fieldNameExternal, title, serverConnection) {
				this.listCrudJsonArray.push(new CrudJsonArray(this, property.items.properties, fieldName, fieldName, this.serverConnection));
			}
		}

		this.buildFieldFilterResults();
	}

	save() {
		if (this.fieldNameExternal != undefined && this.fieldNameExternal != null && this.fieldNameExternal.length > 0) {
			this.instanceExternal[this.fieldNameExternal] = JSON.stringify(this.instance);
		}
	}

	get(data) {
		return this.process().
		then(() => {
			for (let crudJsonArray of this.listCrudJsonArray) crudJsonArray.get(data);
			return this.setValues(data, false);
		});
	}

}

export {CrudObjJson}
