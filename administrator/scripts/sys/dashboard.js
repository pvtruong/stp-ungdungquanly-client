var dashboardModule =  angular.module('dashboardModule',['ngRoute']);
dashboardModule.controller("homeController",['$scope','$localStorage','user','$rootScope','$location','$timeout','$http','api','$window','$interval','appInfo','$modal','$filter',function($scope,$localStorage,user,$rootScope,$location,$timeout,$http,api,$window,$interval,appInfo,$modal,$filter){
	if($location.url().toLowerCase()=="/download"){
		return;
	}
	if($location.url().indexOf("/~lg/")>=0){
		var s =$location.url().split("/");
		var fun ="dashboard";
		var id_app,token
		if(s.length>=4){
			token = s[2];
			id_app = s[3];
			if(s.length>4){
				fun =s[4];
			}
		}
		if(token){
			$localStorage.set("token",token)
			$localStorage.set("id_app",id_app)
			api.init(token);
			
			user.getInfo(function(user){
				
				$location.url("/" + fun);
			});
			return;
		}
	}
	if(!$localStorage.get('token')){
		if($location.url().toLowerCase().indexOf('/login')<0 && $location.url().toLowerCase().indexOf('/logout')<0){
			$rootScope.w_redirect = $location.url();
		}
		$location.url("/login");
		return;
	}
	if($location.url()=="/dashboard" || $location.url()=="/"){
		
		appInfo.info("/dashboard",function(error,userinfo,appinfo){
			if(error){
				$location.url("/login");
				return;
			}
        });
		
	}

}]);
dashboardModule.controller('dxdController',['$scope',function($scope){
	
}]);
dashboardModule.controller('adminController',['appInfo','$location',function(appInfo,$location){
	appInfo.info("admin",function(error,userinfo,appinfo){
			if(error){
				$location.url("/login");
				return;
			}
	})
}]);
dashboardModule.config(['$routeProvider','$locationProvider','$httpProvider',function($routeProvider,$locationProvider,$httpProvider){
	//$httpProvider.responseInterceptors.push('httpInterceptor');
	$routeProvider
		.when("/",{
			templateUrl:"templates/dashboard/templates/db1.html",
			controller:"homeController"
		})
		.when("/lg/:id_app",{
			templateUrl:"templates/dashboard/templates/db1.html",
			controller:"homeController"
		})
		.when("/dxd",{
			templateUrl:"templates/dashboard/templates/dxd.html",
			controller:"dxdController"
		})
		.when("/admin",{
			templateUrl:"templates/dashboard/templates/admin.html",
			controller:"adminController"
		})
		.when("/dashboard",{
			templateUrl:"templates/dashboard/templates/db1.html",
			controller:"homeController"
		});
}]);
