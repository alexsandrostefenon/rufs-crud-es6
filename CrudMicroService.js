import {RufsMicroService} from "../rufs-base-es6/RufsMicroService.js";
import url from "url";
import path from "path";

class CrudMicroService extends RufsMicroService {

	constructor(config, appName, checkRufsTables) {
		const defaultStaticPaths = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "webapp");
		if (config == null) config = {};
		config.defaultStaticPaths = config.defaultStaticPaths != undefined ? config.defaultStaticPaths + "," + defaultStaticPaths : defaultStaticPaths;
		super(config, appName || "crud", checkRufsTables);
	}

}

CrudMicroService.checkStandalone();

export {CrudMicroService};
