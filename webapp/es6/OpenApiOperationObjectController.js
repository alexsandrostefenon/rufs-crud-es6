import {CrudController} from "./CrudController.js";
import {CrudItemJson} from "./CrudItemJson.js";
import {CrudJsonArray} from "./CrudJsonArray.js";
import {CaseConvert} from "./CaseConvert.js";
import {HttpRestRequest} from "./ServerConnection.js";

class OpenApiOperationObjectController extends CrudController {

    constructor(serverConnection, $scope) {
    	super(serverConnection, $scope);
    	this.rufsService.label = "OpenApi/Swagger Operations";

		this.properties.operationId.orderIndex = 1;
		this.properties.operationId.sortType = "asc";
		this.properties.path.orderIndex = 2;
		this.properties.path.sortType = "asc";
		this.properties.method.orderIndex = 3;
		this.properties.method.sortType = "asc";
		this.properties.parameter.orderIndex = 4;

       	this.listItemCrudJson.push(new CrudItemJson(this, this.properties.parameter.properties, "parameter", "Query String", this.serverConnection));
       	this.listItemCrudJson.push(new CrudItemJson(this, this.properties.requestBody.properties, "requestBody", "Request Body", this.serverConnection));
       	this.listItemCrudJson.push(new CrudItemJson(this, this.properties.response.properties, "response", "Response Ok", this.serverConnection));
    }

}

export {OpenApiOperationObjectController}
