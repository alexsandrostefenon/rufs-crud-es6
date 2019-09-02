import {CrudUiSkeleton} from "./CrudUiSkeleton.js";
import {ServerConnectionUI} from "./ServerConnectionUI.js";
// differ from CrudUiSkeleton by rufsService dependency
class CrudCommom extends CrudUiSkeleton {

	constructor(serverConnection, rufsService) {
		super(serverConnection, rufsService.params.name, rufsService.params.fields);
		this.rufsService = rufsService;
		this.list = this.rufsService.list;
		this.rufsService.addRemoteListener(this);
		this.activeTab = 0;
	}
	
	process(action, params) {
		super.process(action, params);

		if (action == "search") {
			this.templateModel = "crud/templates/crud-model_search.html";
			
			if (params.filter != undefined || params.filterRange != undefined || params.filterRangeMin != undefined || params.filterRangeMax != undefined) {
				if (params.filterRange != undefined) {
					for (let [fieldName, value] of Object.entries(params.filterRange)) this.setFilterRange(fieldName, value);
				}
			
				this.applyFilter(params.filter, params.filterRangeMin, params.filterRangeMax);
			}
			
			if (params.aggregate != undefined) {
				Promise.resolve().then(() => this.applyAggregate(params.aggregate));
			}
			
			if (params.sort != undefined) {
				this.applySort(params.sort);
			}
			
			if (params.pagination != undefined) {
				this.paginate(params.pagination);
			}
		} else if (action == "new") {
			this.templateModel = "crud/templates/crud-model_new.html";
			this.setValues(params.overwrite);
		} else if (action == "view") {
			this.templateModel = "crud/templates/crud-model_view.html";
			this.primaryKey = this.rufsService.getPrimaryKey(params.primaryKey);
			this.get(this.primaryKey);
		} else if (action == "edit") {
			this.templateModel = "crud/templates/crud-model_edit.html";
			this.primaryKey = this.rufsService.getPrimaryKey(params.primaryKey);
			this.get(this.primaryKey);
		} else {
//			throw new Error(`CrudCommom.constructor : invalid action : ${action}`);
		}
	}

	// action: ["new", "update", "delete"]
	onNotify(primaryKey, action) {
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
    	const field = this.fields[fieldName];
    	let service;
    	let primaryKey = {};

		if (field.foreignKeysImport != undefined) {
			// neste caso, obj[fieldName] contém o id do registro de referência
			// dataForeign, fieldNameForeign, fieldName
			service = this.serverConnection.getForeignImportRufsService(field);
			
	    	if (obj != undefined) {
				primaryKey = service.getPrimaryKeyFromForeignData(obj, fieldName, field.foreignKeysImport.field);
	    	}
		} else {
			service = this.rufsService;
			primaryKey = this.rufsService.getPrimaryKey(obj);
		}

		const url = ServerConnectionUI.buildLocationHash(service.path + "/" + action, primaryKey);

    	if (isGoNow == true) {
    		ServerConnectionUI.changeLocationHash(service.path + "/" + action, primaryKey);
    	}

    	return url;
    }

	get(primaryKey) {
		return this.rufsService.get(primaryKey).then(response => {
			this.original = response.data;
			// atualiza as strings de referência
			this.setValues(response.data);
			return response;
		});
	}

	remove(primaryKey) {
		if (primaryKey == undefined) {
			primaryKey = this.primaryKey;
		}

		return this.rufsService.remove(primaryKey);
	}

	update() {
		return this.rufsService.update(this.primaryKey, this.instance);
	}

	save() {
		this.primaryKey = {};
		return this.rufsService.save(this.instance);
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
