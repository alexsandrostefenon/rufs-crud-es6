import {ServerConnectionUI} from "./ServerConnectionUI.js";
import {Crud} from "./crud.js";

const app = angular.module("app", ['ngRoute', 'ui.bootstrap']);

app.config(($controllerProvider, $routeProvider, $compileProvider, $provide) => {
	Crud.initialize($controllerProvider, $routeProvider, $compileProvider, $provide);
	$routeProvider.when('/app/login',{templateUrl:'templates/login.html', controller:'LoginController', controllerAs: "vm"});
	$routeProvider.otherwise({redirectTo: '/app/login'});
	ServerConnectionUI.changeLocationHash('/app/login');
});
