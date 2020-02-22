import fs from "fs";
import Proxy from "redbird";
import {exec} from "child_process";
import {MicroServiceServer} from "../rufs-base-es6/MicroServiceServer.js";

const fsPromises = fs.promises;
// TODO : only until nodejs needs custom-loader.mjs to resolve import(module)
import pg from "pg";
import pgCamelCase from "pg-camelcase";
import { runInNewContext } from "vm";

class RufsProxy {

	constructor(config) {
		this.config = config;
		this.proxy = new Proxy({port: config.port, ssl: config.ssl});

		if (config.host == "0.0.0.0") {
			this.proxy.addResolver((host, url, req) => {
//				console.log("host:", host);
//				console.log("url:", url);
				let ret = {};
				
				if (url.length > 0) {
					const sourcePath = url.substring(1);
					const route = config.routes.find(item => sourcePath.startsWith(item.sourcePath+"/"));

					if (route != undefined) {
						ret.url = route.target;
						req.url = req.url.substring(route.sourcePath.length + 1);
					}
				}

				return ret;
			});
		}
	}

	async start(config) {
        console.log(`starting RufsProxy...`);
        
        {
            const paths = MicroServiceServer.getArg("add-modules", "").split(",");

            for (const path of paths) {
                let entry = {};
                entry.path = path;
                config.modules.push(entry);
            }
		}
		
		let port = config.port;

		for (const entry of config.modules) {
				console.log(`loading module ${entry.path}...`);
				const module = await import(entry.path);

				for (const name in module) {
					if (name.indexOf("MicroService") >= 0) {
						const microServiceClass = module[name];
						const instance = new microServiceClass({port: ++port, webapp: entry.webapp});
						await instance.listen();
						console.log(`...loaded module ${entry.path}.`);
						config.routes.push({sourcePath: instance.config.appName, target: `http://localhost:${instance.config.port}`});
					}
				}
		}

		for (let cmd of config.cmds) {
			let childProcess = exec(cmd);
			console.log(`executed ${cmd}, PID : ${childProcess.pid}`);
		}

		for (let route of config.routes) {
			this.proxy.register(config.host + "/" + route.sourcePath, route.target+"/");
		}
	}

}

fsPromises.readFile("proxy-conf.json").
then(data => JSON.parse(data)).
catch(err => {
	console.log(err);
	
	const defaultConfig = {
		"host": "0.0.0.0",
		"port": 8080,
		"modules": [
//*
			{"path": "../rufs-base-es6/RufsServiceMicroService.js", "webapp": "./rufs-base-es6/webapp"},//, "port": 8081
			{"path": "../rufs-base-es6/AuthenticationMicroService.js"},//, "port": 8082
			{"path": "../rufs-base-es6/RufsMicroService.js"},//, "port": 8083
			{"path": "../rufs-base-es6/DocumentMicroService.js"},//, "port": 8084
			{"path": "../rufs-crud-es6/CrudMicroService.js"},//, "port": 8085
//*/
		],
		"cmds": [
/*
			"nodejs --experimental-modules --loader ./rufs-base-es6/custom-loader.mjs ./rufs-base-es6/RufsServiceMicroService.js --port=8081 --webapp=./rufs-base-es6/webapp",
			"nodejs --experimental-modules --loader ./rufs-base-es6/custom-loader.mjs ./rufs-base-es6/AuthenticationMicroService.js --port=8082",
			"nodejs --experimental-modules --loader ./rufs-base-es6/custom-loader.mjs ./rufs-base-es6/RufsMicroService.js --port=8083",
			"nodejs --experimental-modules --loader ./rufs-base-es6/custom-loader.mjs ./rufs-base-es6/DocumentMicroService.js --port=8084",
			"nodejs --experimental-modules --loader ./rufs-base-es6/custom-loader.mjs ./rufs-crud-es6/CrudMicroService.js --port=8085",
//*/
		],
		"routes": [
			{"sourcePath": "es6", "target": "http://localhost:8081/es6"},
			{"sourcePath": "css", "target": "http://localhost:8081/css"},
			{"sourcePath": "lib", "target": "http://localhost:8081/lib"},
			{"sourcePath": "fonts", "target": "http://localhost:8081/fonts"},
			
//			{"sourcePath": "rufs_service", "target": "http://localhost:8081"},
//			{"sourcePath": "authc", "target": "http://localhost:8082"},
//			{"sourcePath": "rufs", "target": "http://localhost:8083"},
//			{"sourcePath": "document", "target": "http://localhost:8084"},
//			{"sourcePath": "crud", "target": "http://localhost:8085"},
		]
	};

	fsPromises.writeFile("proxy-conf.json", JSON.stringify(defaultConfig, null, "\t"));
	return defaultConfig;
}).
then(config => {
	let instance = new RufsProxy(config);
	instance.start(config);
});
