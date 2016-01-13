accApp.directive('format', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
		scope:{
			ngModel:"="
		},
		controller:['$scope',function($scope){
			$scope.$watch('ngModel',function(n){
				if(n==undefined){
					$scope.ngModel =0;
				}
				
			})
		}],
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;
            ctrl.$formatters.unshift(function (a) {
				if(ctrl.$modelValue==undefined || ctrl.$modelValue==""){
					ctrl.$modelValue =0;
				}
                return $filter(attrs.format)(ctrl.$modelValue);
            });


            ctrl.$parsers.unshift(function (viewValue) {
				if(viewValue ==undefined || viewValue==""){
					viewValue ='0';
				}
                var plainNumber_1 = viewValue.replace(/[^\d|\-+|,+]/g, '')
				var plainNumber = plainNumber_1.replace(/,/g,'.');
				var f = $filter('number')(plainNumber);
				
				if(plainNumber_1.indexOf(",")==plainNumber_1.length-1){
					f = f +  ",";
				}
				//
                elem.val(f);
				var kq = Number(plainNumber);
				if(kq==undefined){
					kq =0;
				}
                return kq;
            });
        }
    };
}]);
accApp.directive("ngData",function(){
	return {
		controller:['$scope',function($scope){}]
	}
});
accApp.directive('ngSum',function(){
	return{
		scope:{
			ngSum:'@',
			ngData:'=',
			ngModel:'='
		},
		link:function(scope,elem,attrs,ctr){
			scope.$watch('ngData',function(newData){
				var kq =0;
				if(newData){
					angular.forEach(newData,function(r){
						var v = Number(r[scope.ngSum]);
						kq = kq+v;
					});
				}
				scope.ngModel = kq;			
				
			},true);
			
		}
	}
});
accApp.directive('ngDatepicker',['$window',function($window){
	return {
		restrict:'E',
		require:'^ngModel',
		scope:{
			ngModel:'=',
			ngChange:'&'
		},
		templateUrl:'templates/sys/ng-datepicker.html',
		controller:['$scope','$filter',function($scope,$filter){
			$scope.$watch('ngModel',function(newValue,oldValue){
				if(newValue &&! _.isDate(newValue)){
					//$scope.ngModel = $filter('date')(new Date(newValue),'yyyy-MM-dd');
					$scope.ngModel = new Date(newValue);
				}
				if($scope.ngChange){
					if(newValue!=oldValue){
						$scope.ngChange();
					}
				}
			})
		}],
		link:function(scope,elem,attrs,ctr){
			/*scope.openDatePicker=function($event){
				$event.preventDefault();
				$event.stopPropagation();
				scope.opened = true;
			}
			*/
		}
	}
}]);
accApp.directive('ngRequiredCn',['dmtk',function(dmtk){
	var tk_cn = false;
	var setValidity = function(scope,ctr){
		if(tk_cn==true && (!ctr.$viewValue || ctr.$viewValue =="")){
			ctr.$setValidity('ngRequiredCn',false);
		}else{
			ctr.$setValidity('ngRequiredCn',true);
		}
	}
	return {
		restrict:'A',
		require:'?ngModel',
		link:function(scope,elem,attrs,ctr){
			scope.$watch(attrs.ngRequiredCn,function(tk){
				if(tk){
					if(scope.tks){
						tk_cn = (_.filter(scope.tks,function(t){return (t.tk==tk && t.tk_cn);}).length>0);
						setValidity(scope,ctr);
					}else{
						dmtk.list(id_app,{tk:tk,tk_cn:true},'tk_cn')
							.success(function(data){
								if(data.length==0){
									tk_cn = false
								}else{
									tk_cn = true;
								}
								setValidity(scope,ctr);
							});
					}
				}else{
					tk_cn = false;
					setValidity(scope,ctr);
				}
				
			});
			scope.$watch(attrs.ngModel,function(viewValue){
				setValidity(scope,ctr);
			});
			
		}
	}
}]);
accApp.directive('ngRequiredQ',[function(){
	return {
		restrict:'A',
		require:'?ngModel',
		link:function(scope,elem,attrs,ctr){
			scope.$watch(attrs.ngRequiredQ,function(tk){
				if(tk){
					ctr.$setValidity('ngRequired',false);
				}else{
					ctr.$setValidity('ngRequired',true);
				}
				
			});
			
			
		}
	}
}]);
accApp.directive('topMenu',[function(){
	return {
		restrict:'E',
		templateUrl:'templates/sys/top-menu.html',
		controller:['$scope','$rootScope','colleague','$window','user','app','$location','$http','appInfo','$timeout',function($scope,$rootScope,colleague,$window,user,app,$location,$http,appInfo,$timeout){
			 //notify
			 $rootScope.notifies_count = 0;
			 $rootScope.messages_count = 0;
			 $rootScope.task_count = 0;
			 $rootScope.getMessages = function(callback){
				$rootScope.msgs =[{content:'Đang lấy dữ liệu...'}];
				user.getMessagesColleagues(function(error,messages){
					if(error){
						$rootScope.messages_count = 0;
						$rootScope.msgs =[{content:'Không thể lấy dữ liệu từ server'}];
					}else{
						$rootScope.msgs = messages;
						$rootScope.messages_count = messages.length;
						
						if(callback){
							callback(messages)
						}
					}
				});
				
			 }
			 $rootScope.getInvitations = function(callback){
				$rootScope.notifies ={notifications:[{content:'Đang lấy dữ liệu...'}]};
				user.getNotifies(function(error,notifies){
					if(error){
						$rootScope.notifies_count = 0;
						$rootScope.notifies ={notifications:[{content:'Không thể lấy dữ liệu từ server'}]};
					}else{
						$rootScope.notifies = notifies;
						$rootScope.notifies_count = notifies.colls.length + notifies.apps.length + notifies.notifications.length;
						if(callback){
							callback(notifies)
						}
						
					}
				});
				
			 }
			 $rootScope.getTask = function(){
				$rootScope.tasks =[{ten_cv:'Đang lấy dữ liệu...'}];
				var now = new Date();
				var q ={progress:{$ne:2},start_date:{$lt:now},status:true,phu_trach:$rootScope.user.email}
				$http.get(server_url + "/api/" + id_app + "/task?fields=ten_cv,percent,progress,priority&q=" + JSON.stringify(q)).success(function(tasks){
					$rootScope.tasks = tasks;
					$rootScope.task_count =tasks.length;
				}).error(function(e){
					$rootScope.tasks =[{ten_cv:'Không thể lấy dữ liệu từ server'}];
				})
			 }
			 $rootScope.acceptInvitor = function(code,id){
				if(code=="colleague"){
					colleague.active(id).success(function(data){
						if($location.url().indexOf("/colleague")==0 || $location.url().indexOf("colleague")==0){
							$window.location.reload();
						}
					}).error(function(error){
						alert("Không thể thực hiện thao tác này");
					});
				}
				if(code=="app"){
					app.active(id).success(function(data){
						if($location.url().indexOf("/app")==0 || $location.url().indexOf("app")==0){
							$window.location.reload();
						}
					}).error(function(error){
						alert("Không thể thực hiện thao tác này");
					});
				}
			 }
			 $rootScope.notAcceptInvitor = function(code,id){
				if(code=="colleague"){
					colleague.notaccept(id).success(function(data){
						if($location.url().indexOf("/colleague")==0 || $location.url().indexOf("colleague")==0){
							$window.location.reload();
						}
						
					}).error(function(error){
						alert("Không thể thực hiện thao tác này");
					});
				}
				if(code=="app"){
					app.notaccept(id).success(function(data){
						if($location.url().indexOf("/app")==0 || $location.url().indexOf("app")==0){
							$window.location.reload();
						}
						
					}).error(function(error){
						alert("Không thể thực hiện thao tác này");
					});
				}
				
			 }
		}]
	}
}]);
accApp.directive('horizantalMenu',[function(){
	return {
		restrict:'E',
		templateUrl:'templates/sys/horizantal-menu.html'
	}
}]);
accApp.directive('appHeader',[function(){
	return {
		restrict:'E',
		templateUrl:'templates/sys/app-header.html'
	}
}]);
accApp.directive('ngPage',[function(){
	return {
		restrict:'E',
		templateUrl:'templates/sys/ng-page.html'
	}
}]);
accApp.directive('ngPageFx',[function(){
	return {
		restrict:'E',
		scope:{
			service:'=',
			list:'=',
			condition:'=',
			start:'=',
			pageChanged:'&'
		},
		templateUrl:'templates/sys/ng-page.html',
		controller:['$scope','$http','$rootScope',function($scope,$http,$rootScope){
			$scope.current_page =1;
			$scope.getPages = function(){
				//get total pages
				$scope.service.load(id_app,{condition:$scope.condition,count:1})
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
			}
			$scope.goToPage = function(page){
				if(!page){
					page =1;
				}
				//load page
				$rootScope.nextTick(function(){
					$scope.$emit("$dataChangeStart")
					$scope.service.load(id_app,{condition:$scope.condition,page:page,limit:$scope.limit,fields:$scope.fields})
						.success(function(data){
							async.map(data,function(d,callback){
								if($scope.emailCurrentUser){
									$http.get(server_url + "/api/follow?q={id_object:'" + d._id + "',user_created:'" + $scope.emailCurrentUser + "'}")
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
								$scope.$emit("$dataChangeSuccess")
								$scope.current_page = page;
								$scope.pageChanged({$page:page})
								$scope.list = data;
							})
							
						}).error(function(e){
							$scope.$emit("$dataChangeError")
						});
				})
			}
		}],
		link:function($scope,ele,attrs,controller){
			$scope.total_page = 1;
			$scope.pages =[1];
			
			if(attrs.hasOwnProperty("emailCurrentUser")){
				$scope.emailCurrentUser = attrs.emailCurrentUser;
			}
			if(attrs.hasOwnProperty("fields")){
				$scope.fields = attrs.fields;
			}else{
				$scope.fields ="";
			}
			if(attrs.hasOwnProperty("limit")){
				$scope.limit = attrs.limit;
			}
			if(attrs.hasOwnProperty("currentPage")){
				$scope.current_page = Number(attrs.currentPage);
			}else{
				$scope.current_page =1;
			}
			if(!$scope.limit){
				$scope.limit = 20;
			}
			$scope.$watch('start',function(newvalue){
				if(newvalue){
					$scope.getPages();
					$scope.goToPage($scope.current_page);
					$scope.start =null;//waiting for next time
				}
			})
		}
	}
}]);
accApp.directive('stplistheader',['$location',function($location){
	return {
		restrict:'E',
		transclude: true,
		templateUrl:"templates/sys/list-header.html",
		link:function(scope,elem,attrs,contr){
			if(attrs.hasOwnProperty('boxSearch')){
				scope.boxSearch = attrs.boxSearch;
			}else{
				scope.boxSearch = true;
			}
			
			if(attrs.hasOwnProperty('btnadd')){
				
				var btnAdd = eval("({" +  attrs.btnadd + "})");
				if(btnAdd.show==undefined){
					btnAdd.show = true;
				}
				if(btnAdd.text==undefined){
					btnAdd.text = "Mới";
				}
				scope.add_show=btnAdd.show;
				scope.add_text =btnAdd.text;
			}else{
				scope.add_show=true;
				scope.add_text ="Mới";
			}
			if(attrs.btndelete){
				var btnDelete = eval("({" +  attrs.btndelete + "})");
				if(btnDelete.show==undefined){
					btnDelete.show = true;
				}
				if(btnDelete.text==undefined){
					btnDelete.text = "Xóa";
				}
				scope.delete_show=btnDelete.show;
				scope.delete_text =btnDelete.text;
			}else{
				scope.delete_text ="Xóa";
				scope.delete_show=true;
			}
			
			if(attrs.btn1){
				var btn1 = eval("({" +  attrs.btn1 + "})");
				scope.btn1_show=true;
				scope.btn1_text =btn1.text;
				scope.btn1_title =btn1.title;
				if(_.isFunction(btn1.click)){
					scope.btn3_click = btn1.click;
				}
			}
			if(attrs.btn2){
				var btn2 = eval("({" +  attrs.btn2 + "})");
				scope.btn2_show=true;
				scope.btn2_text =btn2.text;
				scope.btn2_title =btn2.title;
				if(_.isFunction(btn2.click)){
					scope.btn2_click = btn2.click;
				}
			}
			if(attrs.btn3){
				var btn3 = eval("({" +  attrs.btn3 + "})");
				scope.btn3_show=true;
				scope.btn3_text =btn3.text;
				scope.btn3_title =btn3.title;
				if(_.isFunction(btn3.click)){
					scope.btn3_click = btn3.click;
				}
			}
			if(attrs.btn4){
				var btn4 = eval("({" +  attrs.btn4 + "})");
				scope.btn4_show=true;
				scope.btn4_text =btn4.text;
				scope.btn4_title =btn4.title;
				if(_.isFunction(btn4.click)){
					scope.btn4_click = btn4.click;
				}
			}
			if(attrs.btn5){
				var btn5 = eval("({" +  attrs.btn5 + "})");
				scope.btn5_show=true;
				scope.btn5_text =btn5.text;
				scope.btn5_title =btn5.title;
				if(_.isFunction(btn5.click)){
					scope.btn5_click = btn5.click;
				}
			}
            scope.import_show=true;
			if(attrs.btnimport){
				var btnimport = eval("({" +  attrs.btnimport + "})");
                if(btnimport.show===false){
                    scope.import_show=false;
                }				
				scope.import_text ="Nhập từ Excel";//btnimport.text?btnimport.text:"Import";
			}
            
            if(attrs.btnexport){
				var btnexport = eval("({" +  attrs.btnexport + "})");
                if(btnexport.show){
                    scope.export_show=true;
                }				
			}
		}
	};
}]);
accApp.directive('listViewHeader',['$location',function($location){
	return {
		restrict:'E',
		transclude: true,
		templateUrl:"templates/sys/list-view-header.html",
		controller:['$scope','$rootScope',function($scope,$rootScope){
			$scope.$watch('data',function(newValue){
				if(newValue){
					$scope.title_view = newValue[$scope.headerTitleField];
					$rootScope.title_view = $scope.title_view;
				}
				
			})
		}],
		link:function(scope,elem,attrs,contr){
			scope.headerTitleField = attrs.headerTitle
			
		}
	};
}])
accApp.directive('stpvoucherheader',function(){
	return {
		restrict:'E',
		transclude: true,
		templateUrl:"templates/sys/voucher-header.html",
		link:function(scope,elem,attrs,control){
			if(attrs.btn1){
				var btn1 = eval("({" +  attrs.btn1 + "})");
				scope.btn1_show=true;
				scope.btn1_text =btn1.text;
				scope.btn1_title =btn1.title;
				if(_.isFunction(btn1.click)){
					scope.btn1_click = btn1.click;
				}
			}
			if(attrs.btn2){
				var btn2 = eval("({" +  attrs.btn2 + "})");
				scope.btn2_show=true;
				scope.btn2_text =btn2.text;
				scope.btn2_title =btn2.title;
				if(_.isFunction(btn2.click)){
					scope.btn2_click = btn2.click;
				}
			}
			if(attrs.btn3){
				var btn3 = eval("({" +  attrs.btn3 + "})");
				scope.btn3_show=true;
				scope.btn3_text =btn3.text;
				scope.btn3_title =btn3.title;
				if(_.isFunction(btn3.click)){
					scope.btn3_click = btn3.click;
				}
			}
			if(attrs.btn4){
				var btn4 = eval("({" +  attrs.btn4 + "})");
				scope.btn4_show=true;
				scope.btn4_text =btn4.text;
				scope.btn4_title =btn4.title;
				if(_.isFunction(btn4.click)){
					scope.btn4_click = btn4.click;
				}
			}
			if(attrs.btn5){
				var btn5 = eval("({" +  attrs.btn5 + "})");
				scope.btn5_show=true;
				scope.btn5_text =btn5.text;
				scope.btn5_title =btn5.title;
				if(_.isFunction(btn5.click)){
					scope.btn5_click = btn5.click;
				}
			}
            scope.import_show=true;
			if(attrs.btnimport){
				var btnimport = eval("({" +  attrs.btnimport + "})");
                if(btnimport.show===false){
                    scope.import_show=false;
                }				
				scope.import_text ="Nhập từ Excel";//btnimport.text?btnimport.text:"Import";
			}
			if(attrs.options){
				var options = eval("({" +  attrs.options + "})");
				scope.options_show=true;
				scope.options_text =options.text;
			}
		}
	};
});
accApp.directive('headerFormInput',function () {
    return {
		restrict:'E',
		templateUrl:"templates/sys/header-form-input.html",
		link:function($scope,elem,attrs){
			if(attrs.saveText){
				$scope.save_text = attrs.saveText;
			}
			if(attrs.cancelText){
				$scope.cancel_text = attrs.cancelText;
			}
		}
	};
});
accApp.directive('headerDialogSelect',function () {
    return {
		restrict:'E',
		templateUrl:"templates/sys/header-dialog-select.html",
		link:function(scope,elem,attrs){
			if(attrs.hasOwnProperty("title")){
				scope.title= attrs["title"];
			}else{
				scope.title ="Danh sách"
			}
			if(attrs.hasOwnProperty("placeholder")){
				scope.placeholder= attrs["placeholder"];
			}else{
				scope.placeholder ="Gõ từ cần tìm..."
			}
		}
	};
});
accApp.directive('footerFormInput',function () {
    return {
		restrict:'E',
		templateUrl:"templates/sys/footer-form-input.html",
		link:function($scope,elem,attrs){
			if(attrs.saveText){
				$scope.save_text = attrs.saveText;
			}
			if(attrs.cancelText){
				$scope.cancel_text = attrs.cancelText;
			}
		}
	};
});
accApp.directive('rptHeader',['$location',function ($location) {
    return {
		restrict:'E',
		transclude: true,
		templateUrl:"templates/sys/rpt-header.html",
		link:function(scope,elem,attrs,controller){
			if(attrs.kbm){
				scope.kbm_yn = true;
				scope.openKbm = function(){
					$location.url(attrs.kbm);
				}
				
			}
			scope.btnok_text ="Xem";
			scope.btnok_show = true;
			
			if(attrs.btnok){
				var btnok = eval("({" +  attrs.btnok + "})");
				if(btnok.text){
					scope.btnok_text = btnok.text;
				}
				if(btnok.show){
					scope.btnok_show = btnok.show;
				}
			}
			if(attrs.btn1){
				var btn1 = eval("({" +  attrs.btn1 + "})");
				scope.btn1_show=true;
				scope.btn1_text =btn1.text;
				scope.btn1_title =btn1.title;
				if(_.isFunction(btn1.click)){
					scope.btn1_click = btn1.click;
				}
			}
			if(attrs.btn2){
				var btn2 = eval("({" +  attrs.btn2 + "})");
				scope.btn2_show=true;
				scope.btn2_text =btn2.text;
				scope.btn2_title =btn2.title;
				if(_.isFunction(btn2.click)){
					scope.btn2_click = btn2.click;
				}
			}
			if(attrs.btn3){
				var btn3 = eval("({" +  attrs.btn3 + "})");
				scope.btn3_show=true;
				scope.btn3_text =btn3.text;
				scope.btn3_title =btn3.title;
				if(_.isFunction(btn3.click)){
					scope.btn3_click = btn3.click;
				}
			}
			if(attrs.btn4){
				var btn4 = eval("({" +  attrs.btn4 + "})");
				scope.btn4_show=true;
				scope.btn4_text =btn4.text;
				scope.btn4_title =btn4.title;
				if(_.isFunction(btn4.click)){
					scope.btn4_click = btn4.click;
				}
			}
			if(attrs.btn5){
				var btn5 = eval("({" +  attrs.btn5 + "})");
				scope.btn5_show=true;
				scope.btn5_text =btn5.text;
				scope.btn5_title =btn5.title;
				if(_.isFunction(btn5.click)){
					scope.btn5_click = btn5.click;
				}
			}
			if(attrs.btnprint){
				var btnprint = eval("({" +  attrs.btnprint + "})");
				if(btnprint.show==undefined){
					btnprint.show = true;
				}
				scope.btnprint_show=btnprint.show;
			}else{
				scope.btnprint_show = true;
			}
			if(attrs.btnexcel){
				var btnexcel = eval("({" +  attrs.btnexcel + "})");
				if(btnexcel.show==undefined){
					btnexcel.show = true;
				}
				scope.btnexcel_show=btnexcel.show;
			}else{
				scope.btnexcel_show = true;
			}
		}
	};
}]);
accApp.directive('navbarPrint',function () {
    return {
		restrict:'E',
		templateUrl:"templates/sys/navbar-print.html"
	};
});
accApp.directive('ngTypeahead',['$http',function($http){
	return {
		restrict:'E',
		scope:{
			ngModel:'=',
			ngDisabled:'=',
			ngShow:'=',
			label:'=',
			onSelect:'&',
			fieldModel:'@',
			module:'@',
			conditionData:'='
		},
		template:function(elem,attrs){
			
			var html ="<span class='input-group'>";
					//input
					html = html + "<input type='text'";
					html = html +  " ng-blur='blur()' ng-change='label=undefined' typeahead-on-select = 'getItem($item, $model, $label)'";
					if(attrs.hasOwnProperty("ngRequired")){
						html = html + " ng-required='" + attrs.ngRequired + "'";
					}
					if(attrs.hasOwnProperty("ngDisabled")){
						html = html + " ng-disabled='ngDisabled'";
					}
					if(attrs.hasOwnProperty("ngShow")){
						html = html + " ng-show='ngShow'";
					}
					if(attrs.hasOwnProperty("group")){
						html = html + "typeahead-min-length='3' typeahead-template-url='templates/" + attrs.group + "/" + attrs.module + "/templates/typeahead.html' ";
					}else{
						html = html + "typeahead-min-length='3' typeahead-template-url='templates/lists/" + attrs.module + "/templates/typeahead.html' ";
					
					}
					
					if(attrs.hasOwnProperty("placeholder")){
						html = html + " placeholder='" + attrs.placeholder + "' ";
					}
					html = html + " ng-model='ngModel'";
					html = html + " typeahead='item." + attrs.fieldModel + " as item." + attrs.fieldModel + " for item in getList($viewValue,10)' class='form-control'>";
					
					//list
					if(attrs.showButtonList==undefined || attrs.showButtonList==true){
						html = html + "<span class='btn input-group-addon'  ng-click='showList()'";
						if(attrs.hasOwnProperty("ngDisabled")){
							html = html + " ng-disabled='ngDisabled'";
						}
						html = html +"><i class='fa fa-list'></i></span>"
						
					}
					
					html = html + "</span>";
			
			return html;
		},
		controller:['$scope','$modal','$window','$interval',function($scope,$modal,$window,$interval){
			var module = eval("(" + $scope.module +"Module)");
			$scope.pathService = module.server_path;
			$scope.fieldsSearch = module.fields_find;
			var list = function(id_app,condition,fields,limit){
				if(_.contains(paths_not_require_id_app,$scope.pathService)){
					var url = server_url + "/api/" + $scope.pathService + "?t=1"
				}else{
					var url = server_url + "/api/" + id_app + "/" + $scope.pathService + "?t=1"
				}
				
				if(limit){
					url = url + "&limit=" + limit;
				}
				if(condition){
					if(angular.isObject(condition)){
						var q =JSON.stringify(condition);
						url = url + "&q=" + q;
					}else{
						url = url + "&" + condition;
					}
				}
				if(!fields && $scope.fields){
					fields = $scope.fields;
				}
				if(fields){
					url = url + "&fields=" + fields;
				}
				return $http.get(url);
			}
			$scope.prepareCondition = function(value){
				var condition={};
				if($scope.condition){
					_.extend(condition,$scope.condition);
				}
				
                if($scope.fieldsSearch=="$text"){
                    return "$text=" + value;//condition.$text = {$search:value};
                }else{
                    condition.$or =[];
                    $scope.fieldsSearch.forEach(function(field){

                        if(field.toLowerCase().indexOf('tk')==0){
                            f = eval("({" +  field + ":{$regex:'^" + value + "',$options:'i'}" + "})");

                        }else{
                            f = eval("({" +  field + ":{$regex:'" + value + "',$options:'i'}" + "})");
                        }

                        condition.$or.push(f);
                    });
                }
				
				return condition;
			}
			$scope.getList = function(value,limit,fn){
				var condition = $scope.prepareCondition(value);
				return list(id_app,condition,null,limit).then(function(res){
					var items = res.data;
					if(fn){
						fn(items);
					}
					return items;
				});
			}
			$scope.getItem = function($item, $model, $label){
				if($scope.fieldLabel){
					$scope.label = $item[$scope.fieldLabel];
				}
				if($scope.onSelect){
					$scope.onSelect({$item:$item});
				}
				
			}
			$scope.blur = function(){
				if($scope.ngModel&&!$scope.label && $scope.fieldLabel){
					var condition = eval("(" + "{" + $scope.fieldModel + ":'" + $scope.ngModel + "'}" + ")");
					list(id_app,condition,$scope.fieldLabel).success(function(d){
						if(d.length==1){
							$scope.label = d[0][$scope.fieldLabel];
						}else{
							$scope.ngModel = undefined;
						}
					});
				}
			}
			$scope.showList = function () {
				var modalInstance = $modal.open({
				  templateUrl:"templates/" + $scope.group + '/' + $scope.module + '/templates/dialog-select.html',
				  controller:  ['$scope', '$modalInstance','parentScope',function($scope, $modalInstance,parentScope){
						$scope.getList = function(value,limit){
							parentScope.getList(value,limit,function(data){
								$scope.items = data;
							});
						}
						$scope.keyup = function($event,value){
							if($event.keyCode==13 && value){
								$scope.getList(value);
							}
						}
						$scope.select = function (item){
							parentScope.ngModel = item[parentScope.fieldModel];
							if(parentScope.fieldLabel){
								parentScope.label = item[parentScope.fieldLabel];
							}
							
							if(parentScope.onSelect){
								parentScope.onSelect({$item:item});
							}
							$modalInstance.close();
						}
						$scope.cancel = function () {
							$modalInstance.dismiss('cancel');
						}
						$scope.openList = function () {
							var url = "#/" + parentScope.module;
							var w = $window.open(url,"Danh mục","width=" + $window.innerWidth.toString() + ",height=400")
							$modalInstance.dismiss('cancel');
						}
						$scope.quickadd = function(){
							
							module.quickadd($modal,function(item){
								parentScope.ngModel = item[parentScope.fieldModel];
								if(parentScope.fieldLabel){
									parentScope.label = item[parentScope.fieldLabel];
								}
							},parentScope.defaultValues);
							$modalInstance.dismiss('cancel');
						}
						$scope.getList("",10);
					}],
				  size: "lg",
				  resolve: {
					parentScope: function () {
					  return $scope;
					}
				  }
				});

			}
		}],
		link:function(scope,elem,attrs,controller){
			var conditionData={}
			if(scope.conditionData){
				conditionData = scope.conditionData;
			}
			if(attrs.hasOwnProperty("condition")){
				scope.condition = eval("({" + attrs.condition + "})");
			}
			if(attrs.hasOwnProperty("fields")){
				scope.fields = attrs.fields;
			}
			if(attrs.hasOwnProperty("fieldLabel")){
				scope.fieldLabel = attrs.fieldLabel;
			}
			if(attrs.hasOwnProperty("defaultValues")){
				scope.defaultValues = eval("({" + attrs.defaultValues + "})");
			}else{
				scope.defaultValues ={};
			}
			
			if(attrs.hasOwnProperty("group")){
				scope.group = attrs.group;
			}else{
				scope.group = "lists";
			}
			scope.$watch("ngModel",function(newValue,oldValue){
				if(!scope.ngModel){
					scope.label = "";
				}
			});
		}
	}
}]);
accApp.factory("$cache_lists",function(){
	return {};
});
accApp.directive('ngSelector',['$http','$cache_lists',function($http,$cache){
	return {
		restrict:'E',
		scope:{
			ngModel:'=',
			ngChange:'&',
			onSelect:'&',
			ngDisabled:'=',
			module:'@',
			fields:'@',
			fieldModel:'@',
			fieldLabel:'@',
			conditionData:'='
		},
		template: function(elem,attrs){
			var html = ""
			if(attrs.hasOwnProperty('button')){
				var button = eval("({" + attrs.button + "})");
				if(!button.class){
					button.class = "btn btn-default"
				}
				if(!button.text){
					button.text ="..."
				}
				html = html + "<a class='" + button.class + "'  ng-click='showList()'>" + button.text + "</a>";
			}else{
				 html = "<span>"
				if(attrs.showButtonList==undefined || attrs.showButtonList==true){
					html = "<span class='input-group'>"
				}
				html = html + "<select ng-model='ngModel' ng-disabled ='ngDisabled'  ";
				if(attrs.hasOwnProperty("options")){
					html =  html + ' ng-options="' + attrs.options + '"';
				}else{
					if(attrs.hasOwnProperty("showCode")){
						html =  html + " ng-options=\"item." + attrs.fieldModel + " as item." + attrs.fieldModel + " + ' - ' +  item." + attrs.fieldLabel + "  for item in items\" ";
					}else{
						html =  html + " ng-options=\"item." + attrs.fieldModel + " as item." + attrs.fieldLabel + "  for item in items\" ";
					}
					
				}
				if(attrs.hasOwnProperty("multiple")){
					html =  html + ' multiple';
				}
				
				html = html + " class='form-control'></select>";
				
				//list
				if(attrs.showButtonList==undefined || attrs.showButtonList==true){
					html = html + "<span class='btn input-group-addon'  ng-click='showList()'";
					if(attrs.hasOwnProperty("ngDisabled")){
						html = html + " ng-disabled='ngDisabled'";
					}
					html = html +"><i class='fa fa-list'></i></span>"
				}
				html = html +"</span>";
			}
			
			return html;
		},
		controller:['$scope','$modal','$window','$interval',function($scope,$modal,$window,$interval){
			var module = eval("(" + $scope.module +"Module)");
			$scope.pathService = module.server_path;
			$scope.fieldsSearch = module.fields_find;
			$scope.$watch('ngModel',function(newValue,oldValue){
				if(newValue && $scope.items){
					var item = _.find($scope.items,function(item){
						return item[$scope.fieldModel]==newValue;
					})
					$scope.ngChange({$item:item});
					if($scope.onSelect){
						$scope.onSelect({$item:item})
					}
				}else{
					$scope.ngChange({$item:null});
				}
				
			})
			$scope.list = function(id_app,condition,fields,limit){
				if(_.contains(paths_not_require_id_app,$scope.pathService)){
					var url = server_url + "/api/" + $scope.pathService + "?t=1"
				}else{
					var url = server_url + "/api/" + id_app + "/" + $scope.pathService + "?t=1"
				}
				if(limit){
					url = url + "&limit=" + limit;
				}
				if(condition){
					if(angular.isObject(condition)){
						var q =JSON.stringify(condition);
						url = url + "&q=" + q;
					}else{
						url = url + "&" + condition;
					}
				}
				if(!fields && $scope.fields){
					fields = $scope.fields;
				}
				if(fields){
					url = url + "&fields=" + fields;
				}
				return $http.get(url);
			}
			
			$scope.refresh = function(){
				var condition = {status:true};
				if($scope.condition){
					_.extend(condition,$scope.condition);
				}
				$scope.list(id_app,condition).success(function(data){
					if(!$scope.condition){
						var key = $scope.module + '_' + id_app;
						$cache[key] = data;
					}
					$scope.items = [];
					if($scope.emptyYn){
						var empty_item = eval("(" + "{" + $scope.fieldModel + ":''," + $scope.fieldLabel + ":'" + $scope.headerText + "'}" + ")");
						$scope.items.push(empty_item);
					}
					angular.forEach(data,function(r){
						$scope.items.push(r);
					});
					//default
					if(!$scope.ngModel && $scope.items.length>0){
						$scope.ngModel =$scope.items[0][$scope.fieldModel];
					}
				});
			}
			$scope.showList = function () {
				var modalInstance = $modal.open({
				  templateUrl:"templates/" + $scope.group + "/" + $scope.module + '/templates/dialog-select.html',
				  controller:  ['$scope', '$modalInstance','parentScope',function($scope, $modalInstance,parentScope){
						$scope.getList = function(value,limit){
							var condition={};
							if(parentScope.condition){
								_.extend(condition,parentScope.condition);
							}
                            if(parentScope.fieldsSearch=="$text"){
                                condition.$text = {$search:value};
                            }else{
                                condition.$or =[];
                                parentScope.fieldsSearch.forEach(function(field){
                                    var f = eval("({" +  field + ":{$regex:'" + value + "',$options:'i'}" + "})");
                                    condition.$or.push(f);
                                });
                            }
							
							parentScope.list(id_app,condition,null,limit).then(function(res){
								$scope.items = res.data;
							});
						}
						$scope.keyup = function($event,value){
							if($event.keyCode==13 && value){
								$scope.getList(value);
							}
						}
						$scope.getList("",10);
						$scope.select = function (item){
							if(parentScope.multiple){
								parentScope.ngModel = [item[parentScope.fieldModel]];
							}else{
								parentScope.ngModel = item[parentScope.fieldModel];
							}
							
							if(parentScope.fieldLabel){
								parentScope.label = item[parentScope.fieldLabel];
							}
							if(parentScope.onSelect){
								parentScope.onSelect({$item:item});
							}
							$modalInstance.close();
						}
						$scope.cancel = function(){
							$modalInstance.dismiss('cancel');
						}
						$scope.openList = function() {
							var url = "#/" + parentScope.module;
							var w = $window.open(url,"Danh mục","width=" + $window.innerWidth.toString() + ",height=400")
							var interval = $interval(function(){
								if(w.closed){
									parentScope.refresh();
									$interval.stop(interval);
								}
							},100);
							$modalInstance.dismiss('cancel');
						}
						$scope.quickadd = function(){
							module.quickadd($modal,function(item){
								parentScope.items.push(item);
								if(parentScope.multiple){
									parentScope.ngModel = [item[parentScope.fieldModel]];
								}else{
									parentScope.ngModel = item[parentScope.fieldModel];
								}
								
								if(parentScope.fieldLabel){
									parentScope.label = item[parentScope.fieldLabel];
								}
								if(parentScope.onSelect){
									parentScope.onSelect({$item:item});
								}
								var key = parentScope.module + '_' + id_app;
								if($cache[key]){
									$cache[key].push(item);
								}
							},parentScope.defaultValues);
							$modalInstance.dismiss('cancel');
						}
						
					}],
				  size: "lg",
				  resolve: {
					parentScope: function () {
					  return $scope;
					}
				  }
				});

			}
			
			$scope.getList = function(){
				var key = $scope.module + '_' + id_app;
				if($cache[key] && !$scope.condition && $scope.cache){
					var data = $cache[key];
					$scope.items = [];
					if($scope.emptyYn){
						var empty_item = eval("(" + "{" + $scope.fieldModel + ":''," + $scope.fieldLabel + ":'" + $scope.headerText + "'}" + ")");
						$scope.items.push(empty_item);
					}
					angular.forEach(data,function(r){
						$scope.items.push(r);
					});
					//default
					if(!$scope.ngModel && $scope.items.length>0){
						$scope.ngModel =$scope.items[0][$scope.fieldModel];
					}
				}else{
					$scope.refresh();
				}
				
			}
		}],
		link:function(scope,elem,attrs){
			var conditionData={}
			if(scope.conditionData){
				conditionData = scope.conditionData;
			}
			if(attrs.hasOwnProperty("condition")){
				scope.condition = eval("({" + attrs.condition + "})");
			}
			if(attrs.hasOwnProperty("cache")){
				scope.cache = attrs.cache
			}else{
				scope.cache =false;
			}
			if(attrs.hasOwnProperty("headerText")){
				scope.headerText =  attrs.headerText;
			}else{
				scope.headerText =  "--";
			}
			if(attrs.hasOwnProperty("multiple")){
				scope.multiple = attrs.multiple;
			}
			if(attrs.hasOwnProperty("defaultValues")){
				scope.defaultValues = eval("({" + attrs.defaultValues + "})");
			}else{
				scope.defaultValues ={};
			}
			if(attrs.hasOwnProperty("group")){
				scope.group = attrs.group;
			}else{
				scope.group = "lists";
			}
			if(!attrs.hasOwnProperty("ngRequired") && !attrs.hasOwnProperty("required")){
				scope.emptyYn = true;
			}else{
				scope.emptyYn = false;
			}
			scope.getList();
		}
	}
}]);
accApp.directive('stpLink',function(){
	return {
		restrict:'E',
		scope:{
			link:"=",
			collection:"@",
			collectionsLink:"@"
		},
		templateUrl:"templates/sys/link.html",
		controller:['$scope','$http','$window','$location',function($scope,$http,$window,$location){
			$scope.textSearch="";
			$scope.location = $location.url();
			var collectionsLink = eval("({" + $scope.collectionsLink + "})")
			var collections = _.keys(collectionsLink)
			var collectionsTitle ={};
			collections.forEach(function(c){
				var module_name = c + "Module";
				var module = eval("(" + module_name  + ")")
				collectionsTitle[c] = module.title;
			})
			$scope.collectionsTitleString = _.values(collectionsTitle).join();
			$scope.load = function(){
				var url = server_url + "/api/" + id_app + "/linkslist?_id=" + $scope.link._id + "&collections=" + collections.join();
				$http.get(url).success(function(rs){
					$scope.link.links=rs;
				}).error(function(e){
					if(e){
						$window.alert(e);
					}
					
				});
			}
			$scope.getHeaderCollection = function(r){
				return collectionsTitle[r.collection_obj];
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
				var check = _.find($scope.link.links,function(item){
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
					$scope.link.links.push(obj_link);
				}).error(function(e){
					if(e){
						$window.alert(e);
					}
					
				})
				
			}
			$scope.unLink = function(obj){
				var url =server_url + "/api/" + id_app + "/link/" + obj._id;
				$http.delete(url).success(function(rs){
					$scope.link.links = _.reject($scope.link.links,function(item){
						return item._id==obj._id;
					})
				}).error(function(e){
					if(e){
						$window.alert(e);
					}
					
				})
				
			}
			$scope.getItem = function($item, $model, $label){
				$scope.addLink($item,$label);
				
			}
		}],
		link:function(scope,elem,attrs,contr){
			if(!attrs.link || !attrs.collection|| !attrs.collectionsLink){
				console.error("stp-link directive require attributes:link,collection,collection-link")
			}
			scope.$watch('link',function(newValue){
				if(newValue){
					if(!scope.link.links){
						scope.link.links=[]
					}
					scope.load()
				}
			})
		}
	}
})
accApp.directive('ngGetInfo',['$http',function($http){
	return {
		restrict:'A',
		scope:{
			conditionValue:'=',
			runWhenConditionChanged:'=',
			ngModel:'='
		},
		controller:['$scope',function($scope){
			var list = function(id_app,condition,fields){
				var url = server_url + "/api/" + id_app + "/" + $scope.pathService + "?t=1"
				if(condition){
					if(angular.isObject(condition)){
						var q =JSON.stringify(condition);
						url = url + "&q=" + q;
					}else{
						url = url + "&" + condition;
					}
				}
				if(fields){
					url = url + "&fields=" + fields;
				}
				return $http.get(url);
			}
			$scope.getValue = function(callback){
				var condition ={};
				for(var key in $scope.condition){
					var value = $scope.condition[key];
					if(value=='???'){
						condition[key] = $scope.conditionValue;
					}else{
						condition[key] = value;
					}
				}
				
				list(id_app,condition,$scope.fieldInfo)
					.success(function(items){
						if(items.length==1){
							callback(items[0][$scope.fieldInfo]);
						}
						return;
					});
			}
		}],
		link:function(scope,elem,attrs){
		
			var ngGetInfo = eval("({" + attrs.ngGetInfo + "})");
			scope.fieldInfo = ngGetInfo.fieldInfo;
			var module = eval("(" + ngGetInfo.module + "Module)");
			scope.pathService = module.server_path;
			scope.condition = ngGetInfo.condition;
			if(!attrs.hasOwnProperty("runWhenConditionChanged")){
				scope.runWhenConditionChanged = true;
			}
			scope.$watch('conditionValue',function(newValue){
				if(!scope.runWhenConditionChanged){
					return;
				}
				if(!newValue){
					scope.ngModel = null;
					return;
				}
				if(scope.fieldInfo){
					
					scope.getValue(function(value){
						scope.ngModel = value;
					});
					
				}
				
			});
		}
	}
}]);
accApp.directive('history',function(){
	return{
		restrict:'E',
		scope:{
			link:'=',
			module:'@',
			actions:'@'
		},
		templateUrl:'templates/sys/history.html',
		controller:['$scope','$http','$modal',function($scope,$http,$modal){
			var module = eval("(" + $scope.module + "Module)");
			$scope.getHistory = function(){
				var url = server_url + "/api/" + id_app + "/" + module.server_path + "/history/" + $scope.link._id;
				if($scope.actions){
					url =url + "?actions=" + $scope.actions;
				}
				$http.get(url)
				.success(function(history){
					history.forEach(function(row){
						if(row.action=="GET"){
							row.action_text ="Đã xem"
						}else{
							if(row.action=="UPDATE"){
								row.action_text ="Đã cập nhật"
							}else{
								if(row.action=="ADD"){
									row.action_text ="Đã tạo"
								}else{
									row.action_text = row.action;
								}
							}
						}
						
					})
					$scope.history = history;
				}).error(function(e){
					console.error(e);
				})
			}
			$scope.openProfile = function(email){
				viewProfile($modal,email)
			} 
		}],
		link:function($scope,ele,atrs,contr){
			$scope.$watch('link',function(newValue){
				if(newValue){
					$scope.getHistory();
				}
			})
		}
	}
});
accApp.directive('parseHtml',function(){
	return{
		restrict:'A',
		scope:{
			parseHtml:'='
			
		},
		link:function(scope,elem,attrs,controller){
			scope.$watch('parseHtml',function(newValue,oldValue){
				 
				 if(newValue){
					var res = /<[a-z][\s\S]*>/i.test(newValue);
					if(res){
						elem.html(newValue);
					}else{
						elem.html(newValue.replace(/\n/g,'<br/>'));
					}
						
				 }
			});
		}
	}
});
accApp.directive('parseText',function(){
	return{
		restrict:'A',
		scope:{
			parseText:'=',
			limit:'@'
			
		},
		link:function(scope,elem,attrs,controller,$filter){
			scope.$watch('parseText',function(newValue,oldValue){
				 
				 if(newValue){
					var res = /<[a-z][\s\S]*>/i.test(newValue);
					var text;
					if(res){
						 elem.html(newValue);
						 text = elem.text();
					}else{
						text = newValue;
					}
					if(scope.limit && text.length> Number(scope.limit)){
						text = text.substring(0,scope.limit) + "..."
					}
					elem.text(text);
						
				 }
			});
		}
	}
});

accApp.directive('textcomplete', ['Textcomplete', function(Textcomplete) {
    return {
        restrict: 'EA',
        scope: {
            members: '=',
            message: '='
        },
        template: '<textarea class="form-control" rows="5" ng-model=\'message\' type=\'text\'></textarea>',
        link: function(scope, iElement, iAttrs) {
			scope.$watch("members",function(newValue){
				if(newValue && newValue.length>0){
					var mentions = scope.members;
					var ta = iElement.find('textarea');
					var textcomplete = new Textcomplete(ta, [
					  {
						match: /(^|\s)@(\w*)$/,
						search: function(term, callback) {
							callback($.map(mentions, function(mention) {
								return mention.toLowerCase().indexOf(term.toLowerCase()) === 0 ? mention : null;
							}));
						},
						index: 2,
						replace: function(mention) {
							return '$1@' + mention + ' ';
						}
					  }
					]);

					$(textcomplete).on({
					  'textComplete:select': function (e, value) {
						scope.$apply(function() {
						  scope.message = value
						})
					  },
					  'textComplete:show': function (e) {
						$(this).data('autocompleting', true);
					  },
					  'textComplete:hide': function (e) {
						$(this).data('autocompleting', false);
					  }
					});
				}
			})
            
        }
    }
}]);

accApp.directive('routeLoader', function() {
  return {
    restrict: 'EA',
    link: function(scope, element) {
      // Store original display mode of element
      var shownType = element.css('display');
      function hideElement() {
        element.css('display', 'none');
      }
            
      scope.$on('$routeChangeStart', function() {
        element.css('display', shownType);
      });
      scope.$on('$routeChangeSuccess',hideElement);
      scope.$on('$routeChangeError', hideElement);
      // Initially element is hidden
      hideElement();
    }
  }
});
accApp.directive('serverLoader', function() {
  return {
    restrict: 'EA',
    link: function(scope, element) {
      // Store original display mode of element
      var shownType = element.css('display');
      function hideElement() {
        element.css('display', 'none');
      }
            
      scope.$on('$dataChangeStart', function() {
		scope.serverAction ="Đang tải dữ liệu"
        element.css('display', shownType);
      });
	  scope.$on('$dataSaveStart', function() {
		scope.serverAction ="Đang lưu dữ liệu"
        element.css('display', shownType);
      });
      scope.$on('$dataChangeSuccess',hideElement);
      scope.$on('$dataChangeError', hideElement);
	  scope.$on('$dataSaveSuccess',hideElement);
      scope.$on('$dataSaveError', hideElement);
      // Initially element is hidden
      hideElement();
    }
  }
});
accApp.directive('fileUploadProgress', function() {
  return {
    restrict: 'EA',
    link: function(scope, element) {
      // Store original display mode of element
      var shownType = element.css('display');
      function hideElement() {
        element.css('display', 'none');
      }
      scope.$on('$fileUploadStart', function() {
		scope.serverAction ="Đang tải dữ liệu"
        element.css('display', shownType);
      });
      scope.$on('$fileUploadSuccess',hideElement);
      scope.$on('$fileUploadError', hideElement);
      // Initially element is hidden
      hideElement();
    }
  }
});
accApp.directive('follow', function() {
  return {
    restrict: 'E',
	scope:{
		collectionsFollow:"@"
	},
	templateUrl: 'templates/sys/follow.html',
	controller:['$scope','$rootScope','$http','appInfo',function($scope,$rootScope,$http,appInfo){
		$scope.load = function(){
			appInfo.info('follow',function(error,userinfo,appinfo){
				$scope.follows =[];
				if(!error && appinfo._id){
					if(!$scope.collectionsFollow || !appinfo){
						return;
					}
					var url =server_url +"/api/" + appinfo._id + "/follow?q={user_created:'" + userinfo.email + "'}&collections=" + $scope.collectionsFollow;
					$http.get(url).success(function(follows){
						
						$scope.follows = follows;
					})
				}
			})
		}
		
	}],
    link: function(scope, element,attr,contr) {
		scope.load();
    }
  }
});
accApp.directive('like', function() {
  return {
    restrict: 'E',
	scope:{
	},
	templateUrl: 'templates/sys/like.html',
	controller:['$scope','$rootScope','$http','appInfo',function($scope,$rootScope,$http,appInfo){
		$scope.load = function(){
			appInfo.info('like_module',function(error,userinfo,appinfo){
				$scope.likes =[];
				if(!error && appinfo._id){
					var url =server_url +"/api/" + appinfo._id + "/like_module?q={user_created:'" + userinfo.email + "',like:true}";
					$http.get(url).success(function(likes){
						$scope.likes = likes;
					})
				}
			})
		}
	}],
    link: function(scope, element,attr,contr) {
		scope.load();
    }
  }
});
accApp.directive('shortcut',['$document','$rootScope', function($document,$rootScope) {
  return {
    restrict: 'A',
    link:    function postLink(scope, iElement, iAttrs){
	  $document.bind('keydown', function(e) {
		  //disable ctrl+a , F5
		  if((e.ctrlKey && (e.which == 65 || e.which==77 || e.which==78 || e.which==68 || e.which==69 || e.which==80 || e.which==85 || e.which==83 ))  || (e.which == 116)){
			  e.preventDefault();
		  }else{
			//console.log(e)
		  }
		  $rootScope.$apply(function () {
			  $rootScope.$broadcast('keydown', e);
		  });
	  });
    }
  };
}]);
accApp.directive('input', function() {
    return {
        restrict: 'E',
        priority: -1,
        link: function(scope, element, attrs) {
            if (attrs.type == 'date') {
                // Doesn't appear to need a setTimeout when used like this
                $(element).updatePolyfill();
            }
        }
    };
});
accApp.directive("dashboardChart",function(){
    return {
        restrict: 'E',
        scope:{
            
        },
        templateUrl:"templates/sys/dashboard-chart.html",
        controller: ['$scope','$localStorage','user','$rootScope','$location','$timeout','$http','api','$window','$interval','appInfo','$modal','$filter',function($scope,$localStorage,user,$rootScope,$location,$timeout,$http,api,$window,$interval,appInfo,$modal,$filter){
               $scope.ten_bao_cao ="Báo cáo doanh thu";
               $scope.series = ['Doanh thu (1000 VNĐ)'];
               $scope.labels = [""];
               var data=[0];
               var now = new Date();
               var current_report;

               $scope.condition ={nam:now.getFullYear()};
               $scope.condition.tu_nam = now.getFullYear()-1;
               $scope.condition.den_nam = now.getFullYear();
               $scope.condition.tu_ngay = new Date(now.getFullYear(),0,1);
               $scope.condition.den_ngay = now;
               $scope.condition.use ={};
               $scope.type=$localStorage.get("type_chart");
               if(!$scope.type){
                   $scope.type= "Line";
               }

               $scope.type_charts =["Line","Bar","Doughnut","Radar","Pie","PolarArea"];
               $scope.selectType = function(t){
                   $scope.type = t;
                   if($scope.type=="Line" || $scope.type=="Bar" || $scope.type =="Radar"){
                        $scope.data = [data];   
                   }else{
                        $scope.data = data;
                   }
                   $localStorage.set("type_chart",t);
               }

               $scope.dtbanletheothang = function(){
                   $scope.labels = [""];
                   data = [0];
                   $scope.selectType($scope.type);

                   $scope.condition.use ={};
                   $scope.condition.use.nam = true;
                   $scope.ten_bao_cao ="Doanh thu bán lẻ theo tháng";
                   var url_rpt = server_url +"/api/" + id_app + "/dtbanletheothang?nam=" + $scope.condition.nam;
                   $http.get(url_rpt).success(function(datas){
                        datas = _.filter(datas,function(d){
                            return d.bold !==true;
                        });
                       datas =_.sortBy(datas,function(d){
                           return Number(d.thang);
                       });

                        var labels = _.pluck(datas,"thang");
                       $scope.labels = [];
                       labels.forEach(function(t){
                            $scope.labels.push("Tháng " + t);

                       });

                       data=_.pluck(datas,"t_doanh_thu");
                        //don vi tinh 1000 đ
                       for(var i=0;i<data.length;i++){
                           data[i]  = data[i]/1000;
                       }

                       $scope.selectType($scope.type);


                    });
                    $scope.onClick = function (points, evt) {
                        if(points.length>0){
                            var url ="/dtbanletheothang?nam=" + $scope.condition.nam;
                            url = url + "&isDrillDown=true"
                            $location.url(url);
                        }
                    }
                   current_report = $scope.dtbanletheothang;
                   $scope.refresh_yn = false;
                }
               $scope.dtbanletheoquy = function(){
                   $scope.labels = [""];
                   data = [0];
                   $scope.selectType($scope.type);

                   $scope.condition.use ={};
                   $scope.condition.use.nam = true;
                    $scope.ten_bao_cao ="Doanh thu bán lẻ theo quý";
                    var url_rpt = server_url +"/api/" + id_app + "/dtbanletheoquy?nam=" + $scope.condition.nam ;
                    $http.get(url_rpt).success(function(datas){
                        datas = _.filter(datas,function(d){
                            return d.bold !==true;
                        })
                         datas =_.sortBy(datas,function(d){
                           return Number(d.quy);
                       })

                        var labels = _.pluck(datas,"quy");
                       $scope.labels = [];
                       labels.forEach(function(t){
                            $scope.labels.push("Quý " + t);
                       })

                        data=_.pluck(datas,"t_doanh_thu");
                        //don vi tinh 1000 đ
                        for(var i=0;i<data.length;i++){
                           data[i]  = data[i]/1000;
                       }
                        $scope.selectType($scope.type);

                    });
                    $scope.onClick = function (points, evt) {
                        if(points.length>0){
                             var url ="/dtbanletheoquy?nam=" + $scope.condition.nam;
                             url = url + "&isDrillDown=true"
                             $location.url(url);
                        }
                    }
                    current_report = $scope.dtbanletheoquy;
                   $scope.refresh_yn = false;
                }
               $scope.dtbanletheonam = function(){
                   $scope.labels = [""];
                   data = [0];
                   $scope.selectType($scope.type);

                   $scope.condition.use ={};
                   $scope.condition.use.tu_nam = true;
                   $scope.condition.use.den_nam = true;
                    $scope.ten_bao_cao ="Doanh thu bán lẻ theo năm";
                    var url_rpt = server_url +"/api/" + id_app + "/dtbanletheonam?tu_nam=" + $scope.condition.tu_nam + "&den_nam=" + $scope.condition.den_nam ;
                    $http.get(url_rpt).success(function(datas){
                        datas = _.filter(datas,function(d){
                            return d.bold !==true;
                        })
                         datas =_.sortBy(datas,function(d){
                           return Number(d.quy);
                       })

                        var labels = _.pluck(datas,"nam");
                       $scope.labels = [];
                       labels.forEach(function(t){
                            $scope.labels.push("Năm " + t);
                       })

                        data=_.pluck(datas,"t_doanh_thu");
                        //don vi tinh 1000 đ
                        for(var i=0;i<data.length;i++){
                           data[i]  = data[i]/1000;
                       }
                        $scope.selectType($scope.type);

                    });
                    $scope.onClick = function (points, evt) {
                        if(points.length>0){
                             var url ="/dtbanletheonam?tu_nam=" + $scope.condition.tu_nam + "&den_nam=" + $scope.condition.den_nam ;
                             url = url + "&isDrillDown=true"
                             $location.url(url);
                        }
                    }
                    current_report = $scope.dtbanletheonam;
                   $scope.refresh_yn = false;
                }
               $scope.dtbanletheonv = function(){
                   $scope.labels = [""];
                   data = [0];
                   $scope.selectType($scope.type);

                   $scope.condition.use ={};
                   $scope.condition.use.ngay = true;
                   $scope.condition.use.nv = true;
                    $scope.ten_bao_cao ="Doanh thu bán lẻ theo nhân viên";
                    var url_rpt = server_url +"/api/" + id_app + "/dtbanletheonv?" ;
                    url_rpt = url_rpt + "tu_ngay=" + $filter("date")($scope.condition.tu_ngay,"yyyy-MM-dd");
                    url_rpt = url_rpt + "&den_ngay=" + $filter("date")($scope.condition.den_ngay,"yyyy-MM-dd");
                    if($scope.condition.user_created){
                        url_rpt = url_rpt + "&user_created=" + $scope.condition.user_created;    
                    }

                    $http.get(url_rpt).success(function(datas){
                        datas = _.filter(datas,function(d){
                            return d.bold !==true;
                        })

                        $scope.labels = _.pluck(datas,"name");
                        data=_.pluck(datas,"t_doanh_thu");
                        //don vi tinh 1000 đ
                        for(var i=0;i<data.length;i++){
                               data[i]  = data[i]/1000;
                           }

                        $scope.selectType($scope.type);

                    });
                    $scope.onClick = function (points, evt) {
                       if(points.length>0){
                           var url ="/dtbanletheonv?";
                            url = url + "tu_ngay=" + $filter("date")($scope.condition.tu_ngay,"yyyy-MM-dd");
                            url = url + "&den_ngay=" + $filter("date")($scope.condition.den_ngay,"yyyy-MM-dd");
                            url = url + "&isDrillDown=true"
                            if($scope.condition.user_created){
                                url = url + "&user_created=" + $scope.condition.user_created;    
                            }
                            $location.url(url);
                       }
                        
                    }
                    current_report = $scope.dtbanletheonv;
                   $scope.refresh_yn = false;
                }
               $scope.refresh = function(){
                   $scope.refresh_yn = true;
                   current_report();
               }
               $scope.dkloc = function(){
                   var modalInstance = $modal.open({
                      templateUrl:"templates/dashboard/templates/find.html",
                      controller:  ['$scope','$modalInstance','parentScope',function($scope,$modalInstance,parentScope){
                            $scope.condition = parentScope.condition;
                            $scope.okFind = function (){
                                parentScope.refresh();
                                $modalInstance.dismiss('ok');
                            };
                            $scope.cancelFind = function () {
                                $modalInstance.dismiss('cancel');
                            };
                        }],
                      size: 'lg',
                      resolve: {
                        parentScope: function () {
                          return $scope;
                        }
                      }
                    });
               }   
               $scope.refresh_yn = true;
               $rootScope.$watch('commands',function(newValue){
                   if(newValue && newValue.modules){
                       $scope.dtbanletheothang_visible = newValue.modules.rpt_bh_dtbanletheothang.command.visible;
                       $scope.dtbanletheoquy_visible = newValue.modules.rpt_bh_dtbanletheoquy.command.visible;
                       $scope.dtbanletheonv_visible = newValue.modules.rpt_bh_dtbanletheonv.command.visible;
                       $scope.dtbanletheonam_visible = newValue.modules.rpt_bh_dtbanletheonam.command.visible;
                       $scope.chart_hide = !($scope.dtbanletheothang_visible || $scope.dtbanletheoquy_visible || $scope.dtbanletheonam_visible|| $scope.dtbanletheonv_visible);
                       if($scope.dtbanletheothang_visible){
                            $scope.dtbanletheothang();    
                       }else{
                           if($scope.dtbanletheoquy_visible){
                               $scope.dtbanletheoquy();
                           }else{
                               if($scope.dtbanletheonam_visible){
                                    $scope.dtbanletheonam();
                               }else{
                                   if($scope.dtbanletheonv_visible){
                                        $scope.dtbanletheonv();
                                   }
                               }

                           }
                       }

                   }
               },true);
        }]
     
    }
    
});
/*accApp.directive("reportTable",[
    function(){
        var header;
        var style = {
           cursor:'pointer'
        }
        var style_cell = {
            padding:'5px'
        }
        var format = function(scope,value,type,f){
           if(!value) return "";
           if(!type){
               if(_.isNumber(value)){
                 type = 'number';
                 f =0;
               }else{
                    if(_.isDate(value)){
                        type ='date';
                        f ='dd/MM/yyyy';
                    }
               } 
           }
           if(!type)
              return value;
           else
              return scope.format(value,type,f);
       }
        var MYCELL = React.createClass({
           render:function(){
               var text = this.props.data;
               var columnInfo = this.props.columnInfo;
               var className = columnInfo.className;
               if(!className) className ='r-text-left';
               return React.DOM.td({style:style_cell,className:className},text);
           } 
        });
        
        var MYROW = React.createClass({
           render:function(){
               var data = this.props.data;
               var scope = this.props.scope;
               var tableInfo = scope.tableInfo;
               var drilldown = function(){
                    if(!scope.drillDown) return;
                    scope.$apply(function(){
                        scope.drillDown({$ma_ct:data.ma_ct,$id_ct:data.id_ct});
                    });
               }
               var cells = tableInfo.map(function(column){
                 return React.createElement(MYCELL,{data:format(scope,data[column.name],column.type,column.f),columnInfo:column}); 
               });
               var key = data._id?data._id:'' + data.id_ct?data.id_ct:'SUM' + data.nh_dk?data.nh_dk:'0';
               if(data.bold){
                    return React.DOM.tr({onClick:drilldown,style:style,className:'cbold',key:key },cells);    
               }else{
                    return React.DOM.tr({onClick:drilldown,style:style,key:key },cells);    
               }
               
           } 
        });
        var MYTABLE = React.createClass({
           getInitialState: function() {
              return {
                  data: []
              };
          },
           render:function(){
               var scope = this.props.scope;
               var tableInfo = scope.tableInfo;
               if(!header){
                   var headers = [];
                   tableInfo.forEach(function(column){
                       headers.push(React.DOM.th(null,column.header));
                   });
                   header = React.createElement('tr',{key:'header'},headers);
               }
               
               
               var rows=[header];
               this.state.data.map(function(row){
                   var tr = React.createElement(MYROW,{data:row,scope:scope});
                   rows.push(tr);
               });
               
               return (
                   React.DOM.table(
                        {
                            className:'rtable',key:'RTABLE'
                        },
                        rows
                   )
               );
                
           }
        });
        return {
            restrict:'E',
            scope:{
                data:'=',
                tableInfo:'=',
                drillDown:'&'
            },
            template:"<div></div>",
            controller:['$scope','$location','$filter',function($scope,$location,$filter){
               
               $scope.format = function(value,type,par){
                   return $filter(type)(value,par);
               }
            }],
            link:function($scope,ele,attrs,ctrl){
                var elementReact = React.createElement(MYTABLE,{scope:$scope});
                var component = ReactDOM.render(elementReact,ele[0]);
                $scope.$watch("data",function(newValue,oldValue){
                    if(!newValue){
                       component.setState(function(){
                            return {data:[]};
                       }); 
                    }else{
                        component.setState(function(){
                            return {data:newValue};
                        });
                    }
                    
                },true);
            }
            
        }
    }
]);
*/
