import {DbClientPostgres} from "../rufs-base-es6/dbClientPostgres.js";
import {RequestFilter} from "../rufs-base-es6/RequestFilter.js";
import {MicroServiceServer} from "../rufs-base-es6/MicroServiceServer.js";

class CrudMicroService extends MicroServiceServer {

	constructor(config) {
		if (config == undefined) config = {};
		config.appName = "crud";
		super(config);
		this.entityManager = new DbClientPostgres(this.config.dbConfig);
	}

	onRequest(req, res, next, resource, action) {
		return RequestFilter.processRequest(req, res, next, this.entityManager, this, resource, action);
	}

	listen() {
		return this.entityManager.connect().
		then(() => {
			console.log(`starting updateRufsServices...`);
			return RequestFilter.updateRufsServices(this.entityManager).
			then(() => console.log(`...finished updateRufsServices...`)).
			then(() => super.listen());
		});
	}

}

CrudMicroService.checkStandalone();

export {CrudMicroService};