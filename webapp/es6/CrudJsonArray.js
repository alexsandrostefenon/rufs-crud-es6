import {Filter} from "/es6/DataStore.js";
import {ServerConnection} from "/es6/ServerConnection.js";
import {CrudUiSkeleton} from "./CrudUiSkeleton.js";

class CrudJsonArray extends CrudUiSkeleton {

	constructor(parent, fields, fieldNameExternal, title, serverConnection, selectCallback) {
		super(serverConnection, fieldNameExternal, fields, selectCallback);
		this.parent = parent;
		this.fieldNameExternal = fieldNameExternal;
		this.title = title;
	}

	get(parentInstance) {
		var data = parentInstance[this.fieldNameExternal];

		if (Array.isArray(data) == true) {
			this.list = data;
		} else if (typeof data === 'string' || data instanceof String) {
			this.list = JSON.parse(data);
		}
		
		this.process();
	}
	// private, use in addItem, updateItem and removeItem
	updateParent() {
		if (this.parent.fields[this.fieldNameExternal].type == "string") {
			this.parent.instance[this.fieldNameExternal] = JSON.stringify(this.list);
		} else {
			this.parent.instance[this.fieldNameExternal] = this.list;
		}

		return this.parent.update();
	}

	save() {
		// já verifica se é um item novo ou um update
		const primaryKey = this.getPrimaryKey(this.instance);

		if (Filter.findOne(this.list, primaryKey, index => this.list[index] = this.instance) == null) {
			this.list.push(this.instance);
		}

		this.updateParent();
	}

	remove(index) {
		this.list.splice(index, 1);
		this.updateParent();
	}

	edit(index) {
		this.clear();
		var item = this.list[index];
		this.setValues(item);
	}

	moveUp(index) {
		if (index > 0) {
			var tmp = this.list[index-1];
			this.list[index-1] = this.list[index];
			this.list[index] = tmp;
		}

		this.updateParent();
	}

	moveDown(index) {
		if (index < (this.list.length-1)) {
			var tmp = this.list[index+1];
			this.list[index+1] = this.list[index];
			this.list[index] = tmp;
		}

		this.updateParent();
	}

}

export {CrudJsonArray}
