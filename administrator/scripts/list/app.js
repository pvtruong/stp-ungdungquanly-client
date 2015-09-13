var appModule = new baseInput('app','app',["name"],'Thông tin đơn vị, doanh nghiệp',{services:function($http){
	var sv ={
		active:function(id){
					return $http.get(server_url + "/api/app/active/" + id );
				},
		notaccept:function(id){
			return $http.get(server_url + "/api/app/notaccept/" + id );
		}
	}
	return sv;
	
},
onCondition:function(condition,value){
	condition.$or = {create_db_sql:false,create_db_sql:null}
},
onView:function($scope,options){
	$scope.open = function(data){
		var id = data._id;
		var active = data.active;
		if(!active){
			options.service.active(id).success(function(d){
			}).error(function(error){
				console.error("Không thể kích hoạt: ",error);
			});
		}
		id_app = id;
		options.$rootScope.app_info = _.find($scope.list,function(r){
			return r._id==id;
		});
		options.$rootScope.id_app = id;
		options.$localStorage.set("id_app",id);
		if(options.$rootScope.w_redirect){
			w_redirect = options.$rootScope.w_redirect;
			delete options.$rootScope.w_redirect;
			options.$location.url(w_redirect);
		}else{
			options.$location.url("/dashboard");
		}
		
	}
	$scope.auth_google = function(){
		var w =options.$window.open(server_url + "/auth/google_drive" ,"Google authentication",'height=400,width=400');
		var interval = options.$interval(function(){
			try{
				if(w.location.href && w.location.href.indexOf("/auth/google/callback")){
					if(w.document.body.innerHTML && w.document.body.innerHTML.indexOf("access_token")>=0){
						
						var user = JSON.parse(w.document.title);
						$scope.update({google_drive_email:user.email,google_drive_token:user.access_token,google_drive_refresh_token:user.refresh_token},function(e,rs){
							if(e) return alert(e);
							$scope.data.google_drive_refresh_token = access_token;
						});
						options.$interval.cancel(interval);
						w.close();
						
					}
				}
			}catch(e){
				console.log(e)
			}
			
		},500);
	}
	$scope.delete_google_drive = function(){
		$scope.update({google_drive_email:'',google_drive_token:'',google_drive_refresh_token:''},function(e,rs){
			if(e) return alert(e);
			$scope.data.google_drive_refresh_token = '';
		});
	}
},
has_view:true});
appModule.defaultValues = {
	ngay_dn:new Date( 2015,0,1),
	ngay_ks:new Date(2015,0,1),
	ngay_ky1:new Date(2015,0,1)
}
appModule.module.controller("initApp",["$scope","$window","$interval","$http",function($scope,$window,$interval,$http){
	$http.get(server_url + "/public/province").success(function(province){
		$scope.province = province;
	});
	
}]);
appModule.init = function($scope,$controller){
	$controller("initApp",{$scope:$scope});
}
appModule.module.controller('baseAppHomeController',['$scope','$location','$localStorage','$rootScope','app','$window',function($scope,$location,$localStorage,$rootScope,app,$window){
	$scope.open = function(id,active){
		if(!active){
			app.active(id).success(function(d){
			}).error(function(error){
				console.error("Không thể kích hoạt: ",error);
			});
		}
		id_app = id;
		$rootScope.app_info = _.find($scope.list,function(r){
			return r._id==id;
		});
		$rootScope.id_app = id;
		$localStorage.set("id_app",id);
		if($rootScope.w_redirect){
			w_redirect = $rootScope.w_redirect;
			delete $rootScope.w_redirect;
			$location.url(w_redirect);
		}else{
			$location.url("/dashboard");
		}
		
	}
}]);
appModule.initHomeController = function($controller,$scope){
	$controller("baseAppHomeController",{$scope:$scope});
}

var initAddEditController = function($controller,$scope){
	$scope.addParticipant = function($item){
		$scope.participant = undefined;
		if(!$scope.data.participants){
			$scope.data.participants = [];
		}
		var f = _.find($scope.data.participants,function(p){
			return (p.email == $item.email_coll);
		});
		if(f){
			alert($item.name + ' đã tồn tại');
			return;
		}
		$scope.data.participants.push({email:$item.email_coll,name:$item.name_coll,picture:$item.picture_coll,admin:false})
		
	}
	$scope.deleteParticipant = function(email){
		if(!$scope.data.participants){
			$scope.data.participants = [];
		}
		$scope.data.participants = _.reject($scope.data.participants,function(p){
			return p.email ==email;
		});
	}
}
appModule.initAddController = function($controller,$scope){
	initAddEditController($controller,$scope);
}
appModule.initEditController = function($controller,$scope){
	initAddEditController($controller,$scope);
}
appModule.module.controller("appsController",["$scope","$rootScope","$routeParams","$http","user","$location",'$modal','app','appInfo'
	,function($scope,$rootScope,$routeParams,$http,user,$location,$modal,app,appInfo){
			appInfo.info("app",function(error,uerinfo,appinfo){
				if(error){
					return;
				}
				var email = $routeParams.email
				//get APPs list
				var url = server_url + "/api/app/apps/" + email
				$http.get(url).success(function(apps){
					$scope.list = apps;
				});
				//view profile
				$scope.email = email;
				$scope.openProfile = function(email){
					viewProfile($modal,email);
				}
				$scope.addDays = function(a){
					var modalInstance = $modal.open({
					  templateUrl:"templates/lists/app/templates/add-days.html",
					  controller: ['$scope','$modalInstance','user','$location','$rootScope','app','$window',function($scope,$modalInstance,user,$location,$rootScope,app,$window){
							$scope.so_ngay =30;
							$scope.cancel = function () {
								$modalInstance.dismiss('cancel');
							};;
							$scope.save = function(email){
								var cty = {}
								_.extend(cty,a);
								var expire = cty.expire_date;
								if(!expire || cty.so_ngay_con_lai<=0)
									expire = new Date();
								else 
									expire = new Date(expire);
								
								expire.setDate(expire.getDate() + $scope.so_ngay);
								cty.expire_date = expire;
								app.update(cty._id,cty._id,cty).success(function(c){
									_.extend(a,c);
									$modalInstance.dismiss('cancel');
								}).error(function(e){
									$window.alert("Không thể thêm ngày sử dụng cho công ty này");
								})
							}
							
						}],
					  size: 'lg'
					});
				}
			})

		
	}
]);
appModule.module.controller("assignController",["$scope","$rootScope","$routeParams","$http","user","$location","app","appInfo"
	,function($scope,$rootScope,$routeParams,$http,user,$location,app,appInfo){
	appInfo.info("app",function(error,uerinfo,appinfo){
		if(error){
			return;
		}
		var id_app = $routeParams.id_app
		var email = $routeParams.email
		$scope.email = email;
		appInfo.commands(id_app,function(e,commands){
			if(e) return console.log(e);
			var query = {email:email}
			var url = server_url + "/api/" + id_app + "/right" + "?q=" + JSON.stringify(query)
			$http.get(url).success(function(result){
				//CRM
				commands.crm.input.forEach(function(item){
					item.module = item.module?item.module:item.path
					var rs = _.find(result,function(r){
						return r.module == item.module;
					});
					if(rs){
						for(var k in rs){
							item[k] = rs[k];
						}
					}
					//
					item.id_app = id_app;
					item.email = email;
				})
				//ACC
				commands.acc.forEach(function(module){
					var groups = module.items;
					groups.forEach(function(group){
						var items = group.items;
						items.forEach(function(item){
							item.module = item.module?item.module:item.path
							var rs = _.find(result,function(r){
								return r.module == item.module;
							});
							if(rs){
								for(var k in rs){
									item[k] = rs[k];
								}
							}
							//
							item.id_app = id_app;
							item.email = email;
							
						});
						
					});
				})
				//Report
				commands.report.forEach(function(module){
					var items = module.items;
					items.forEach(function(item){
						item.module = item.module?item.module:item.path
						var rs = _.find(result,function(r){
							return r.module == item.module;
						});
						if(rs){
							for(var k in rs){
								item[k] = rs[k];
							}
						}
						//
						item.id_app = id_app;
						item.email = email;
						
					});
				})
				$scope.commands = commands;
				$scope.change = function(item,action){
					url = server_url + "/api/" + id_app + "/right"
					var rp
					if(item._id){
						url = url + "/" + item._id;
						rp = $http.put(url,item);
					}else{
						rp = $http.post(url,item);
					}
					
					rp.success(function(result){
						for(var k in result){
							item[k] = result[k];
						}
					}).error(function(error){
						console.log(item);
						alert(JSON.stringify(error));
					});
				}
				$scope.selectAllRight = function(item){
					item.add = item.sel;
					item.update = item.sel;
					item.delete = item.sel;
					item.view = item.sel;
					$scope.change(item)
				}
			}).error(function(error){
				console.log(url);
			});
		})
		
	});
	
	
	
}]);
appModule.module.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider){
		$routeProvider
			.when("/assign/:id_app/:email",{
				templateUrl:"templates/lists/app/templates/assign.html",
				controller:"assignController"
			}).when("/apps/:email",{
				templateUrl:"templates/lists/app/templates/apps.html",
				controller:"appsController"
			});
}])