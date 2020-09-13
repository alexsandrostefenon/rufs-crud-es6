import {Filter} from "./DataStore.js";
import {ServerConnection} from "./ServerConnection.js";
import {CrudUiSkeleton} from "./CrudUiSkeleton.js";

class CrudJsonArray extends CrudUiSkeleton {

	constructor(parent, properties, fieldNameExternal, options, serverConnection, selectCallback) {
		super(serverConnection, fieldNameExternal, {"properties": properties}, selectCallback);
		this.parent = parent;
		this.fieldNameExternal = fieldNameExternal;
		this.title = options.title || parent.properties[fieldNameExternal].title || fieldNameExternal;
		this.action = options.action || "edit";
		this.convertString = parent.properties[fieldNameExternal].type == "string";
		this.list = [];
	}

	get(parentInstance) {
		const data = parentInstance[this.fieldNameExternal];
		this.list = [];

		if (data != undefined) {
			if (Array.isArray(data)) {
				this.list = data;
			} else if (typeof data === 'string' || data instanceof String) {
				this.list = JSON.parse(data);
			}
		}
		
		return this.process();
	}
	// private, use in addItem, updateItem and removeItem
	updateParent() {
		if (this.convertString == true) {
			this.parent.instance[this.fieldNameExternal] = JSON.stringify(this.list);
		} else {
			this.parent.instance[this.fieldNameExternal] = this.list;
		}

		if (this.action != "edit") return Promise.resolve();
		return this.parent.update().then(() => this.serverConnection.$scope.$apply());
	}

	save() {
		// já verifica se é um item novo ou um update
		const primaryKey = this.getPrimaryKey(this.instance);

		if (Filter.findOne(this.list, primaryKey, index => this.list[index] = this.instance) == null) {
			this.list.push(this.instance);
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
			return this.setValues(item, false);
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

}

CrudUiSkeleton.CrudJsonArray = CrudJsonArray;

export {CrudJsonArray}
