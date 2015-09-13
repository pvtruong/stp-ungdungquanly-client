var mailaccountModule = new baseInput('mailaccount','mailaccount',["username","fullname"],'Tài khoản email',{
	has_view:false,
	onAdd:function($scope,options){
		$scope.data.smtp={ssl:true,port:465};
		$scope.data.imap={tls:true,port:993};
		$scope.$watch("data.username",function(newvalue){
			if(newvalue && newvalue.indexOf("@")>0 && newvalue.indexOf(".") > 0){
				var host = newvalue.split("@")[1];
				$scope.data.smtp.host = "smtp." + host;
				$scope.data.imap.host = "imap." + host;
			}
		})
	}
});

mailaccountModule.module.directive("mailAccount",function(){
	return {
		restrict:'E',
		scope:{
			link:'='
		},
		templateUrl:"templates/lists/mailaccount/templates/directive.html",
		controller:['$scope','$http','$location','$window','$modal','mailaccount','appInfo','socket',function($scope,$http,$location,$window,$modal,mailaccount,appInfo,socket){
			appInfo.info("mailbox",function(error,userinfo,appinfo){
				if(!error){
					$scope.server_url = server_url;
					$scope.addmailaccount=function(){
					mailaccountModule.quickadd($modal,function(rs){
						$scope.mailaccounts.push(rs);
					},{id_link:$scope.idLink})
				}
				$scope.viewmailaccount=function(account){
					$location.url("/mailaccount/view/"+account._id + "?redirect=" + $location.url());
				}
				$scope.connect =  function(account){
					account.status_code = 9;//dang xu ly
					account.status_string='Đang xử lý';
					account.status = true;
					mailaccount.update(id_app,account._id,account).success(function(a){
						
					})
				}
				$scope.disconnect =  function(account){
					account.status_code = 9;//dang xu ly
					account.status_string='Đang xử lý';
					account.status = false;
					mailaccount.update(id_app,account._id,{status:false,status_code:0,status_string:'Không kết nối'}).success(function(a){
						
					})
				}
				$scope.deletemailaccount = function(account){
					if($window.confirm("Bạn có chắc chắn xóa tài khoản này không?")){
						mailaccount.delete(id_app,account._id)
							.success(function(rs){
								$scope.mailaccounts = _.reject($scope.mailaccounts,function(r){
									return(r._id ==account._id);
								});
							})
							.error(function(e){
								$window.alert(e);
							})
					}
				}
				$scope.editmailaccount=function(account){
					mailaccountModule.quickedit($modal,account._id,function(rs){
						_.extend(account,rs);
					});
				}
				$scope.load = function(){
					mailaccount.load(id_app,{condition:{id_link:$scope.idLink}})
						.success(function(mailaccounts){
							$scope.mailaccounts = mailaccounts;
						}).error(function(e){
							$window.alert(e);
						})
				}
				$scope.$watch("link",function(newValue){
					if(newValue){
						$scope.idLink = $scope.link.email;
						$scope.load();
					}
				},true)
				socket.on("email:disconnected",function(_id){
					console.log("ngat ket noi")
					if($scope.mailaccounts){
						var acc = _.find($scope.mailaccounts,function(acc){
							return acc._id == _id;
						})
						if(acc){
							acc.error = null
							acc.status_code = 0;
							acc.status_string = "Đã ngắt kết nối"
						}
					}
				})
				socket.on("email:connected",function(_id){
					console.log("ket noi")
					if($scope.mailaccounts){
						var acc = _.find($scope.mailaccounts,function(acc){
							return acc._id == _id;
						})
						if(acc){
							acc.error = null
							acc.status_code = 1;
							acc.status_string = "Đang kết nối"
						}
					}
				})
				socket.on("email:error",function(_id){
					if($scope.mailaccounts){
						var acc = _.find($scope.mailaccounts,function(acc){
							return acc._id == _id;
						})
						if(acc){
							acc.error = null
							acc.status_code = -1;
							acc.status_string = "Không thể kết nối với máy chủ mail"
						}
					}
				})
				}
			})
			
		}],
		link:function($scope,element,attrs,controller){
			if(!attrs.link){
				console.error("mail-account directive require 'link' attribute")
			}
			
		}
	}
})
var mailbox_tab_current ="received";
mailaccountModule.module.controller("mailboxController",["$scope",'$rootScope','$location','$modal','appInfo',function($scope,$rootScope,$location,$modal,appInfo){
	appInfo.info("mailbox",function(error,userinfo,appinfo){
		if(!error){
			$scope.current_user = userinfo;
			$scope.add = function(){
				mailscheduleModule.quickadd($modal,function(rs){
					$scope.mailScheduleAdded =rs;
					$scope.selectTab("schedule")
				});
			}
			
			$scope.selectTab = function(tab_name){
				mailbox_tab_current =tab_name
				$scope.tab_active_schedule=(mailbox_tab_current=='schedule');
				$scope.tab_active_account=(mailbox_tab_current=='account');
				$scope.tab_active_template=(mailbox_tab_current=='template');
				$scope.tab_active_received=(mailbox_tab_current=='received');
				$scope.tab_active_sent=(mailbox_tab_current=='sent');
				if(!$scope.tab_active_schedule && !$scope.tab_active_account && !$scope.tab_active_template && !$scope.tab_active_sent){
					$scope.tab_active_received = true;
				}
			}
			$scope.selectTab(mailbox_tab_current)
		}
	});
}]);
mailaccountModule.module.config(["$routeProvider","$locationProvider",function($routeProvider,$locationProvider){
	$routeProvider.when("/mailbox",{
		templateUrl:"templates/lists/mailaccount/templates/mailbox.html",
		controller:"mailboxController"
	})
}]);