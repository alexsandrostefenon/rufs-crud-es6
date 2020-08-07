import {CrudUiSkeleton} from "./CrudUiSkeleton.js";

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

		this.buildFieldFilterResults();
	}

	save() {
		if (this.fieldNameExternal != undefined && this.fieldNameExternal != null && this.fieldNameExternal.length > 0) {
			this.instanceExternal[this.fieldNameExternal] = JSON.stringify(this.instance);
		}
	}

	get(data) {
		return this.process().then(() => this.setValues(data));
	}

}

export {CrudObjJson}
