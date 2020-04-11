import {Filter} from "/es6/DataStore.js";
import {Utils} from "/es6/Utils.js";
import {CaseConvert} from "/es6/CaseConvert.js";
import {CrudUiSkeleton} from "./CrudUiSkeleton.js";

class CrudItemJson extends CrudUiSkeleton {

	constructor(parent, fields, fieldNameExternal, title, serverConnection, nameOptions) {
		let _fields = {};
		_fields._name = {};
		_fields._name.type = "s";
		_fields._name.primaryKey = true;
		
		if (nameOptions != undefined) {
			_fields._name.options = nameOptions;
		}
		
		for (let fieldName in fields) _fields[fieldName] = fields[fieldName];
		super(serverConnection, fieldNameExternal, _fields);
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

			for (var itemName in objItems) {
				var objItem = objItems[itemName];
				var item = {};

				for (var fieldName in this.fields) {
					var field = this.fields[fieldName];
					item[fieldName] = objItem[fieldName];
				}

				item._name = itemName;
				this.list.push(item);
			}
		}
		
		this.restrictNameOptions();
		this.process();
	}

	restrictNameOptions() {
		if (this.nameOptions != undefined) {
			this.fields._name.options = [];
			for (let name of this.nameOptions) if (this.list.find(item => item._name == name) == undefined) this.fields._name.options.push(name);
			this.buildFieldFilterResults();
		}
	}
	// private, use in addItem, updateItem and removeItem
	updateParent() {
		var objItems = {};

		for (let item of this.list) {
			let obj = Utils.clone(item, Object.keys(this.fields));
			delete obj._name;
			objItems[item._name] = obj;
		}

		this.parent.instance[this.fieldNameExternal] = JSON.stringify(objItems);
		this.restrictNameOptions();
		this.parent.rufsService.params.saveAndExit = false;
		return this.parent.update().then(parentInstance => this.get(parentInstance));
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
		this.clear();
		const index = Filter.findPos(this.list, {"_name": name});
		var item = this.list[index];

		if (this.nameOptions != undefined) {
			this.fields._name.options.push(item._name);
			this.buildFieldFilterResults();
		}

		this.setValues(item);
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
