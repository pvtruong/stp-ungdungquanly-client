var mailscheduleModule = new baseInput('mailschedule','mailschedule',["subject","small_text"],'Email chờ gửi',{
	has_view:true,
	onAdd:function($scope,options){
		if($scope.data.to){
			$scope.data.to =eval($scope.data.to);
		}else{
			$scope.data.to =[];
		}
		$scope.data.html="";
		$scope.selectContact = function(contact){
			var to = {id:contact._id,name:contact.ten_lien_he,address:contact.email};
			var check = _.find($scope.data.to,function(t){
				return t.id==to.id;
			})
			if(!check){
				$scope.data.to.push(to);
			}
			$scope.ten_lien_he ="";
			$scope.email="";
		}
		$scope.removeContact = function(contact){
			$scope.data.to = _.reject($scope.data.to,function(to){
				return _.isEqual(contact,to);
			})
		}
		$scope.selectTemplate = function(template){
			if(template && template.mail){
				$scope.data.subject = template.subject;
				$scope.data.mail.html = template.mail.html;
			}
		}
		$scope.title ="Soạn email"
	},
	onEdit:function($scope,options){
		if(!$scope.data.to){
			$scope.data.to =[];
		}
		$scope.selectContact = function(contact){
			var to = {id:contact._id,name:contact.ten_lien_he,address:contact.email};
			var check = _.find($scope.data.to,function(t){
				return t.id==to.id;
			})
			if(!check){
				$scope.data.to.push(to);
			}
			$scope.ten_lien_he ="";
			$scope.email=""
		}
		$scope.removeContact = function(contact){
			$scope.data.to = _.reject($scope.data.to,function(to){
				return _.isEqual(contact,to);
			})
		}
		$scope.selectTemplate = function(template){
			if(template && template.mail){
				$scope.data.subject = template.subject;
				$scope.data.mail.html = template.mail.html;
			}
		}
		$scope.title ="Soạn email"
	},
	onSave:function($scope,data,options,next){
		var modalInstance = options.$modal.open({
			  templateUrl:"templates/lists/mailschedule/templates/dialog-beforsave.html",
			  controller:  ['$scope','$controller','$http','mailschedule','$location','mailscheduleConfig', '$modalInstance','$window','$routeParams','$timeout','$rootScope',function($scope,$controller,$http,service,$location,config, $modalInstance,$window,$routeParams,$timeout,$rootScope){
					$scope.data = data;
					$scope.save = function(){
						next(null,data);
						$modalInstance.close();
					}
					$scope.cancel = function(){
						next();
						$modalInstance.dismiss('cancel');
					}
					$scope.send_types = [{id:0,name:'Ngay bây giờ'},{id:1,name:'Chọn một thời gian cụ thể'}]
					$scope.repeats = [{id:0,name:'Không lặp lại'},{id:1,name:'Hàng ngày'},{id:2,name:'Hàng tháng'},{id:3,name:'Hàng quý'},{id:4,name:'Hàng năm'}]
			
				}],
			  size: "sm",
			  backdrop :'static',
			  resolve: {
				parentScope: function () {
				  return $scope;
				}
			  }
			});
	}
});
mailscheduleModule.defaultValues = {
	mail:{text:'',html:''},
	repeat:0,
	schedule:new Date(),
	send_type:0
}
//schedule
mailscheduleModule.module.directive("mailSchedule",function(){
	return {
		restrict:'E',
		scope:{
			link:'=',
			mailScheduleAdded:'='
		},
		templateUrl:"templates/lists/mailschedule/templates/schedule.html",
		controller:['$scope','$http','$location','$window','$modal','mailschedule','socket','appInfo',function($scope,$http,$location,$window,$modal,mailschedule,socket,appInfo){
			appInfo.info('mailSchedule',function(e,u,a){
				if(e) return;
				$scope.server_url = server_url;
				$scope.condition={txtsearch:'',account_id:""};
				$scope.viewmailschedule=function(mailschedule){
					$location.url("/mailschedule/view/"+mailschedule._id + "?redirect=" + $location.url());
				}
				$scope.deletemailschedule = function(mail){
					if($window.confirm("Bạn có chắc chắn xóa email này không?")){
						mailschedule.delete(id_app,mail._id)
							.success(function(rs){
								$scope.mailschedules = _.reject($scope.mailschedules,function(r){
									return(r._id ==mail._id);
								});
							})
							.error(function(e){
								$window.alert(e);
							})
					}
				}
				
				//load list mails
				$scope.service = mailschedule;
				$scope.limit =20;
				$scope.fields ='subject,from,to,user_created,date_created,small_text,sent,schedule,account_id,repeat,error,nextRunAt';
				$scope.getEmail = function(_id,next){
					mailschedule.load(id_app,{condition:{_id:_id},fields:$scope.fields})
						.success(function(data){
							if(data.length==1){
								next(data[0])
							}
						}).error(function(e){
							$window.alert(e);
						})
				}
				$scope.search = function(){
					var query ={};
					
					/*if($scope.condition.username){
						query.to = {$elemMatch:{address:$scope.condition.username}};
					}*/
					if($scope.condition.account_id){
						query.account_id = $scope.condition.account_id;
					}
					if($scope.condition.txtsearch){
						query.$or =[{subject:{$regex:$scope.condition.txtsearch,$options:'i'}}];
						query.$or.push({from:{$elemMatch:{address:{$regex:$scope.condition.txtsearch,$options:'i'}}}});
						query.$or.push({'mail.text':{$regex:$scope.condition.txtsearch,$options:'i'}})
					}
					$scope.query = 	query;
					$scope.start = true;//get data from server by ng-page-fx
				}
				$scope.searchKeyup = function($event){
					if($event.keyCode==13){
						$scope.search();
					}
					
				}
				//select all
				$scope.isSelectAll = false;
				$scope.selectAll = function(){
					if(!$scope.mailschedules){
						return;
					}
					$scope.isSelectAll = !$scope.isSelectAll;
					for(var i=0;i<$scope.mailschedules.length;i++){
						var r = $scope.mailschedules[i];
						r.sel = $scope.isSelectAll;
					}
				}
				//select 1 email
				$scope.isSelected =function(){
					if(!$scope.mailschedules){
						return false;
					}
					for(var i=0;i<$scope.mailschedules.length;i++){
						var r = $scope.mailschedules[i];
						if(r.sel && r.sel==true){
							return true;
						}
					}
					return false;
				}
				$scope.deleteSelected = function(){
					if(!$scope.mailschedules){
						return;
					}
					if($window.confirm("Bạn có chắc chắn xóa những email đã chọn không?")){
						var selected = _.filter($scope.mailschedules,function(mail){
							return mail.sel;
						})
						selected.forEach(function(mail){
							mailschedule.delete(id_app,mail._id)
								.success(function(rs){
									$scope.mailschedules = _.reject($scope.mailschedules,function(r){
										return(r._id ==mail._id);
									});
								})
								.error(function(e){
									$window.alert(e);
								})
						});
						
					}
				}
				$scope.linkSelected = function(){
					$window.alert("Chức năng này đang được xây dựng");
				}
				$scope.editmailschedule=function(mail){
					mailscheduleModule.quickedit($modal,mail._id,function(rs){
						_.extend(mail,rs);
					});
				}
				$scope.$watch("link",function(newValue){
					if(newValue){
						$scope.idLink = $scope.link.email;
						$scope.search();
						socket.on('email_schedule',function(_id) {
							if(!$scope.condition.txtsearch){
								$scope.getEmail(_id,function(data){
									if(!$scope.mailschedules){
										$scope.mailschedules =[];
									}
									if(!$scope.condition.account_id || $scope.condition.account_id==data.account_id){
										$scope.mailschedules.push(data);
									}
								})
								
							}
						});
					}
				},true)
			})
			
		}],
		link:function($scope,element,attrs,controller){
			if(!attrs.link){
				console.error("mail-schedule directive require 'link' attribute")
			}
			$scope.$watch("mailScheduleAdded",function(newValue){
				if(newValue){
					if(!$scope.mailschedules){
						$scope.mailschedules =[];
					}
					$scope.mailschedules.push(newValue);
				}
			},true)
		}
	}
})