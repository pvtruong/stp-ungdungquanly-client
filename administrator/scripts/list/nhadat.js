var nhadatModule = new baseInput('nhadat','nhadat',["ten_nd"],'Nhà đất',{
	has_view:true,
	onAdd:function($scope,options){
		$scope.data.phu_trach = options.$rootScope.user.email;
		$scope.data.progress =0;
	},
	onLoading:function($scope,options){
		$scope.advCondition ={}
		options.$rootScope.nextTick(function(){
			options.$http.get(server_url + "/api/"+id_app+"/group?q={group_type:'NHADAT'}").success(function(groups){
				$scope.groups=groups;
			});
		})
		$scope.progresses =[{value:0,text:'Đang bán',sel:true},{value:1,text:'Bán gấp',sel:true},{value:2,text:'Ngưng bán',sel:true},{value:3,text:'Đã bán',sel:true}]
		$scope.searchAVG = function(){
			if(!$scope.renderCompleted){
				return;
			}
			if(!$scope.filter){
				$scope.filter ={}
			}
			var ps =[]
			$scope.progresses.forEach(function(p){
				if(p.sel) ps.push(p.value)
			})
			$scope.filter.progress={$in:ps}
			if($scope.phu_trach){
				$scope.filter.phu_trach = $scope.phu_trach;
			}else{
				delete $scope.filter.phu_trach
			}
			if($scope.nh_nd){
				$scope.filter.nh_nd = $scope.nh_nd;
			}else{
				delete $scope.filter.nh_nd
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
				$scope.filter.date_created ={$gte:tu_ngay,$lte:den_ngay};
			}else{
				delete $scope.filter.date_created
			}
			//
			if($scope.advCondition.ten_nd){
				$scope.filter.$or =[{ten_nd:{$regex:$scope.advCondition.ten_nd,$options:'i'}},{mieu_ta:{$regex:$scope.advCondition.ten_nd,$options:'i'}}]
			}else{
				delete $scope.filter.$or
			}
			if($scope.advCondition.ten_kh){
				$scope.filter.ten_kh =$scope.advCondition.ten_kh
			}else{
				delete  $scope.filter.ten_kh
			}
            if($scope.advCondition.tinh_thanh){
				$scope.filter.tinh_thanh =$scope.advCondition.tinh_thanh
			}else{
				delete  $scope.filter.tinh_thanh
			}
            if($scope.advCondition.quan_huyen){
				$scope.filter.quan_huyen =$scope.advCondition.quan_huyen
			}else{
				delete  $scope.filter.quan_huyen
			}
			if($scope.advCondition.progress){
				$scope.filter.progress =$scope.advCondition.progress
			}
			$scope.search();
		}
		$scope.reportByTime = function(m){
			$scope.time =m;
			$scope.searchAVG();
		}
		$scope.searchPhuTrach = function(m){
			$scope.phu_trach = m.email
			$scope.searchAVG()
		}
		$scope.searchGroup = function(m){
				$scope.nh_nd = m._id;
				$scope.searchAVG()
			}
		$scope.$watch("progresses",function(newValue){
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
	},
	onView:function($scope,options){
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
	}
});
nhadatModule.module.directive("nhadat",function(){
	return {
		restrict:'E',
		scope:{
			link:'=',
			collection:'@',
			defaultValues:'@'
		},
		templateUrl:"templates/lists/nhadat/templates/directive.html",
		controller:['$scope','$http','$window','$location','$modal','appInfo',function($scope,$http,$window,$location,$modal,appInfo){
			appInfo.info("nhadat",function(e,u,appinfo){
				if(e) return;
				$scope.textSearch="";
				$scope.location = $location.url();
				$scope.collectionsLink = "nhadat:'ten_nd'";
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
						if(e) $window.alert(e);
					})
					
				}
				$scope.unLink = function(obj){
					var url =server_url + "/api/" + id_app + "/link/" + obj._id;
					$http.delete(url).success(function(rs){
						$scope.list = _.reject($scope.list,function(item){
							return item._id==obj._id;
						})
					}).error(function(e){
						if(e) $window.alert(e);
					})
					
				}
				$scope.getItem = function($item, $model, $label){
					$scope.addLink($item);
					
				}
				$scope.add=function(){
					
					var defaultValues ={}
					if($scope.defaultValues){
						defaultValues =eval("({" + $scope.defaultValues + "})");
					}
					nhadatModule.quickadd($modal,function(rs){
						rs.collection_name ="nhadat";
						$scope.addLink(rs)
					},defaultValues)
				}
				$scope.view=function(item){
					var url ="nhadat/view/"+item._id + "?redirect=" + $location.url();
					$location.url(url);
				}
				$scope.delete = function(item){
					if($window.confirm("Bạn có chắc chắn xóa không?")){
						$http.delete(server_url + "/api/"+id_app+"/nhadat/" + item._id)
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
					nhadatModule.quickedit($modal,item._id,function(rs){
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
		link:function(scope,elem,attrs,contr){
			if(!attrs.link || !attrs.collection){
				console.error("nhadat directive require attributes:link,collection")
			}
			
		}
	}
})