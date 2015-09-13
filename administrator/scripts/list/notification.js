var notificationModule = new baseInput('notification','notification',["email_owner","email_sender","email_receiver","content","title"],'Thông báo',{
	onView:function($scope,options){
		var us = $scope.data.content.split('#');
		if(us.length>1){
				$scope.data.content = "#" + us[1];
		}
		
		if(!$scope.data.read){
			options.service.update(id_app,$scope.data._id,{_id:$scope.data._id,read:true}).success(function(r){
				$scope.data.read = true;
			}).error(function(e){
				console.log(e)
			})
		}
		$scope.condition ={read:false}
		$scope.filter = function(c){
			options.$rootScope.nextTick(function(){
				$scope.$emit("$dataChangeStart")
				options.service.load(id_app,{condition:$scope.condition,limit:50}).success(function(notifications){
					$scope.notifications = notifications;
					$scope.$emit("$dataChangeSuccess")
				}).error(function(e){
					$scope.$emit("$dataChangeError")
				})
			})
		}
		$scope.filter();
		$scope.viewNotification=function(t){
			$scope.data = t;
			$scope.notifications = _.reject($scope.notifications,function(m){
				return m._id==t._id;
			})
		}
		$scope.delete = function(no){
			if(confirm("Bạn có chắc chắn xóa ghi chú này không?")){
				options.service.delete(id_app,no._id).success(function(e){
					$scope.notifications = _.reject($scope.notifications,function(m){
							return m._id==no._id;
						})
				}).error(function(e){
					alert(e);
				})
			}
			
		}
		$scope.markRead = function(no){
			no.read = true;
			options.service.update(id_app,no._id,{_id:no._id,read:true}).success(function(e){
				$scope.notifications = _.reject($scope.notifications,function(m){
						return m._id==no._id;
					})
			}).error(function(e){
				alert(e);
			})
			
		}
		
	}
});
notificationModule.module.factory('notification',['$http',function($http){
	fields_find =["email_receiver","email_owner","email_sender","content","title"];
	var s =  {
		list:function(id_app,condition,fields,count,page,limit){
				var url =server_url + "/api/notification?t=1" ;
				if(count==1){
					url = url + "&count=1";
				}
				if(page){
					url = url + "&page=" + page.toString();
				}
				if(limit){
					url = url + "&limit=" + limit.toString();
				}
				if(angular.isObject(condition)){
					var q =JSON.stringify(condition);
					
					url = url + "&q=" + q;
				}else{
					if(!(!condition || condition.trim()=="" || !fields_find || fields_find.length==0)){
					
						var query = "";
						fields_find.forEach(function(field){
							if(query==""){
								query = field + "=" + condition;
							}else{
								query =query + "&" +  field + "=" + condition;
							}
						});
						if(query!=""){
							url = url + "&" + query;
						}
						
					}
				}
				if(fields){
					url = url + "&fields=" + fields;
				}
				return $http.get(url);
				
			},
			get:function(id_app,id){
				return $http.get(server_url + "/api/notification/" + id );
			},
			create:function(id_app,data){
				return $http.post(server_url + "/api/notification",data);
			},
			update:function(id_app,id,data){
				return $http.put(server_url + "/api/notification/" + id,data);
			},
			delete:function(id_app,id){
				return $http.delete(server_url + "/api/notification/" + id );
			},
			active:function(id){
				return $http.get(server_url + "/api/notification/active/" + id );
			},
			notaccept:function(id){
				return $http.get(server_url + "/api/notification/notaccept/" + id );
			}
	}
	s.load = function(id_app,options){
		if(options){
			return s.list(id_app,options.condition,options.fields,options.count,options.page,options.limit)
		}else{
			return s.list(id_app);
		}
		
	}
	return s;
}]);
notificationModule.module.directive("dbNotify",function(){
	return {
		restrict:'E',
		scope:{
		},
		templateUrl:"templates/lists/notification/templates/db.html",
		controller:['$scope','notification','$rootScope','$location','$modal','socket','appInfo','nodeWebkit',function($scope,notification,$rootScope,$location,$modal,socket,appInfo,nodeWebkit){
			appInfo.info("notification",function(error,uerinfo,appinfo){
				if(error){
					return;
				}
				$scope.notifications=[]
				$scope.now = new Date();
				$scope.token = $rootScope.token;
				$scope.server_url = server_url;
				$scope.app_info = $rootScope.app_info;
				$scope.condition ={read:false}
				$scope.filter = function(c){
					$rootScope.nextTick(function(){
						$scope.$emit("$dataChangeStart")
						notification.load(id_app,{condition:$scope.condition,limit:10}).success(function(notifications){
							$scope.notifications = notifications;
							$scope.$emit("$dataChangeSuccess")
						}).error(function(e){
							$scope.$emit("$dataChangeError")
						})
					})
				}
				$scope.viewNotification=function(t){
					$location.url("notification/view/" + t._id + "?redirect=dashboard")
				}
				$scope.delete = function(no){
					if(confirm("Bạn có chắc chắn xóa ghi chú này không?")){
						notification.delete(id_app,no._id).success(function(e){
							$scope.notifications = _.reject($scope.notifications,function(m){
									return m._id==no._id;
								})
						}).error(function(e){
							alert(e);
						})
					}
					
				}
				$scope.markRead = function(no){
					no.read = true;
					notification.update(id_app,no._id,no).success(function(e){
						$scope.notifications = _.reject($scope.notifications,function(m){
								return m._id==no._id;
							})
					}).error(function(e){
						alert(e);
					})
					
				}
				
				socket.on('notify:new',function(_id) {
					notification.get(id_app,_id).success(function(notify){
						var c = _.find($scope.notifications,function(n){
							return n._id == _id;
						})
						if(!c){
							notify.is_new = true;
							$scope.notifications.push(notify)
                           // nodeWebkit.notification("Bạn có thông báo mới")
						}
						
					}).error(function(e){
						console.error("Can't get notification\n" + e)
					})
					
				})
				$scope.filter({});
			})
			
		}],
		link:function($scope,elem,attrs,controller){
		}
	}
});