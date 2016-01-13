var baseRpt = function(rptId,path_service,title,options){
	this.rptId = rptId;
    var moduleName = rptId + 'Module';
    if(!_.contains(modulesD,moduleName)){
        modulesD.push(moduleName);
    }
	this.rptModuleName = moduleName;
	this.module = angular.module(this.rptModuleName,['ngRoute']);
	var rpt =  this;
	if(!options){
		options ={}
	}
	//options.onLoading($scope,{$http:$http,$filter:$filter,$location:$location,$config:$config,$controller:$controller});
	if(options.onInit){
		rpt.init = options.onInit;
	}
	if(options.onAfterLoadData){
		rpt.afterLoadData = options.onAfterLoadData;
	}
	if(options.onDefaultCondition){
		rpt.defaultCondition = options.onDefaultCondition;
	}
	if(options.onPrepareCondition){
		rpt.prepareCondition = options.onPrepareCondition
	}
	//create url
	this.getUrl = function(){
		var url;
		if(options.require_id_app==false){
			url = server_url + "/public/" + path_service;
		}else{
			url = server_url + "/api/" + id_app + "/" + path_service ;
		}
		return url;
	}
	//
	this.module.factory(rptId +'Config',function(){
		return {};
	});
	this.getData = function($http,$filter,condition,callback,$scope){
		var url = rpt.getUrl()+ "?t=1";
		if($scope){
			$scope.$emit("$dataChangeStart")
		}
		if(condition){
			angular.forEach(condition,function(v,k){
				if(angular.isDate(v)){
					//v = new Date(Date.UTC(v.getFullYear(),v.getMonth(),v.getDate()))
					//v = $filter('date')(v,'yyyy-MM-dd');
					v = JSON.stringify(v).replace(/\"/g,"")//v.toUTCString();
				}else{
					if(angular.isObject(v)){
						v = JSON.stringify(v);
					}
				}
				url =url + "&" + k  + '=' + encodeURI(v);
			});
		}
		$http.get(url)
			.success(function(data){
				callback(null,data);
				if($scope){
					$scope.$emit("$dataChangeSuccess")
				}
			})
			.error(function(error){
				console.log(error);
				callback(error);
				if($scope){
					$scope.$emit("$dataChangeError")
				}
                var msg_error ="Lỗi: ";
                if(error.message){
                    msg_error = msg_error + error.message;
                }else{
                    msg_error = msg_error + error;
                }
                alert(msg_error);
			});
	}
	this.module.controller(rptId +'Controller',['$scope','$http','$filter','$location',rptId +'Config','$controller','$rootScope','$window','appInfo',function($scope,$http,$filter,$location,$config,$controller,$rootScope,$window,appInfo){
		var search = $location.search();
		if(!$scope.condition){
			$scope.condition ={};
			if(rpt.defaultCondition){
				rpt.defaultCondition($scope.condition);
			}
			if(_.isEqual(search,{})){
				if($config.condition){
					for(var key in $config.condition){
						$location.search(key,$config.condition[key]);
						search[key] = $config.condition[key];
					}
				}
			}
			_.extend($scope.condition,search);
			
		}
		
		if(rpt.init){
			rpt.init($scope,$http,$filter,$location,$config,$controller);
		}
		if(options.require_id_app==false || appInfo.info(rptId)==true){
			$scope.title = title;
			if($config.id_app == id_app && _.isEqual(search,$config.condition)){
				$scope.data = $config.data;
			}
			if($scope.data){
				$scope.condition_show = false;
				if(rpt.afterLoadData){
					rpt.afterLoadData($scope,$scope.data);
				}
			}else{
				$scope.condition_show = true;
			}
			
			
			$scope.hideCondition = function(){
				$scope.condition_show = !$scope.condition_show;
			}
			$scope.viewVoucher = function(ma_ct,id_ct){
				if(ma_ct && id_ct){
					var url = ma_ct.toLowerCase() +  "/edit/" + id_ct + "?redirect=back";
					$location.url(url)
				}
				
			}
			$scope.order = function(predicate, reverse) {
				$scope.data = $filter("orderBy")($scope.data, predicate, reverse);
			};
            $scope.limit=100;
            $scope.begin =0;
            $scope.loadPage = function(){
                $scope.limit = $scope.limit + 5;
            }
			$scope.getData = function(){
                $scope.limit =100;
				if(options.onStartGetData){
					options.onStartGetData($scope,function(e){
						if(!e) $scope.getDataFromServer(); else alert(e);
					})
				}else{
					$scope.getDataFromServer();
				}
			}
			$scope.getDataFromServer = function(){
                $location.$$search = {};
				//$scope.data =[];
				for( var key in $scope.condition){
					var v = $scope.condition[key];
					if(angular.isDate(v)){
						v = $filter('date')(v,"yyyy-MM-dd");
					}
					if(v && v!=''){
						$location.search(key,v);	
					}
					
				}
				if(rpt.prepareCondition){
					rpt.prepareCondition($scope.condition,$filter,function(error,condition){
						if(error){
							$scope.error = error;
						}else{
							rpt.getData($http,$filter,condition,function(error,data){
								$scope.data = data;
								$scope.error = error;
								if(!error){
									$scope.condition_show = false;
									$config.condition = $location.search();
									$config.data = data;
									$config.id_app = id_app;
									if(rpt.afterLoadData){
										rpt.afterLoadData($scope,data);
									}
								}
							},$scope);
						}
						
					})
				}else{
					rpt.getData($http,$filter,$scope.condition,function(error,data){
						$scope.data = data;
						$scope.error = error;
						if(!error){
							$scope.condition_show = false;
							$config.condition = $location.search();
							$config.data = data;
							$config.id_app = id_app;
							if(rpt.afterLoadData){
								rpt.afterLoadData($scope,data);
							}
						}
					},$scope);
				}
			}
			$scope.print = function(){
				$location.path("/" + rptId +"/print");
			}
			$scope.exportExcel = function (conf) {
				var url =rpt.getUrl() + "/excel?access_token=" + access_token;//server_url + "/api/" + id_app + "/" + path_service + "/excel?access_token=" + access_token
					if(rpt.prepareCondition){
						rpt.prepareCondition($scope.condition,$filter,function(error,condition){
							if(error){
								$scope.error = error;
							}else{
								angular.forEach(condition,function(v,k){
									if(angular.isDate(v)){
										v = $filter('date')(v,'yyyy-MM-dd');
									}
									if(angular.isObject(v)){
										v = JSON.stringify(v);
									}
									if(v){
										url =url + "&" + k  + '=' + encodeURI(v);
									}
									
								});
								$window.open(url);
							}
							
						})
					}else{
						angular.forEach($scope.condition,function(v,k){
							if(angular.isDate(v)){
								v = $filter('date')(v,'yyyy-MM-dd');
							}
							if(angular.isObject(v)){
								v = JSON.stringify(v);
							}
							if(v){
								url =url + "&" + k  + '=' + encodeURI(v);
							}
							
						});
						$window.open(url);
					}
			}
			
			if(options.onLoading){
				options.onLoading($scope,{$http:$http,$filter:$filter,$location:$location,$config:$config,$controller:$controller});
			}
			
			if($scope.condition.isDrillDown){
				delete $scope.condition.isDrillDown;
				$scope.getData();
			}
			//like
			$scope.isLike = false;
            if(id_app){
                $http.get(server_url + "/api/" + id_app +"/like_module?q={module:'" + rptId + "'}")
                    .success(function(rs){
                        if(rs && rs.length==1){
                            $scope.isLike = rs[0].like;
                        }
                    })
                    .error(function(e){
                        console.log(e);
                    });
                $scope.like = function(){
                    var url =server_url + "/api/" + id_app +"/like_module";
                    $http.post(url,{id_app:id_app,module:rptId,like:true}).success(function(rs){
                        if(rs){
                            $scope.isLike = true;
                        }
                    }).error(function(e){
                        console.log(e)
                    })
                }
                $scope.unlike = function(){
                    var url =server_url + "/api/" + id_app +"/like_module";
                    $http.post(url,{id_app:id_app,module:rptId,like:false}).success(function(rs){
                        if(rs){
                            $scope.isLike = false;
                        }
                    }).error(function(e){
                        console.log(e)
                    })
                }
            }
			//shortcuts
			$scope.$on('keydown',function(onEvent,event){
				//refresh
				if(event.which==116){
					$scope.getData();
					return;
				}
				if(event.ctrlKey ){
					//export
					if(event.which==69){
						$scope.exportExcel()
						return;
					}
					//print
					if(event.which==80){
						$scope.print();
						return;
					}
				}
			})
		}
	}]);
	this.module.controller(rptId +'PrintController',['$controller','appInfo','$scope',rptId +'Config','$timeout','$location','$rootScope',function($controller,appInfo,$scope,$config,$timeout,$location,$rootScope){
		appInfo.info(rptId,function(e,u,appinfo){
			if(e) return;
			$scope.parameters ={};
			$scope.condition = $config.condition;
			$scope.title = title;
			$scope.data = $config.data;
			$scope.appInfo = appinfo;
			if(rpt.setParameters){
				rpt.setParameters($scope,$controller);
			}
			$scope.print = function(){
				$scope.printing = true;
				$rootScope.printing = true;
				$timeout(function(){
					window.print();
					$scope.printing = false;
					$rootScope.printing = false;
				},100);
				
			}
			$scope.back = function(){
				$location.url("/" + rptId);
			}
			$scope.$on('keydown',function(onEvent,event){
				if(event.ctrlKey ){
					//print
					if(event.which==80){
						$scope.print();
						return;
					}
				}
			})
		})
		
	}]);
	
	this.module.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider){
		$routeProvider
			.when("/" + rptId,{
				templateUrl:"templates/reports/" + rptId + "/templates/browser.html",
				controller:rptId + "Controller",
				reloadOnSearch: false
			})
			.when("/" + rptId +"/print",{
				templateUrl:"templates/reports/" + rptId + "/templates/print.html",
				controller:rptId + "PrintController",
				reloadOnSearch: false
			})
		
	}]);
}