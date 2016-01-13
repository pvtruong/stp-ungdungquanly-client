var viewProfile = function($modal,email){
	var modalInstance = $modal.open({
	  templateUrl: 'templates/sys/profile.html',
	  controller: ['$scope','$modalInstance','user','$location','$rootScope',function($scope,$modalInstance,user,$location,$rootScope){
			user.getProfile(email,function(error,profile){
				$scope.profile = profile;
			});
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};;
			$scope.gotoChat = function(email){
				$modalInstance.dismiss('cancel');
				$location.path("/message/chat/" + email);
			}
			$scope.currentUser = $rootScope.user;
		}],
	  size: 'lg'
	});
}
var baseInput = function(code,server_path,fields_find,title,options){
	this.code = code;
	this.server_path = server_path;
	this.fields_find = fields_find;
	this.title = title;
	//options
	if(!options){
		options = {};
	}
	this.options = options;
	this.group = options.group;
	if(!this.group){
		this.group = "lists";
	}
	this.defaultConditions = options.defaultConditions;
	this.defaultValues = options.defaultValues;
	this.loading = options.onLoading;
	this.initHomeController = options.onInitHomeController;
	this.initAddController = options.onInitAddController;
	this.initEditController = options.onInitEditController;
	this.init = options.onInit;
	this.setDataSource2Print = options.onSetDataSource2Print;
	this.loadItem = options.onLoadItem;
	this.initImport = options.onImport;
	//options.onSave($scope,data,options): run before save
	//create module
    var moduleName = code +"Module";
    if(!_.contains(modulesD,moduleName)){
        modulesD.push(moduleName);
    }
	this.module = angular.module(moduleName,['ngRoute']);
	var input = this;
	//config
	this.module.factory(code + 'Config',function(){
		return {
			title:title,
			path:code
		};
	});
	//service
	this.module.factory(code,['$http',function($http){
		var url_service = function(){
			var url;
			if(_.contains(paths_not_require_id_app,server_path)){
				
				url = server_url + "/api/" + server_path;
			}else{
				url = server_url + "/api/" + id_app + "/" + server_path;
			}
			return url;
		}
		return baseService($http,url_service,fields_find,options.services);
	}]);
	//controllers
	this.module.controller(code + "JsonController",['$controller','$scope','$http',code,'$location',code + 'Config','$rootScope','$window','$interval','$modal','$filter','appInfo','$localStorage',function($controller,$scope,$http,service,$location,config,$rootScope,$window,$interval,$modal,$filter,appInfo,$localStorage){
		$scope.list =[]
		$scope.condition ="";
		if(input.defaultConditions){
			$scope.condition ={};
			_.extend($scope.condition,input.defaultConditions);
		}
		angular.extend($scope,config);
		$scope.limit = 30000;
		var queryParams = $location.search();
		appInfo.info(code,function(error,userinfo,appinfo){
			if(error){
				return;
			}
			$scope.list =[]
			service.load(id_app,{condition:$scope.condition,filter:$scope.filter,page:1,limit:$scope.limit,queryParams:queryParams,onCondition:options.onCondition})
			.success(function(rs){
				$scope.list = rs;
			}).error(function(e){
				if(e) alert(e);
			})
		})
	}])
	this.module.controller(code + "HomeController",['$controller','$scope','$http',code,'$location',code + 'Config','$rootScope','$window','$interval','$modal','$filter','appInfo','$localStorage',function($controller,$scope,$http,service,$location,config,$rootScope,$window,$interval,$modal,$filter,appInfo,$localStorage){
		$scope.list =[]
		$scope.condition ="";
		if(input.defaultConditions){
			$scope.condition ={};
			_.extend($scope.condition,input.defaultConditions);
		}
		angular.extend($scope,config);
		$scope.total_page = 1;
		$scope.current_page =1;
		$scope.pages =[1];
		$scope.limit = 30;
		$scope.$modal = $modal;
		$scope.$http = $http;
		$scope.config = config;
		var queryParams = $location.search();
		if(input.init){
			input.init($scope,$controller);
		}
		appInfo.info(code,function(error,userinfo,appinfo){
			if(error){
				return;
			}
			var key_localStorage = (id_app|| '') + userinfo.email + code + "data";
			if(input.loading){
				$rootScope.nextTick(function(){
					input.loading($scope,{$controller:$controller,$http:$http,service:service,$filter:$filter,$location:$location,config:config,$rootScope:$rootScope,$window:$window,$interval:$interval,$modal:$modal});
				});
				
			}
			$scope.current_user = $rootScope.user;
			$scope.export2excel = function(){
                var url = server_url + "/api/" + id_app +"/" + server_path  +"?type_data=xlsx&access_token=" + $rootScope.token;
				$window.open(url);
            }
			$scope.goToPage = function(page,condition,callback){
				$rootScope.nextTick(function(){
					$scope.$emit("$dataChangeStart")
					$scope.list =[]
                    
					if(!condition && condition==undefined){
						condition = $scope.condition;
					}
                    
					if($scope.findBy && !_.isObject(condition)){
						var dk = condition;
						condition= {};
						condition[$scope.findBy] = {$regex:dk,$options:'i'};
					}
                    
					//get total pages
					service.load(id_app,{condition:condition,filter:$scope.filter,count:1,queryParams:queryParams,onCondition:options.onCondition})
						.success(function(data){
							$scope.total_page = Math.round(data.rows_number/$scope.limit,0);
							if($scope.total_page< data.rows_number/$scope.limit){
								$scope.total_page +=1;
							}
							if($scope.total_page==0){
								$scope.total_page=1;
							}
							$scope.pages=[];
							for(var i=1;i<= $scope.total_page;i++){
								$scope.pages.push(i);
							}
						});
					//load page
					service.load(id_app,{condition:condition,filter:$scope.filter,page:page,limit:$scope.limit,queryParams:queryParams,onCondition:options.onCondition})
						.success(function(data){
							async.map(data,function(d,callback){
								if(id_app){
									$http.get(server_url + "/api/" + id_app + "/follow?q={id_object:'" + d._id + "',user_created:'" + $scope.current_user.email + "'}")
									.success(function(rs){
										if(rs && rs.length>0){
											d.followObject = rs[0];
											d.follow_yn = 1;
										}else{
											d.follow_yn = 0;
										}
										callback();
									}).error(function(e){
										d.follow_yn = 0;
										callback(e);
									})
								}else{
									callback();
								}
								
							},function(e,r){
								if(e) console.log(e)
								config.list = data;
								$localStorage.setObject(key_localStorage,data)
								config.id_app = id_app;
								config.current_page = page;
								config.condition = condition;
								config.filter = $scope.filter;
								config.filter_title = $scope.filter_title;
								$scope.current_page = page;
								$scope.list = data;
								$scope.renderCompleted = true;
								if(callback){
									callback(null,$scope.list)
								}
								$scope.$emit("$dataChangeSuccess")
							})							
						}).error(function(e){
							console.log(e)
							$scope.$emit("$dataChangeError")
							if(callback){
								callback(e)
							}
						});

				})
				
			}
			
			if(!config.list || config.list.length==0 || !id_app || config.id_app != id_app){
				//load from service
				$scope.goToPage(1,null,function(e){
					if(e){
						//load from localName
						$rootScope.nextTick(function(){
							var list = $localStorage.getObject(key_localStorage);
							if(!$scope.list || $scope.list.length==0){
								$scope.list = list
								$scope.current_page =1;
								$scope.total_page =1;
							}
							$scope.renderCompleted = true;
						});
					}
				});
				
			}else{
				$scope.list =[]
				$rootScope.nextTick(function(){
					$scope.$emit("$dataChangeStart")
					condition = config.condition;
					$scope.filter = config.filter;
					$scope.list = config.list;
					$scope.current_page = config.current_page;
					if(!$scope.current_page){
						$scope.current_page =1;
					}
					//get total pages
					service.load(id_app,{condition:condition,filter:$scope.filter,count:1,queryParams:queryParams,onCondition:options.onCondition})
					.success(function(data){
						$scope.total_page = Math.round(data.rows_number/$scope.limit,0);
						if($scope.total_page< data.rows_number/$scope.limit){
							$scope.total_page +=1;
						}
						if($scope.total_page==0){
							$scope.total_page=1;
						}
						$scope.pages=[];
						for(var i=1;i<= $scope.total_page;i++){
							$scope.pages.push(i);
						}
						$scope.$emit("$dataChangeSuccess")
						$scope.renderCompleted = true;
					}).error(function(e){
						$scope.$emit("$dataChangeError")
						$scope.renderCompleted = true;
					});
				})
			}
			$scope.update = function(data){
				$scope.$emit("$dataSaveStart")
				service.update(id_app,data._id,data)
					.success(function(result){
						data.updated = true;
						$scope.$emit("$dataSaveSuccess")
						alert('Đã cập nhật thành công');
					})
					.error(function(error){
						$scope.$emit("$dataSaveError")
						var msg =JSON.stringify(error);
						if(msg.indexOf("Lỗi")<0){
							if(msg.indexOf("duplicate")>=0){
								msg ="Lỗi: Đã tồn tại";
								return alert(msg);
							}else{
								if(msg.indexOf("Not allowed")>=0){
									msg ="Lỗi: Bạn không có quyền thực hiện thao tác này";
									return alert(msg);
								}
							}
							
						}
						msg = JSON.parse(msg);
						if(angular.isArray(msg)){
							alert(msg.join("\n"));
						}else{
							alert(msg);
						}
						
					});
			}
            
			$scope.add = function(){
				var url ="/" + $scope.path + "/add";
				$location.path(url);
			}
			$scope.edit = function(id){
				$location.path("/" + $scope.path + "/edit/" + id);
			}
			$scope.view = function(id){
                if(options.has_view){
                    $location.path("/" + $scope.path + "/view/" + id);
                }else{
                    $scope.edit(id);
                }
			}
			$scope.openProfile = function(email){
				viewProfile($modal,email);
			}
			$scope.searchKeyup = function(event,condition){
				if(event.keyCode==13){
					$scope.search(condition);
				}
			}
			$scope.search = function(dk){
				if(!$scope.renderCompleted) return;
				$scope.goToPage(1,dk);
			}
			$scope.changeFilter = function(v){
				$scope.findBy =null,
				$scope.filter = v.filter;
				$scope.filter_title = v.title;
				$scope.search();
			}
			$scope.changeFindBy = function(v){
				$scope.filter = null;
				$scope.findBy = v.findBy;
				$scope.filter_title = v.title;
				$scope.search();
			}
			//location
			$scope.location = $location.url();
			//order by
			$scope.reverse = true;
			$scope.order = function(predicate, reverse) {
				$scope.list = $filter("orderBy")($scope.list, predicate, reverse);
			};
			//selection
			$scope.selectionAll = false;
			$scope.$watch("selectionAll",function(newValue,oldValue){
				if($scope.list){
					$scope.list.forEach(function(r){
						r.sel = newValue;
					})
				}
				
			})
			$scope.isUnSelected =function(){
				if(!$scope.list){
					return true;
				}
				for(var i=0;i<$scope.list.length;i++){
					var r = $scope.list[i];
					if(r.sel && r.sel==true){
						return false;
					}
				}
				return true;
			}
			$scope.delete = function(_id){
				if(_id){
					if(confirm("Có chắc chắn xóa không?")){
						service.delete(id_app,_id)
							.success(function(data){
								$scope.list = _.reject($scope.list,function(r){
									return(r._id ==_id);
								});
								config.list=$scope.list;
							})
							.error(function(error){
								var e;
								if(_.isObject(error)){
									e = JSON.stringify(error);
								}else{
									e = error;
								}
								
								if(e.indexOf("Lỗi:")>=0){
									alert(e)
								}else{
									alert("Không thể xóa");
								}
							});
					}
					
				}else{
					if(confirm("Có chắc chắn xóa những dòng đã chọn không?")){
						async.map($scope.list,function(r,callback){
							if(r.sel && r.sel==true){
								var id = r._id;
								service.delete(id_app,id)
									.success(function(data){
										$scope.list = _.reject($scope.list,function(r){
											return(r._id ==id);
										});
										callback(null,id);
									})
									.error(function(error){
										callback(error);
									});
							}else{
								callback();
							}
						},function(error,results){
							if(error){
								var e;
								if(_.isObject(error)){
									e = JSON.stringify(error);
								}else{
									e = error;
								}
								if(e.indexOf("Lỗi:")>=0){
									alert(e)
								}else{
									alert("Không thể xóa");
								}
							}else{
								config.list=$scope.list;
							}
						});
					}
				}
				
			}
			//init home controller
			if(input.initHomeController){
				input.initHomeController($controller,$scope,$http,service,$location,config);
			}
			//load RPTs
			if(id_app){
				$rootScope.nextTick(function(){
					var url_get_rpts = server_url + "/api/" + id_app + "/rpt?q={ma_cn:'" + code.toUpperCase()  + "'}"
					$http.get(url_get_rpts).success(function(rpts){
						$scope.rpts = rpts;
					}).error(function(e){
						console.log(e);
					})
				})
				
			}
			
			$scope.rptManagement = function(){
				var url = "rpt?ma_cn=" + code.toUpperCase();
				$location.url(url);
			}
			$scope.print = function(id_rpt){
				$scope.list.forEach(function(obj){
					if(obj.sel){
						var url = server_url + "/api/" + id_app +"/" + code + "/excel/" + id_rpt +"?_id=" + obj._id + "&access_token=" + $rootScope.token;
						$window.open(url);
					}
				})
				
			}
            $scope.importhtml5 = function(){
                var refresh_import = $scope.search;
                var modalInstance = $modal.open({
				  templateUrl:"templates/sys/importhtml5.html",
				  controller:  ['$scope','$controller','$http', '$modalInstance','$window',function($scope,$controller,$http, $modalInstance,$window){
                        $scope.template = "templates/templates/" + input.code + ".xlsx";
                        $scope.update = false;
                        $scope.action = server_url + "/api/" + id_app + "/" + input.server_path + "/import/excel";
						$scope.cancel = function () {
							$modalInstance.dismiss('cancel');
						}
                        
                        $scope.$on('$fileUploadSuccess',function(e,data){
                            refresh_import();
                            $modalInstance.close();
                           
                            
                        });
                      
                        $scope.$on('$fileUploadError', function(e,error){
                           $scope.error = error;
                        });
                      
                      
					}],
				  size: "lg",
				  resolve: {
					parentScope: function () {
					  return $scope;
					}
					
				  }
				});
            }
			$scope.import = function(){
				var url = "#"+code+"/import?t=1";
				if(input.initImport){
					input.initImport($scope,url,function(error,url){
						if(error) return $window.alert(error);
						var time =0;
						var w = $window.open(url,"Import","directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=500,height=200");
						stop = $interval(function(){
							if(w.document.title=='OK'){
								$scope.search();
								$interval.cancel(stop);
								stop=undefined;
								w.close();
								return;
							}
							if(w.document.title=='ERROR'){
								$interval.cancel(stop);
								stop=undefined;
								return;
							}
							time = time + 500;
							if(time>5*60*1000 && stop){
								$interval.cancel(stop);
								stop=undefined;
							}
						},500);
					})
				}else{
						var time =0;
						var w = $window.open(url,"Import","directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=500,height=200");
						stop = $interval(function(){
							if(w.document.title=='OK'){
								$scope.search();
								$interval.cancel(stop);
								stop=undefined;
								w.close();
								return;
							}
							if(w.document.title=='ERROR'){
								$interval.cancel(stop);
								stop=undefined;
								return;
							}
							time = time + 500;
							if(time>5*60*1000 && stop){
								$interval.cancel(stop);
								stop=undefined;
							}
						},500);
				}
				
			}
			
			//follow
			$scope.follow = function(r){
				if(r.follow_yn==1){
					//unfollow
					$http.delete(server_url + "/api/" + id_app + "/follow/" + r.followObject._id)
					.success(function(rs){
						r.follow_yn =0;
					}).error(function(e){
						if(e) $window.alert(e);
					})
					
				}else{
					//follow
					followObject = {id_object:r._id,collection_name:code,id_app:id_app};
					$http.post(server_url + "/api/" + id_app + "/follow",followObject)
					.success(function(rs){
						r.followObject =rs;
						r.follow_yn =1;
					}).error(function(e){
						if(e) $window.alert(e);
					})
				}
			}
			//like
			$scope.isLike = false;
            if(id_app){
                $http.get(server_url + "/api/" + id_app +"/like_module?q={module:'" + code + "',user_created:'" + userinfo.email + "'}")
                    .success(function(rs){
                        if(rs && rs.length==1){
                            $scope.isLike = rs[0].like;
                        }
                    })
                    .error(function(e){
                        console.log(e);
                    })
                $scope.like = function(){
                    var url =server_url + "/api/" + id_app +"/like_module";
                    $http.post(url,{id_app:id_app,module:code,like:true}).success(function(rs){
                        if(rs){
                            $scope.isLike = true;
                        }
                    }).error(function(e){
                        console.log(e)
                    })
                }
                $scope.unlike = function(){
                    var url =server_url + "/api/" + id_app +"/like_module";
                    $http.post(url,{id_app:id_app,module:code,like:false}).success(function(rs){
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
					$scope.search();
					return;
				}
				//add
				if(event.ctrlKey ){
					if(event.which==77){
						$scope.add()
						return;
					}
				}
				//delete
				if(event.ctrlKey ){
					if(event.which==68){
						$scope.delete()
						return;
					}
				}
				//select all
				if(event.ctrlKey ){
					if(event.which==65){
						if($scope.list){
							$scope.list.forEach(function(r){
								r.sel = true;
							})
						}
					}
				}
				//unselect all
				if(event.ctrlKey ){
					if(event.which==85){
						if($scope.list){
							$scope.list.forEach(function(r){
								r.sel = false;
							})
						}
					}
				}
			})
			$scope.options = function(){
				token = $rootScope.token;
				var modalInstance = $modal.open({
				  templateUrl:"templates/" + input.group + "/" + code + '/templates/options.html',
				  controller:  ['$scope','$controller','$http', '$modalInstance','$window',function($scope,$controller,$http, $modalInstance,$window){
						var url = server_url + "/api/" + id_app + "/options";
						var options={}
						$http.get(url + "?access_token=" + token +  "&q={id_func:'" + code + "'}").success(function(opt){
							if(opt.length==1){
								options = opt[0]
								$scope.options = options.option;
							
							}else{
								options.id_app = id_app
								options.id_func = code
							}
							
						}).error(function(e){
							console.log(url)
						})
						$scope.save = function(){
							options.option = $scope.options
							
							if(!options._id){
								$http.post(url + "?access_token=" + token,options).success(function(d){
									$modalInstance.close();
								}).error(function(e){
									alert("Không thể lưu tùy chọn\n" + e.toString())
								})
							}else{
								$http.put(url + "/" + options._id + "?access_token=" + token,options).success(function(d){
									$modalInstance.close();
								}).error(function(e){
									alert("Không thể cập nhật tùy chọn\n" + e.toString())
								})
							}
							
						}
						
						$scope.cancel = function () {
							$modalInstance.dismiss('cancel');
						}
					}],
				  size: "lg",
				  resolve: {
					/*parentScope: function () {
					  return $scope;
					}
					*/
				  }
				});
			}
		});
	}]);
	this.module.directive(code + "Form",[function(){
		return {
			restrict:'E',
			templateUrl:"templates/" + input.group + "/" + code + "/templates/form.html"
		};
	}]);
	this.module.controller(code + 'ImportController',['$scope','$rootScope','$location','$routeParams',code + 'Config','appInfo',function($scope,$rootScope,$location,$routeParams,config,appInfo){
		appInfo.info(code,function(error,userinfo,appinfo){
			if(error) return;
			var token = $rootScope.token;
			$rootScope.hide_nav = true;
			$scope.action = server_url + "/api/" + id_app + "/" + input.server_path + "/import/excel?access_token=" + token;
			$scope.template = "templates/templates/" + input.code + ".xlsx"
			var queryParams = $location.search();
			if(queryParams.values){
				$scope.action = $scope.action + "&values=" + queryParams.values;
			}
			if(queryParams.update){
				$scope.action = $scope.action + "&update=" + queryParams.update;
			}
		})
	}]);
	this.module.controller(code + "AddController",['$controller','$scope','$http',code,'$location',code + 'Config','$rootScope','$modal','$window','appInfo',function($controller,$scope,$http,service,$location,config,$rootScope,$modal,$window,appInfo){
		$scope.masterData = {status:true};
		$scope.data = {status:true,visible_to:0};
        $scope.$modal = $modal;
		$scope.$http = $http;
		$scope.$window = $window;
        
        if(input.defaultValues){
            _.extend($scope.data,input.defaultValues);
            _.extend($scope.masterData,input.defaultValues);
        }
        var paras = $location.search();
        if(paras){
            _.extend($scope.data,paras);
            _.extend($scope.masterData,paras);
        }
        if(input.init){
            input.init($scope,$controller);
        }
        $scope.action="Thêm mới";
        appInfo.info(code,function(error,userinfo,appinfo){
            if(!error){
                $scope.current_user = $rootScope.user;
                $scope.isDataLoaded = true;
                angular.extend($scope,config);
                //get options
                var url_options = server_url + "/api/" + id_app + "/options";
                $http.get(url_options + "?access_token=" + $rootScope.token +  "&q={id_func:'" + code + "'}").success(function(opt){
                    if(opt.length==1){
                       var  ext_options = opt[0];
                        $scope.ext_options = ext_options.option;

                        $scope.data.options = $scope.ext_options;
                        $scope.masterData.options = $scope.ext_options;
                        _.extend($scope.data,$scope.ext_options);
                        _.extend($scope.masterData,$scope.ext_options);
                     }
                    //
                 }).error(function(e){
                    console.log(url);
                });
                //end options
                if(options.onAdd){
                    $rootScope.nextTick(function(){
                        options.onAdd($scope,{$controller:$controller,$rootScope:$rootScope,$http:$http,service:service,$location:$location,config:config,$window:$window,$modal:$modal});
                    })

                }
                $scope.reset = function(){
                    $scope.data=angular.copy($scope.masterData);
                }
                $scope.cancel=function(){
                    var redirect = $location.search().redirect;
                    if(redirect){
                        if(redirect=="back"){
                            $window.history.back();
                        }else{
                            $location.url(redirect)
                        }

                    }else{
                        //$location.url("/" + $scope.path);
                        $window.history.back();
                        //$window.scrollTo(0, 0);
                    }
                }
                $scope.isUnchanged = function(){
                    return angular.equals($scope.data,$scope.masterData);
                }
                var save = function(){
                    $scope.$emit("$dataSaveStart")
                    service.create(id_app,$scope.data)
                        .success(function(data){
                            $scope.masterData=data;
                            if(!config.list){
                                config.list =[];
                            }
                            config.list.push($scope.masterData);
                            var redirect = $location.search().redirect;
                            if(redirect){
                                if(redirect=="back"){
                                    $window.history.back();
                                }else{
                                    $location.url(redirect)
                                }

                            }else{
                                if(options.has_view){
                                    $location.url("/" + $scope.path + "/view/" + data._id);
                                }else{
                                    $location.path("/" + $scope.path);
                                }

                                //$window.scrollTo(0, 0);
                            }
                            $scope.$emit("$dataSaveSuccess")
                        })
                        .error(function(error){
                            $scope.$emit("$dataSaveError")
                            var msg =error;
                            if(msg.indexOf("Lỗi")<0){
                                if(msg.indexOf("duplicate")>=0){
                                    msg ="Lỗi: Đã tồn tại";
                                }else{
                                    if(msg.indexOf("Not allowed")>=0){
                                        msg ="Lỗi: Bạn không có quyền thực hiện thao tác này";
                                    }
                                }
                            }

                            if(angular.isArray(msg)){
                                alert(msg.join("\n"));
                            }else{
                                alert(msg);
                            }

                        });
                }
                $scope.create = function(){
                    if(options.onSave){
                        options.onSave($scope,$scope.data,{action:'CREATE',$controller:$controller,$rootScope:$rootScope,$http:$http,service:service,$location:$location,config:config,$window:$window,$modal:$modal},function(e,rs){
                            if(e) return $window.alert(e);
                            if(rs){
                                save();
                            }
                        })
                    }else{
                        save();
                    }

                }
                //shortcuts
                $scope.$on('keydown',function(onEvent,event){
                    /*if(event.which==27){
                        if(window.confirm("Bạn có chắc chắn hủy không?")){
                            $scope.cancel();
                        }
                        return;
                    }*/		
                    if(event.ctrlKey ){
                        if(event.which==83){
                            $scope.create();
                        }
                    }
                })
                //init add controller
                if(input.initAddController){
                    input.initAddController($controller,$scope,$http,service,$location,config);
                }
            }
        });
           
       
	}])
	this.quickadd = function($modal,fn,defaultvalues){
		var modalInstance = $modal.open({
		  templateUrl:"templates/" + input.group + "/" + code + '/templates/dialog-quickadd.html',
		  controller:  ['$scope','$controller','$http',code,'$location',code + 'Config', '$modalInstance','$window','$rootScope',function($scope,$controller,$http,service,$location,config, $modalInstance,$window,$rootScope){
				$scope.masterData = {status:true};
				$scope.data = {status:true,visible_to:0};
				
				$scope.isDataLoaded = true;
				$scope.$modal = $modal;
				$scope.$http = $http;
				$scope.$window = $window;
				$scope.action ="Thêm mới";
              
                //get options
                var url = server_url + "/api/" + id_app + "/options";
                $http.get(url + "?access_token=" + $rootScope.token +  "&q={id_func:'" + code + "'}").success(function(opt){
                    if(opt.length==1){
                        var  ext_options = opt[0];
                        $scope.ext_options = ext_options.option;

                        $scope.data.options = $scope.ext_options;
                        $scope.masterData.options = $scope.ext_options;
                        _.extend($scope.data,$scope.ext_options);
                        _.extend($scope.masterData,$scope.ext_options);
                    }
                }).error(function(e){
                    console.log(url);
                });
                //
				if(input.init){
					input.init($scope,$controller);
				}
				if(input.defaultValues){
					_.extend($scope.data,input.defaultValues);	
				}
				
				if(defaultvalues){
					for(var k in defaultvalues){
						$scope.data[k] = defaultvalues[k];
					}
				}
				
				var paras = $location.search();
				if(paras){
					_.extend($scope.data,paras);
					_.extend($scope.masterData,paras);
				}
		
				angular.extend($scope,config);
				
				if(input.initAddController){
					input.initAddController($controller,$scope,$http,service,$location,config);
				}
				$scope.isUnchanged = function(){
					return angular.equals($scope.data,$scope.masterData);
				}
				if(options.onAdd){
					$rootScope.nextTick(function(){
						options.onAdd($scope,{$controller:$controller,$rootScope:$rootScope,$http:$http,service:service,$location:$location,config:config,$window:$window,$modal:$modal});
					})
					
				}
				var save =function(){
					$scope.$emit("$dataSaveStart")
					service.create(id_app,$scope.data)
						.success(function(data){
							$scope.masterData=data;
							if(!config.list){
								config.list =[];
							}
							config.list.push($scope.masterData);
							if(fn){
								fn($scope.masterData);
							}
							$modalInstance.close();
							$scope.$emit("$dataSaveSuccess")
						})
						.error(function(data){
							$scope.$emit("$dataSaveError")
							var msg =data;
							if(msg.indexOf("Lỗi")<0){
								if(msg.indexOf("duplicate")>=0){
									msg ="Lỗi: Đã tồn tại";
								}else{
									if(msg.indexOf("Not allowed")>=0){
										msg ="Lỗi: Bạn không có quyền thực hiện thao tác này";
									}
								}
							}
							if(angular.isArray(msg)){
								alert(msg.join("\n"));
							}else{
								alert(msg);
							}
							
						});
				}
				$scope.create = function(){
					if(options.onSave){
						options.onSave($scope,$scope.data,{action:'CREATE',$controller:$controller,$rootScope:$rootScope,$http:$http,service:service,$location:$location,config:config,$window:$window,$modal:$modal},function(e,rs){
							if(e) return $window.alert(e);
							if(rs){
								save();
							}
						})
					}else{
						save();
					}
				}
				
				$scope.cancel = function () {
					$modalInstance.dismiss('cancel');
				}
				//shortcuts
				/*$scope.$on('keydown',function(onEvent,event){
					if(event.which==27){
						$scope.cancel();
						return;
					}		
					if(event.ctrlKey ){
						if(event.which==83){
							$scope.create();
						}
					}
				})
				*/
			}],
		  size: "lg",
		  backdrop :'static',
		  resolve: {
			/*parentScope: function () {
			  return $scope;
			}
			*/
		  }
		});
	}
	this.quickedit = function($modal,id,fn){
			var modalInstance = $modal.open({
			  templateUrl:"templates/" + input.group + "/" + code + '/templates/dialog-quickadd.html',
			  controller:  ['$scope','$controller','$http',code,'$location',code + 'Config', '$modalInstance','$window','$routeParams','$timeout','$rootScope',function($scope,$controller,$http,service,$location,config, $modalInstance,$window,$routeParams,$timeout,$rootScope){
					$scope.data={}
					if(input.init){
						input.init($scope,$controller);
					}
					$rootScope.nextTick(function(){
						service.get(id_app,id)
						.success(function(data){
							if(!data){
								$window.alert("Đối tượng này không tồn tại\nid:" + id);
								$modalInstance.dismiss('cancel');
								return;
							}
							$scope.masterData = data;
							_.extend($scope.data,data);
							$scope.$modal = $modal;
							$scope.$http = $http;
							$scope.$window = $window;
							$scope.action="Sửa";
							if(input.loadItem){
								input.loadItem($scope,$scope.data);
							}
							$timeout(function(){
								$scope.isDataLoaded = true;
							},100);
							angular.extend($scope,config);
							$scope.isUnchanged = function(){
								return angular.equals($scope.data,$scope.masterData);
							}
							if(options.onEdit){
								$rootScope.nextTick(function(){
									options.onEdit($scope,{$controller:$controller,$rootScope:$rootScope,$http:$http,service:service,$location:$location,config:config,$window:$window,$modal:$modal});
								})
								
							}
							var save = function(){
								$scope.$emit("$dataSaveStart")
								service.update(id_app,id,$scope.data)
								.success(function(data){
									for(var key in data){
										$scope.masterData[key] = data[key];
									}
									if(fn){
										fn($scope.masterData);
									}
									$modalInstance.close();
									$scope.$emit("$dataSaveSuccess")
								})
								.error(function(error){
									$scope.$emit("$dataSaveError")
									var msg =JSON.stringify(error);
									if(msg.indexOf("Lỗi")<0){
										if(msg.indexOf("duplicate")>=0){
											msg ="Lỗi: Đã tồn tại";
											return alert(msg);
										}else{
											if(msg.indexOf("Not allowed")>=0){
												msg ="Lỗi: Bạn không có quyền thực hiện thao tác này";
												return alert(msg);
											}
										}
										
									}
									msg = JSON.parse(msg);
									if(angular.isArray(msg)){
										alert(msg.join("\n"));
									}else{
										alert(msg);
									}
								});
							}
							$scope.create = function(){
								if(options.onSave){
									options.onSave($scope,$scope.data,{action:'UPDATE',$controller:$controller,$rootScope:$rootScope,$http:$http,service:service,$location:$location,config:config,$window:$window,$modal:$modal},function(e,rs){
										if(e) return $window.alert(e);
										if(rs){
											save();
										}
									})
								}else{
									save();
								}
							}
							
							$scope.cancel = function () {
								$modalInstance.dismiss('cancel');
							}
							//shortcuts
							/*$scope.$on('keydown',function(onEvent,event){
								if(event.which==27){
									$scope.cancel();
									return;
								}		
								if(event.ctrlKey ){
									if(event.which==83){
										$scope.create();
									}
								}
							})*/
							//init edit controller
							if(input.initEditController){
								input.initEditController($controller,$scope,$http,service,$location,$routeParams,config,$timeout);
							}
						}).error(function(data){
							if(data.indexOf("Lỗi")>=0){
								alert(data);
							}else{
								alert("Không thể tìm thấy đối tượng này");
							}
							$modalInstance.dismiss('cancel');
						});
					})	
				}],
			  size: "lg",
			  backdrop :'static',
			  resolve: {
				/*parentScope: function () {
				  return $scope;
				}
				*/
			  }
			});
			
		}
	this.module.controller(code + "EditController",['$controller','$scope','$http',code,'$location','$routeParams',code + 'Config','$timeout','$rootScope','$modal','$window','appInfo',function($controller,$scope,$http,service,$location,$routeParams,config,$timeout,$rootScope,$modal,$window,appInfo){
		$scope.masterData = null;
		$scope.data = {};
		$scope.$modal = $modal;
		$scope.$http = $http;
		$scope.$window = $window;
		$scope.action="Sửa";
		angular.extend($scope,config);
		if(input.init){
			input.init($scope,$controller);
		}
		//check id app
		appInfo.info(code,function(error,userinfo,appinfo){
			if(!error){
				$scope.current_user = $rootScope.user;
				if(config.list){
					$scope.masterData = _.find(config.list,function(r){return r._id==$routeParams.id});
				}
				$scope.openProfile = function(email){
					viewProfile($modal,email);
				}
				if(!$scope.masterData){
					$scope.masterData ={};
					$rootScope.nextTick(function(){
						$scope.$emit("$dataChangeStart")
						service.get(id_app,$routeParams.id)
						.success(function(data){
							
							$scope.masterData = data;
							$scope.data = angular.copy($scope.masterData);
							if(!config.list) config.list =[];
							config.list.push($scope.masterData);
							if(input.loadItem){
								input.loadItem($scope,$scope.data);
							}
							if(options.onEdit){
								$rootScope.nextTick(function(){
									options.onEdit($scope,{$controller:$controller,$rootScope:$rootScope,$http:$http,service:service,$location:$location,config:config,$window:$window,$modal:$modal});
								})
							}
							$timeout(function(){
								$scope.isDataLoaded = true;
								$scope.$emit("$dataChangeSuccess")
							},100);
							
						})
						.error(function(data){
							$scope.$emit("$dataChangeError")
							if(data.indexOf("Lỗi")>=0){
								alert(data);
							}else{
								alert("Không thể tìm thấy đối tượng này");
							}
						});
					})
					
				}else{
					$scope.data = angular.copy($scope.masterData);
					if(input.loadItem){
						input.loadItem($scope,$scope.data);
					}
					if(options.onEdit){
						$rootScope.nextTick(function(){
							options.onEdit($scope,{$controller:$controller,$http:$http,service:service,$location:$location,config:config,$window:$window,$modal:$modal});
						})
						
					}
					$timeout(function(){
						$scope.isDataLoaded = true;
					},100);
				}
				
				$scope.isUnchanged = function(){
					return angular.equals($scope.data,$scope.masterData);
				}
				$scope.reset = function(){
					$scope.data=angular.copy($scope.masterData);
				}
				$scope.cancel=function(){
					var redirect = $location.search().redirect;
					if(redirect){
						if(redirect=="back"){
							$window.history.back();
						}else{
							$location.url(redirect)
						}
					}else{
						if(options.has_view){
							$location.url("/" + $scope.path + "/view/" + $scope.data._id);
						}else{
							//$location.url("/" + $scope.path);
                            $window.history.back();
						}
						
					}
					
				}
				//shortcuts
				$scope.$on('keydown',function(onEvent,event){
					/*if(event.which==27){
						if(window.confirm("Bạn có chắc chắn hủy không?")){
							$scope.cancel();
						}
						return;
					}*/		
					if(event.ctrlKey ){
						if(event.which==83){
							$scope.create();
						}
					}
				})
				
				var save = function(){
					$scope.$emit("$dataSaveStart")
					service.update(id_app,$routeParams.id,$scope.data)
						.success(function(data){
							for(var key in data){
								$scope.masterData[key] = data[key];
							}
							var redirect = $location.search().redirect;
							if(redirect){
								if(redirect=="back"){
									$window.history.back();
								}else{
									$location.url(redirect)
								}
							}else{
								if(options.has_view){
									$location.url("/" + $scope.path + "/view/" + data._id);
								}else{
									$location.path("/" + $scope.path);
								}
								
							}
							$scope.$emit("$dataSaveSuccess")
						})
						.error(function(error){
							$scope.$emit("$dataSaveError")
							var msg =JSON.stringify(error);
							if(msg.indexOf("Lỗi")<0){
								if(msg.indexOf("duplicate")>=0){
									msg ="Lỗi: Đã tồn tại";
									return alert(msg);
								}else{
									if(msg.indexOf("Not allowed")>=0){
										msg ="Lỗi: Bạn không có quyền thực hiện thao tác này";
										return alert(msg);
									}
								}
								
							}
							msg = JSON.parse(msg);
							if(angular.isArray(msg)){
								alert(msg.join("\n"));
							}else{
								alert(msg);
							}
						});
				}
				$scope.create = function(){
					if(options.onSave){
						options.onSave($scope,$scope.data,{action:'UPDATE',$controller:$controller,$rootScope:$rootScope,$http:$http,service:service,$location:$location,config:config,$window:$window,$modal:$modal},function(e,rs){
							if(e) return $window.alert(e);
							if(rs){
								save();
							}
						})
					}else{
						save();
					}
				}
				//init edit controller
				if(input.initEditController){
					input.initEditController($controller,$scope,$http,service,$location,$routeParams,config,$timeout);
				}
			}
		});
	}]);
	this.module.controller(code + 'ViewController',['$controller','$scope','$routeParams',code + 'Config',code,'$rootScope','$location','$window','$http','$modal','appInfo','$localStorage','$interval'
		,function($controller,$scope,$routeParams,config,service,$rootScope,$location,$window,$http,$modal,appInfo,$localStorage,$interval){
		appInfo.info(code,function(error,userinfo,appinfo){
			if(!error){
				$scope.code = code;
				$scope.location = $location.url();
				$scope.current_user = $rootScope.user;
				$scope.action="Xem";
				$scope.current_record=0;
				$scope.total_records =0;
				
				angular.extend($scope,config);
				var loadItem = function(){
					$rootScope.nextTick(function(){
						$scope.$emit("$dataChangeStart")
						service.get(id_app,$routeParams.id).success(function(d){
							$scope.data = d;
							$scope.data.links =[]
							if(id_app){
								$http.get(server_url + "/api/" + id_app + "/follow?q={id_object:'" + d._id + "',user_created:'" + $scope.current_user.email + "'}")
								.success(function(rs){
									if(rs && rs.length>0){
										d.followObject = rs[0];
										d.follow_yn = 1;
									}else{
										d.follow_yn = 0;
									}
								}).error(function(e){
									d.follow_yn = 0;
								})
							}
							
							if(options.onView){
								options.onView($scope,{$controller:$controller,$http:$http,service:service,$location:$location,config:config,$window:$window,$modal:$modal,$rootScope:$rootScope,$localStorage:$localStorage,$interval:$interval});
							}
							$scope.$emit("$dataChangeSuccess")
						}).error(function(e){
							if(e) alert(e)
							$scope.$emit("$dataChangeError")
							$location.url("/" + $scope.path);
						});
					})
				}
				if($scope.list){
					for(var i=0;i<$scope.list.length;i++){
						if($scope.list[i]._id==$routeParams.id){
							$scope.current_record=i;
							$scope.total_records = $scope.list.length-1;
							$scope.data = $scope.list[$scope.current_record];
							$scope.data.links =[];
							if(options.onView){
								options.onView($scope,{$controller:$controller,$http:$http,service:service,$location:$location,config:config,$window:$window,$modal:$modal,$rootScope:$rootScope,$localStorage:$localStorage,$interval:$interval});
							}
							break;
						}
					}
				}
				if(!$scope.data){
					loadItem();
					
				}
				
				$scope.back = function(){
					var redirect = $location.search().redirect;
					if(redirect){
						if(redirect=="back"){
							$window.history.back();
						}else{
							$location.url(redirect)
						}
					}else{
						$location.url("/" + $scope.path);
					}
				}
				$scope.update = function(data,callback){
					var obj = {}
					_.extend(obj,$scope.data);
					
					if(data){
						_.extend(obj,data);
					}
					service.update(id_app,$scope.data._id,obj).success(function(rs){
						_.extend($scope.data,rs);
						if(callback){
							callback(null,rs);
						}
					}).error(function(e){
						if(callback){
							callback(e);
						}else{
							if(e) $window.alert(e);
						}
						
					})
				}
				$scope.edit = function(){
					$location.url("/" + code + "/edit/" + $routeParams.id);
				}
				$scope.add = function(){
					var url ="/" + $scope.path + "/add";
					$location.path(url);
				}
				$scope.backRecord = function(){
					if($scope.current_record>0){
						$scope.current_record = $scope.current_record-1;
						var id = $scope.list[$scope.current_record]._id;
						$location.path(code + "/view/" + id);
					}
				}
				$scope.nextRecord = function(){
					if($scope.list && $scope.current_record<$scope.total_records){
						$scope.current_record = $scope.current_record+1;
						var id = $scope.list[$scope.current_record]._id;
						$location.path(code + "/view/" + id);
					}
				}
				$scope.delete = function(_id){
					if(confirm("Có chắc chắn xóa không?")){
						service.delete(id_app,_id)
							.success(function(data){
								config.list = _.reject(config.list,function(r){
									return(r._id ==_id);
								});
								var redirect = $location.search().redirect;
								if(redirect){
									if(redirect=="back"){
										$window.history.back();
									}else{
										$location.url(redirect)
									}
								}else{
									$location.url("/" + $scope.path);
								}
							})
							.error(function(error){
								var e;
								if(_.isObject(error)){
									e = JSON.stringify(error);
								}else{
									e = error;
								}
								
								if(e.indexOf("Lỗi:")>=0){
									alert(e)
								}else{
									alert("Không thể xóa");
								}
							});
					}
				}
				$scope.openProfile = function(email){
					viewProfile($modal,email)
				}
				//follow
				$scope.follow = function(){
					if($scope.data.follow_yn==1){
						//unfollow
						$http.delete(server_url + "/api/" + id_app + "/follow/" + $scope.data.followObject._id)
						.success(function(rs){
							$scope.data.follow_yn =0;
						}).error(function(e){
							if(e) $window.alert(e);
						})
						
					}else{
						//follow
						followObject = {id_object:$scope.data._id,collection_name:code,id_app:id_app};
						$http.post(server_url + "/api/" + id_app + "/follow",followObject)
						.success(function(rs){
							$scope.data.followObject= rs;
							$scope.data.follow_yn =1;
						}).error(function(e){
							if(e) $window.alert(e);
						})
					}
				}
				//shortcuts
				$scope.$on('keydown',function(onEvent,event){	
					//refresh
					if(event.which==116){
						loadItem();
						return;
					}
					if(event.ctrlKey ){
						//edit
						if(event.which==69){
							$scope.edit()
							return;
						}
						//add
						if(event.which==77){
							$scope.add()
							return;
						}
					}
				})
				//links
				
				$scope.addLink = function(obj,field_title){
					var obj_link = {}
					obj_link.id_a = $scope.data._id;
					obj_link.collection_a = code;
					
					obj_link.collection_b = obj.collection_name;
					obj_link.id_b = obj._id;
					
					var url =server_url + "/api/" + id_app + "/link";
					$http.post(url,obj_link).success(function(rs){
						_.extend(obj_link,rs);
						obj_link.obj = obj;
						obj_link.collection_obj =obj.collection_name;
						obj_link.title = obj[field_title];
						$scope.data.links.push(obj_link);
					}).error(function(e){
						console.log(e);
						var query_f ={id_a:obj_link.id_a,id_b:obj_link.id_b};
						$http.get(server_url + "/api/" + id_app + "/link?q=" + JSON.stringify(query_f)).success(function(rs){
							if(rs.length>0){
								_.extend(obj_link,rs[0]);
								obj_link.obj = obj;
								obj_link.collection_obj =obj.collection_name;
								obj_link.title = obj[field_title];
								$scope.data.links.push(obj_link);
							}
							
						}).error(function(e){
							console.error(e)
						})
					})
					
				}
			}
		});
		
	}]);
	
	//router
	this.module.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider){
		$routeProvider
			.when("/" + code,{
				templateUrl:"templates/" + input.group + "/" + code + "/templates/list.html",
				controller:code + "HomeController"
			})
			.when("/"+code+"/add",{
				templateUrl:"templates/" + input.group + "/" + code + "/templates/edit.html",
				controller:code + "AddController"
			})
			.when("/"+code+"/json",{
				templateUrl:"templates/sys/json.html",
				controller:code + "JsonController"
			})
			.when("/"+code+"/import",{
				templateUrl:"templates/sys/import.html",
				controller:code + "ImportController"
			})
			.when("/"+ code +"/edit/:id",{
				templateUrl:"templates/" + input.group + "/" + code + "/templates/edit.html",
				controller:code + "EditController"
			})
			.when("/"+ code +"/view/:id",{
				templateUrl:"templates/" + input.group + "/" + code + "/templates/view.html",
				controller:code + "ViewController"
			});
		
	}]);
	//init module
	if(this.initModule){
		this.initModule(this.module);
	}
}