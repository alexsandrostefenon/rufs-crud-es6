import {RufsMicroService} from "../rufs-base-es6/RufsMicroService.js";

class CrudMicroService extends RufsMicroService {

	constructor(config) {
		super(config, "crud");
	}

}

CrudMicroService.checkStandalone();

export {CrudMicroService};
