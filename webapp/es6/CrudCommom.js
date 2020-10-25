import {OpenApi} from "./OpenApi.js";
import {CrudUiSkeleton} from "./CrudUiSkeleton.js";
import {ServerConnectionUI} from "./ServerConnectionUI.js";
// differ from CrudUiSkeleton by rufsService dependency
class CrudCommom extends CrudUiSkeleton {

	constructor(serverConnection, rufsService) {
		super(serverConnection, rufsService.name, rufsService);
		this.rufsService = rufsService;
		this.list = this.rufsService.list;
		this.serverConnection.addRemoteListener(this);
		this.activeTab = 0;
		this.activeSchemaType = "schema";
	}

	process(action, params) {
		return Promise.resolve().
		then(() => {
		}).
		then(() => {
			if (action == "new") {
				if (this.activeSchemaType != "requestBody") {
					const schema = OpenApi.getSchemaFromRequestBodies(this.serverConnection.openapi, this.rufsService.name);

					if (schema != undefined) {
						this.setSchema(schema);
						this.activeSchemaType = "requestBody";
						this.updateFields();
					}
				}
			} else if (this.activeSchemaType != "schema") {
				const schema = OpenApi.getSchemaFromSchemas(this.serverConnection.openapi, this.rufsService.name);

				if (schema != undefined) {
					this.setSchema(schema);
					this.activeSchemaType = "schema";
					this.updateFields();
				}
			}
		}).
		then(() => {
			return super.process(action, params);
		}).
		then(() => {
			let promise = undefined;

			if (action == "search") {
				this.templateModel = "./templates/crud-model_search.html";

				if (params.filter != undefined || params.filterRange != undefined || params.filterRangeMin != undefined || params.filterRangeMax != undefined) {
					if (params.filterRange != undefined) {
						for (let [fieldName, value] of Object.entries(params.filterRange)) this.setFilterRange(fieldName, value);
					}

					this.applyFilter(params.filter, params.filterRangeMin, params.filterRangeMax);
					promise = this.setPage(1);
				}

				if (params.aggregate != undefined) {
					promise = Promise.resolve().then(() => this.applyAggregate(params.aggregate));
				}

				if (params.sort != undefined) {
					this.applySort(params.sort);
				}

				if (params.pagination != undefined) {
					promise = this.paginate(params.pagination);
				}

				if (promise == undefined)
					promise = Promise.resolve();
			} else if (action == "new") {
				this.templateModel = "./templates/crud-model_new.html";
				promise = this.setValues(params.overwrite, true);
			} else if (action == "view") {
				this.templateModel = "./templates/crud-model_view.html";
				this.primaryKey = this.rufsService.getPrimaryKey(params.primaryKey);
				promise = this.get(this.primaryKey);
			} else if (action == "edit") {
				this.templateModel = "./templates/crud-model_edit.html";
				this.primaryKey = this.rufsService.getPrimaryKey(params.primaryKey);
				promise = this.get(this.primaryKey);
			}

			return promise;
		}).then(res => {
//			this.title = this.rufsService.label;
			this.serverConnection.$scope.$apply();
			return res;
		})
	}

	// action: ["new", "update", "delete"]
	onNotify(schemaName, primaryKey, action) {
		this.applyFilter();
		this.applyAggregate();
		this.applySort();
	}

	buildLocationHash(hashPath, hashSearchObj) {
		return ServerConnectionUI.buildLocationHash(this.rufsService.path + "/" + hashPath, hashSearchObj)
	}

	goToSearch() {
		if (window.location.hash.endsWith("/search") == false) {
			window.history.back();
		}
	}
	// fieldName, 'view', item, false
    goToField(fieldName, action, obj, isGoNow) {
//    	console.log(`[${this.constructor.name}.goToField(${fieldName}, ${action})]`);
		let url = super.goToField(fieldName, action, obj);

		if (url == "") {
			const service = this.rufsService;
			const primaryKey = this.rufsService.getPrimaryKey(obj);
			url = ServerConnectionUI.buildLocationHash(service.path + "/" + action, {primaryKey});
		}

    	if (isGoNow == true) {
//    		ServerConnectionUI.changeLocationHash(service.path + "/" + action, {primaryKey});
    		ServerConnectionUI.changeLocationHash(url);
    	}

    	return url;
    }

	get(primaryKey) {
		return this.rufsService.get(primaryKey).then(response => {
			this.original = response.data;
			// atualiza as strings de referência
			return this.setValues(response.data, false).then(() => response);
		});
	}

	remove(primaryKey) {
		if (primaryKey == undefined) {
			primaryKey = this.primaryKey;
		}

		return this.rufsService.remove(primaryKey);
	}

	update() {
		return this.rufsService.update(this.primaryKey, this.instance).
		then(response => {
			this.original = response.data;
			return response;
		});
	}

	save() {
		this.primaryKey = {};
		return this.rufsService.save(this.instance).
		then(response => {
			this.original = response.data;
			return response;
		});
	}

	applyAggregate(aggregate) {
		super.applyAggregate(aggregate);
		if (this.aggregateResults.length == 0) return;
		const chart = document.getElementById("aggregate-chart");
		if (chart == undefined) return;
		const ctx = chart.getContext('2d');
		const xData = Array.from(this.aggregateResults.keys());
		const yData = Array.from(this.aggregateResults.values());
		
		if (this.aggregateChartOptions == undefined) {
			this.aggregateChartOptions = {type: 'bar', data: {labels: [], datasets: [{label: "", data: []}]}};
			this.aggregateChart = new Chart(ctx, this.aggregateChartOptions);
		}
		
		let label = "";
		
		for (let fieldName in this.instanceAggregateRange) {
			let range = this.instanceAggregateRange[fieldName];
			if (range != false && range != "" && range != 0) label = label + fieldName + ",";
		}
		
		this.aggregateChartOptions.data.labels = xData;
		this.aggregateChartOptions.data.datasets[0].label = label;
		this.aggregateChartOptions.data.datasets[0].data = yData;
		this.aggregateChart.update();
	}
}

export {CrudCommom}
