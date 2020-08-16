import {Filter} from "./DataStore.js";
import {Utils} from "./Utils.js";
import {CaseConvert} from "./CaseConvert.js";
import {CrudUiSkeleton} from "./CrudUiSkeleton.js";

class CrudItemJson extends CrudUiSkeleton {

	constructor(parent, properties, fieldNameExternal, title, serverConnection, nameOptions) {
		let _fields = {};
		_fields._name = {};
		_fields._name.type = "string";
		
		if (nameOptions != undefined) {
			_fields._name.enum = nameOptions;
		}
		
		for (let fieldName in properties) _fields[fieldName] = properties[fieldName];
		super(serverConnection, fieldNameExternal, {"properties": _fields});
		this.primaryKeys = ["_name"];
		this.parent = parent;
		this.fieldNameExternal = fieldNameExternal;
		this.title = title;
		this.nameOptions = nameOptions;
		this.buildFieldFilterResults();
	}

	get(parentInstance) {
		var objItemsStr = parentInstance[this.fieldNameExternal];

		if (objItemsStr != undefined && objItemsStr.length > 0) {
			var objItems = JSON.parse(objItemsStr);
			this.list = [];

			for (var itemName in objItems) {
				var objItem = objItems[itemName];
				var item = {};

				for (var fieldName in this.properties) {
					var field = this.properties[fieldName];
					item[fieldName] = objItem[fieldName];
				}

				item._name = itemName;
				this.list.push(item);
			}
		}
		
		this.restrictNameOptions();
		return this.process();
	}

	restrictNameOptions() {
		if (this.nameOptions != undefined) {
			this.properties._name.enum = [];
			for (let name of this.nameOptions) if (this.list.find(item => item._name == name) == undefined) this.properties._name.enum.push(name);
			this.buildFieldFilterResults();
		}
	}
	// private, use in addItem, updateItem and removeItem
	updateParent() {
		var objItems = {};

		for (let item of this.list) {
			let obj = Utils.clone(item, Object.keys(this.properties));
			delete obj._name;
			objItems[item._name] = obj;
		}

		this.parent.instance[this.fieldNameExternal] = JSON.stringify(objItems);
		this.restrictNameOptions();
		this.parent.rufsService.params.saveAndExit = false;
		return this.parent.update().then(res => this.get(res.data));
	}

	save() {
		this.instance._name =  CaseConvert.underscoreToCamel(this.instance._name);
		// já verifica se é um item novo ou um update
		var isNewItem = true;

		for (var i = 0; i < this.list.length; i++) {
			var item = this.list[i];

			if (item._name == this.instance._name) {
				this.list[i] = this.instance;
				isNewItem = false;
				break;
			}
		}

		if (isNewItem == true) {
			this.list.push(this.instance);
		}

		return this.updateParent();
	}

	remove(name) {
		const index = Filter.findPos(this.list, {"_name": name});
		this.list.splice(index, 1);
		this.updateParent();
	}

	edit(name) {
		return this.clear().then(() => {
			const index = Filter.findPos(this.list, {"_name": name});
			var item = this.list[index];

			if (this.nameOptions != undefined) {
				this.properties._name.enum.push(item._name);
				this.buildFieldFilterResults();
			}

			return this.setValues(item, false);
		});
	}

	moveUp(name) {
		const index = Filter.findPos(this.list, {"_name": name});

		if (index > 0) {
			var tmp = this.list[index-1];
			this.list[index-1] = this.list[index];
			this.list[index] = tmp;
		}

		this.updateParent();
	}

	moveDown(name) {
		const index = Filter.findPos(this.list, {"_name": name});

		if (index < (this.list.length-1)) {
			var tmp = this.list[index+1];
			this.list[index+1] = this.list[index];
			this.list[index] = tmp;
		}

		this.updateParent();
	}

}

export {CrudItemJson}
