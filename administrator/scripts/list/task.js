var taskModule = new baseInput('task','task',["ten_cv","mieu_ta","location","phu_trach"],'Công việc',{
	has_view:true,
	onAdd:function($scope,options){
		$scope.data.phu_trach = options.$rootScope.user.email;
		$scope.data.attends =[$scope.data.phu_trach];
		$scope.data.start_date = new Date();
		$scope.data.repeat =0;
		$scope.data.priority =1;
		$scope.data.progress =0;
        $scope.data.visible_to =1;
        
        $scope.repeats =[
            {id:0,name:'Không lặp lại'},
            {id:1,name:'Hàng ngày'},
            {id:2,name:'Hàng tháng'},
            {id:3,name:'Hàng quý'},
            {id:4,name:'Hàng năm'}
        ]
	},
	onEdit:function($scope,options){
		$scope.repeats =[
            {id:0,name:'Không lặp lại'},
            {id:1,name:'Hàng ngày'},
            {id:2,name:'Hàng tháng'},
            {id:3,name:'Hàng quý'},
            {id:4,name:'Hàng năm'}
        ]
	},
	onView:function($scope,options){
		$scope.data.attendInfos =[]
        if($scope.data.start_date){
            $scope.data.start_date= new Date($scope.data.start_date);
        }
        if($scope.data.due_date){
            $scope.data.due_date= new Date($scope.data.due_date);
        }
		if($scope.data.attends){
			$scope.data.attends.forEach(function(attend){
				var m = _.find(options.$rootScope.members,function(m){
					return m.email==attend;
				})
				if(m) $scope.data.attendInfos.push(m)
			})
		}
		$scope.complete = function(){
			$scope.data.progress=2;
			options.service.update(id_app,$scope.data._id,$scope.data)
				.success(function(rs){
					
				}).error(function(e){
					if(e) options.$window.alert(e)
				})
		}
		
		
		$scope.addContact = function(){
			lienheModule.quickadd(options.$modal,function(rs){
				rs.collection_name ="lienhe";
				$scope.addLink(rs,'ten_lien_he')
			})
			
		}
		$scope.addCustomer = function(){
			dmkhModule.quickadd(options.$modal,function(rs){
				rs.collection_name ="dmkh";
				$scope.addLink(rs,'ten_kh');
				if(!$scope.data.id_kh){
					$scope.data.id_kh = rs._id;
					options.service.update(id_app,$scope.data._id,$scope.data).success(function(t){
						_.extend($scope.data,t);
					})
				}
			})
			
		}
		$scope.addProject = function(){
			dmdtModule.quickadd(options.$modal,function(rs){
				rs.collection_name ="dmdt";
				$scope.addLink(rs,'ten_dt');
				if(!$scope.data.id_dt){
					$scope.data.id_dt = rs._id;
					options.service.update(id_app,$scope.data._id,$scope.data).success(function(t){
						_.extend($scope.data,t);
					})
				}
			})
			
		}
		
	},
	onLoading:function($scope,options){
		$scope.advCondition ={}
		options.$rootScope.nextTick(function(){
			options.$http.get(server_url + "/api/" +id_app+"/group?q={group_type:'TASK'}").success(function(groups){
				$scope.groups=groups;
			});
		})
		$scope.progresses =[{value:0,text:'Chưa thực hiện',sel:true},{value:1,text:'Đang thực hiện',sel:true},{value:2,text:'Hoàn thành',sel:true},{value:3,text:'Tạm dừng',sel:true},{value:4,text:'Đang chờ',sel:true}]
		$scope.priorities =[{value:1,text:'Ưu tiên cao',sel:true},{value:2,text:'Ưu tiên trung bình',sel:true},{value:3,text:'Ưu tiên thấp',sel:true}]
		
		$scope.searchAVG = function(){
			if(!$scope.renderCompleted){
				return;
			}
			if(!$scope.filter){
				$scope.filter ={}
			}
			var ps =[]
			var pi =[]
			$scope.progresses.forEach(function(p){
				if(p.sel) ps.push(p.value)
			})
			$scope.priorities.forEach(function(p){
				if(p.sel) pi.push(p.value)
			})
			$scope.filter.progress ={$in:ps}
			$scope.filter.priority ={$in:pi}
			if($scope.phu_trach){
				$scope.filter.phu_trach = $scope.phu_trach;
			}else{
				delete $scope.filter.phu_trach;
			}
			if($scope.nh_cv){
				$scope.filter.nh_cv = $scope.nh_cv;
			}else{
				delete $scope.filter.nh_cv;
			}
			//time
			var tu_ngay,den_ngay;
			var curr = new Date;
			var m = $scope.time;
			if(m=='d'){
				//xem ngay hien tai
				tu_ngay = new Date();
				den_ngay = new Date();
				
			}
			if(m=='w'){
				var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
				var tu_ngay = new Date(curr.setDate(first));
				var den_ngay = new Date(curr.setDate(tu_ngay.getDate()+6));
			}
			if(m=='m'){
				//xem thang hien tai
				tu_ngay = curr;
				tu_ngay.setDate(1);
				den_ngay = new Date(tu_ngay.getFullYear(),tu_ngay.getMonth()+1,0);		
			}
			if(m=='3m'){
				//xem quy hien tai
				var current_month = curr.getMonth();
				var quy=1;
				if(current_month<3) quy=0; else if (current_month<6) quy =3; else if (current_month<6) quy=6; else quy=9;
				tu_ngay = new Date(curr.getFullYear(),quy,1);
				den_ngay = new Date(curr.getFullYear(),quy + 3,0);
			}
			if(m=='y'){
				//xem nam hien tai
				tu_ngay = new Date(curr.getFullYear(),0,1);
				den_ngay = new Date(curr.getFullYear(),11,31);	
			}
			
			if(tu_ngay && den_ngay){
				tu_ngay.setHours(0);
				tu_ngay.setMinutes(0);
				tu_ngay.setSeconds(0)
	
				den_ngay.setHours(23);
				den_ngay.setMinutes(59);
				den_ngay.setSeconds(0);
				$scope.filter.start_date ={$gte:tu_ngay,$lte:den_ngay};
			}else{
				delete $scope.filter.start_date 
			}
			//
			if($scope.advCondition.ten_cv){
				$scope.filter.$or =[{ten_cv:{$regex:$scope.advCondition.ten_cv,$options:'i'}},{mieu_ta:{$regex:$scope.advCondition.ten_cv,$options:'i'}},{location:{$regex:$scope.advCondition.ten_cv,$options:'i'}},{phu_trach:{$regex:$scope.advCondition.ten_cv,$options:'i'}}];
			}else{
				delete $scope.filter.$or
			}
			if($scope.advCondition.ten_kh){
				$scope.filter.ten_kh =$scope.advCondition.ten_kh
			}else{
				delete  $scope.filter.ten_kh
			}
			if($scope.advCondition.ten_dt){
				$scope.filter.ten_dt =$scope.advCondition.ten_dt
			}else{
				delete $scope.filter.ten_dt
			}
			if($scope.advCondition.priority){
				$scope.filter.priority =$scope.advCondition.priority
			}
			if($scope.advCondition.progress){
				$scope.filter.progress =$scope.advCondition.progress
			}
			if($scope.advCondition.start_date){
				$scope.filter.start_date = {$gte:$scope.advCondition.start_date};
			}
			if($scope.advCondition.due_date){
				$scope.filter.due_date = {$lte:$scope.advCondition.due_date};
			}else{
				delete $scope.filter.due_date
			}
			//
			$scope.search();
		}
		$scope.reportByTime = function(m){
			$scope.time =m;
			$scope.searchAVG();
		}
		$scope.$watch("progresses",function(newValue){
			$scope.filter_title ="Lọc dữ liệu"
			$scope.searchAVG()
		},true)
		$scope.searchPhuTrach = function(m){
			$scope.phu_trach = m.email
			$scope.searchAVG()
		}
		$scope.searchGroup = function(m){
				$scope.nh_cv = m._id;
				$scope.searchAVG()
			}
		$scope.$watch("priorities",function(newValue){
			$scope.filter_title ="Lọc dữ liệu"
			$scope.searchAVG()
		},true)
		$scope.changeProgress = function(obj,progress){
			var t ={}
			_.extend(t,obj);
			t.progress = progress;
			options.service.update(id_app,t._id,t).success(function(nt){
				_.extend(obj,nt);
			}).error(function(e){
				if(e) alert(e);
			})
		}
		$scope.enter = function(event){
			if(event.keyCode==13){
				$scope.searchAVG();
			}
		}
	}
});
taskModule.module.directive("task",function(){
	return {
		restrict:'E',
		scope:{
			link:'=',
			collection:'@',
			defaultValues:'@'
		},
		templateUrl:"templates/lists/task/templates/directive.html",
		controller:['$scope','$http','$window','$location','$modal','appInfo',function($scope,$http,$window,$location,$modal,appInfo){
			appInfo.info("task",function(e,u,a){
				if(e) return;
				$scope.server_url = server_url;
				$scope.textSearch="";
				$scope.location = $location.url();
				$scope.collectionsLink = "task:'ten_cv'";
				var collectionsLink = eval("({" + $scope.collectionsLink + "})")
				var collections = _.keys(collectionsLink)
				$scope.load = function(){
					var url = server_url + "/api/" + id_app + "/linkslist?_id=" + $scope.link._id + "&collections=" + collections.join();
					$http.get(url).success(function(rs){
						$scope.list =rs;
					}).error(function(e){
						if(e) $window.alert(e);
					});
				}
				$scope.getHeaderCollection = function(r){
					var module_name = r.collection_obj + "Module";
					var module = eval("(" + module_name  + ")")
					return module.title;
				}
				$scope.search = function(value){
					var url = server_url + "/api/" + id_app + "/search?collections=" + $scope.collectionsLink + "&value=" + value;
					return $http.get(url).then(function(res){
						var items = res.data;
						return items;
					});
				}
				$scope.addLink = function(obj){
					$scope.textSearch ="";
					if(!$scope.list) $scope.list =[];
					var check = _.find($scope.list,function(item){
						return item.obj._id==obj._id;
					})
					if(check){
						return;
					}
					var obj_link = {}
					obj_link.id_a = $scope.link._id;
					obj_link.collection_a = $scope.collection;
					
					obj_link.collection_b = obj.collection_name;
					obj_link.collection_obj =obj.collection_name;
					obj_link.id_b = obj._id;
					
					var url =server_url + "/api/" + id_app + "/link";
					$http.post(url,obj_link).success(function(rs){
						_.extend(obj_link,rs);
						obj_link.obj = obj;
						obj_link.title = obj.title;
						$scope.list.push(obj_link);
					}).error(function(e){
						//$window.alert(e);
					})
					
				}
				$scope.unLink = function(obj){
					var url =server_url + "/api/" + id_app + "/link/" + obj._id;
					$http.delete(url).success(function(rs){
						$scope.list = _.reject($scope.list,function(item){
							return item._id==obj._id;
						})
					}).error(function(e){
						//$window.alert(e);
					})
					
				}
				$scope.getItem = function($item, $model, $label){
					$scope.addLink($item,$label);
					
				}
				$scope.add=function(){
					var defaultValues ={}
					if($scope.defaultValues){
						defaultValues =eval("({" + $scope.defaultValues + "})");
					}
					taskModule.quickadd($modal,function(rs){
						rs.collection_name ="task";
						$scope.addLink(rs)
					},defaultValues)
				}
				$scope.view=function(item){
					var url ="task/view/"+item._id + "?redirect=" + $location.url();
					$location.url(url);
				}
				$scope.delete = function(item){
					if($window.confirm("Bạn có chắc chắn xóa không?")){
						$http.delete(server_url + "/api/"+id_app+"/task/" + item._id)
							.success(function(rs){
								$scope.list = _.reject($scope.list,function(r){
									return(r._id ==item._id);
								});
							})
							.error(function(e){
								if(e) $window.alert(e);
							})
					}
				}
				$scope.edit=function(item){
					taskModule.quickedit($modal,item._id,function(rs){
						_.extend(item,rs);
					});
				}
				$scope.$watch('link',function(newValue){
					if(newValue){
						$scope.load()
					}
				},true)
			})
			
		}],
		link:function($scope,elem,attrs,contr){
			if(!attrs.link || !attrs.collection){
				console.error("task directive require attributes:link,collection")
			}
			
		}
	}
})
taskModule.module.directive("dbTask",function(){
	return {
		restrict:'E',
		scope:{
			
		},
		templateUrl:"templates/lists/task/templates/db.html",
		controller:['$scope','task','$rootScope','$location','appInfo','socket','nodeWebkit',function($scope,task,$rootScope,$location,appInfo,socket,nodeWebkit){
			appInfo.info("task",function(e,u,app_info){
				if(e) return;
				$scope.token = $rootScope.token;
				$scope.server_url = server_url;
				$scope.now = new Date();
				$scope.options ={
					my_job:true,
					overdue:false,
					progress_0:true,
					progress_1:true,
					progress_2:false,
					progress_3:true,
					progress_4:true
				}
				$scope.getCondition = function(){
					$scope.condition ={status:true};
					if($scope.options.my_job){
						$scope.condition.$or = [{phu_trach:$rootScope.user.email},{attends:$rootScope.user.email}];
					}
					if($scope.options.overdue){
						var now = new Date();
						$scope.condition.due_date= {$lt:now};
					}
					$scope.condition.progress ={$in:[]}
					if($scope.options.progress_0){
						$scope.condition.progress.$in.push(0);
						
					}
					if($scope.options.progress_1){
						$scope.condition.progress.$in.push(1);
						
					}
					if($scope.options.progress_2){
						$scope.condition.progress.$in.push(2);
						
					}
					if($scope.options.progress_3){
						$scope.condition.progress.$in.push(3);
						
					}
					if($scope.options.progress_4){
						$scope.condition.progress.$in.push(4);
						
					}
				}
				$scope.app_info = $rootScope.app_info;
				$scope.filter = function(c){
					async.nextTick(function(){
						$scope.$emit("$dataChangeStart")
						$scope.getCondition();
						if(c){
						 _.extend($scope.condition,c);	
						}
						task.load(id_app,{condition:$scope.condition,limit:10}).success(function(tasks){
							$scope.dscv = tasks;
							$scope.$emit("$dataChangeSuccess")
						}).error(function(e){
							$scope.$emit("$dataChangeError")
						})
					})
					
				}
				$scope.complete = function(t){
					task.update(id_app,t._id,{progress:2}).success(function(rs){
						_.extend(t,rs);
					}).error(function(e){
						if(e) alert(e);
					})
				}
				$scope.cancel = function(t){
					task.update(id_app,t._id,{status:false}).success(function(rs){
						if($scope.dscv){
							$scope.dscv = _.reject($scope.dscv,function(ts){
								return ts._id==t._id;
							})
						}
					}).error(function(e){
						if(e) alert(e);
					})
				}
				$scope.viewTask=function(t){
					$location.url("task/view/" + t._id)
				}
				$scope.$watch('options',function(newValue){
					if(newValue && $scope.app_info){
						$scope.filter({});
					}
				},true)
				socket.on("task:new",function(_id){
					if(!$scope.dscv) $scope.dscv=[]
					task.get(id_app,_id).success(function(t){
						var c = _.find($scope.dscv,function(c){
							return c._id==_id;
						})
						if(!c){
							t.is_new = true;
                            nodeWebkit.notification("Bạn có công việc mới")
							$scope.dscv.push(t);
						}
					})
				})
				$scope.filter({});
			})
			
		}],
		link:function($scope,elem,attrs,controller){
			
		}
	}
});