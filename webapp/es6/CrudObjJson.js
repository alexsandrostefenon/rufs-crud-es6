import {CrudUiSkeleton} from "./CrudUiSkeleton.js";

class CrudObjJson extends CrudUiSkeleton {

	constructor(parent, properties, fieldNameExternal, title, serverConnection) {
		super(serverConnection, fieldNameExternal, {"properties": properties}, selectCallback);
		this.parent = parent;
		this.fieldNameExternal = fieldNameExternal;
		this.title = title;

		for (var fieldName in this.properties) {
			var field = this.properties[fieldName];
			field._label = serverConnection.convertCaseAnyToLabel(fieldName);
		}

		var obj = JSON.parse(this.instanceExternal[this.fieldNameExternal]);

		for (var fieldName in obj) {
			this.instance[fieldName] = obj[fieldName];
		}
	}

	save() {
		this.instanceExternal[this.fieldNameExternal] = JSON.stringify(this.instance);
	}

}

export {CrudObjJson}
