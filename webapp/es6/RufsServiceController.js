import {CaseConvert} from "./CaseConvert.js";
import {CrudController} from "./CrudController.js";
import {CrudItemJson} from "./CrudItemJson.js";

class RufsServiceController extends CrudController {

    constructor(serverConnection, $scope) {
    	super(serverConnection, $scope);
//		const defaultValues = {type: "s", updatable: true, length: 255, precision: 9, scale: 3, hiden: false, primaryKey: false, required: false};
    	this.rufsService.properties = {
    			"type":{"options": ["s", "i", "b", "n", "datetime-local", "date", "time"]},
    			"default":{},
    			"options": {},
    			"optionsLabels": {},
    			"sortType":{"options": ["asc", "desc"]},
    			"orderIndex":{"type": "i"},
    			"tableVisible":{"type": "b"},
    			"required":{"type": "b"},
    			"length":{"type": "i"},
    			"precision":{"type": "i"},
    			"scale":{"type": "i"},
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

    	this.rufsService.properties.foreignKeysImport.enum = [];
    	this.rufsService.properties.foreignKeysImport.enumLabels = [];
    	
    	for (let service of this.rufsService.list) {
    		for (let fieldName of service.primaryKeys) {
				let value = [{table: service.name, field: service.properties[fieldName]}];
				this.rufsService.properties.foreignKeysImport.enum.push(value);
				this.rufsService.properties.foreignKeysImport.enumLabels.push(JSON.stringify(value));
    		}
    	}
    	
       	this.listItemCrudJson.push(new CrudItemJson(this, this.rufsService.properties, "properties", "Campos dos formulários", this.serverConnection));
    }

    save() {
		this.instance.name =  CaseConvert.underscoreToCamel(this.instance.name);
		return super.save();
    }

}

export {RufsServiceController}
