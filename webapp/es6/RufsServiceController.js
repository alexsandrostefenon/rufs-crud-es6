import {CaseConvert} from "/es6/CaseConvert.js";
import {CrudController} from "./CrudController.js";
import {CrudItemJson} from "./CrudItemJson.js";

class RufsServiceController extends CrudController {

    constructor(serverConnection, $scope) {
    	super(serverConnection, $scope);
//		const defaultValues = {type: "s", updatable: true, length: 255, precision: 9, scale: 3, hiden: false, primaryKey: false, required: false};
    	this.rufsServicefields = {
    			"type":{"options": ["s", "i", "b", "n", "datetime-local", "date", "time"]},
    			"defaultValue":{},
    			"options": {},
    			"optionsLabels": {},
    			"sortType":{"options": ["asc", "desc"]},
    			"orderIndex":{"type": "i"},
    			"tableVisible":{"type": "b"},
    			"required":{"type": "b"},
    			"length":{"type": "i"},
    			"precision":{"type": "i"},
    			"scale":{"type": "i"},
    			"primaryKey":{"type": "b"},
    			"identityGeneration":{"options": ["ALWAYS", "BY DEFAULT"]},
    			"foreignKeysImport":{}, // [table, field]
    			"shortDescription":{"type": "b"},
    			"comment":{},
    			"title":{},
    			"isClonable":{"type": "b"},
    			"unique":{},
    			"updatable":{"type": "b"},
    			"hiden":{"type": "b"},
    			"readOnly":{"type": "b"},
    			};

    	this.rufsServicefields.foreignKeysImport.options = [];
    	this.rufsServicefields.foreignKeysImport.optionsLabels = [];
    	
    	for (let service of this.rufsService.list) {
    		for (let [field, fieldObj] of Object.entries(service.fields)) {
    			if (fieldObj.primaryKey == true) {
    				let value = {table: service.name, field};
    				this.rufsServicefields.foreignKeysImport.options.push(value);
    				this.rufsServicefields.foreignKeysImport.optionsLabels.push(JSON.stringify(value));
    			}
    		}
    	}
    	
       	this.listItemCrudJson.push(new CrudItemJson(this, this.rufsServicefields, "fields", "Campos dos formulários", this.serverConnection));
    }

    save() {
		this.instance.name =  CaseConvert.underscoreToCamel(this.instance.name);
		return super.save();
    }

}

export {RufsServiceController}
