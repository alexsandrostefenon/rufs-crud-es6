import {CaseConvert} from "./CaseConvert.js";
import {CrudController} from "./CrudController.js";
import {CrudItemJson} from "./CrudItemJson.js";

class RufsServiceController extends CrudController {

    constructor(serverConnection, $scope) {
    	super(serverConnection, $scope);
//		const defaultValues = {type: "s", updatable: true, maxLength: 255, precision: 9, scale: 3, hiden: false, primaryKey: false, required: false};
    	this.rufsService.properties = {
    			"type":{"options": ["string", "integer", "boolean", "number", "date-time", "date", "time"]},
    			"default":{},
    			"options": {},
    			"optionsLabels": {},
    			"sortType":{"options": ["asc", "desc"]},
    			"orderIndex":{"type": "integer"},
    			"tableVisible":{"type": "boolean"},
    			"required":{"type": "boolean"},
    			"maxLength":{"type": "integer"},
    			"precision":{"type": "integer"},
    			"scale":{"type": "integer"},
    			"identityGeneration":{"options": ["ALWAYS", "BY DEFAULT"]},
    			"$ref":{},
    			"shortDescription":{"type": "boolean"},
    			"comment":{},
    			"title":{},
    			"isClonable":{"type": "boolean"},
    			"unique":{},
    			"updatable":{"type": "boolean"},
    			"hiden":{"type": "boolean"},
    			"readOnly":{"type": "boolean"},
    			};

    	this.rufsService.properties.$ref.enum = [];
    	
    	for (let service of this.rufsService.list) {
    		for (let fieldName of service.primaryKeys) {
				this.rufsService.properties.$ref.enum.push("#/components/schemas/" + service.name);
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
