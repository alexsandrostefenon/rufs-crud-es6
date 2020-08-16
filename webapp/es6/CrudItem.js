import {CrudCommom} from "./CrudCommom.js";
import {RufsSchema} from "./DataStore.js";

class CrudItem extends CrudCommom {

	constructor(serverConnection, serviceName, fieldName, primaryKeyForeign, title, numMaxItems, queryCallback, selectCallback) {
		console.log(`[CrudItem.constructor] : ${serviceName}, ${fieldName}, ${title}`, primaryKeyForeign);
    	super(serverConnection, serverConnection.services[serviceName], {}, 1);
		this.fieldName = fieldName;
		const field = this.properties[fieldName];
		this.title = (title != undefined && title != null) ? title : field.title;
		this.isClonable = field.isClonable == undefined ? false : field.isClonable;
		this.numMaxItems = (numMaxItems != undefined && numMaxItems != null) ? numMaxItems : 999;
		this.queryCallback = queryCallback;
		this.selectCallback = selectCallback;
		this.foreignKey = this.serverConnection.getForeignKey(this, this.fieldName, primaryKeyForeign);
		
		for (let [_fieldName, value] of Object.entries(this.foreignKey)) {
			this.properties[_fieldName].hiden = true;
			this.properties[_fieldName].tableVisible = false;
			this.properties[_fieldName].default = value;
		}

		this.query();
	}

	query() {
		return this.process("search", {filter: this.foreignKey}).then(() => {
			if (this.queryCallback != undefined && this.queryCallback != null) {
				this.queryCallback(this.filterResults);
			}

			this.serverConnection.$scope.$apply();
		});
	}

	clone(primaryKeyForeign) {
		this.foreignKey = this.serverConnection.getForeignKey(this, this.fieldName, primaryKeyForeign);

		if (this.isClonable == true) {
			let count = 0;

			for (var item of this.filterResults) {
				let newItem = angular.copy(item);
				
				for (let fieldName in this.foreignKey) {
					this.newItem[fieldName] = this.foreignKey[fieldName];
				}
				
				this.rufsService.save(newItem).then(response => {
					count++;

					if (count == this.filterResults.length) {
						this.query();
					}
				});
			}
		} else {
			this.query();
		}
	}

    validateFieldChange(fieldName, newValue, oldValue) {
    	let ret = super.validateFieldChange(fieldName, newValue, oldValue);

    	if (ret == true && this.selectCallback != undefined) {
    		if (newValue == undefined) 
    			newValue = this.instance[fieldName];
    		else
    			this.instance[fieldName] = newValue;

    		this.selectCallback(fieldName);
			// update UI
			this.setValues(this.instance, false);
    	}

    	return ret;
    }

	remove(primaryKey) {
        // data may be null
		return super.remove(primaryKey).then(data => this.query());
	}

	save() {
		return super.save().then(response => this.query()).then(() => {
			for (let fieldName in this.properties) {
				let field = this.properties[fieldName];
				
				if (field.hiden != true) {
					document.getElementById(this.formId + "-" + fieldName).focus();
					break;
				}
			}

			this.serverConnection.$scope.$apply();
		});
	}

	update() {
		return super.update().then(response => this.query());
	}
}

export {CrudItem}
