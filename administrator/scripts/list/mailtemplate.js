var mailtemplateModule = new baseInput('mailtemplate','mailtemplate',["subject","name","small_text"],'Email mẫu',{
	onAdd:function($scope,options){
		$scope.data.html="";
	}
});
mailtemplateModule.defaultValues = {
	mail:{text:'',html:''}
}
mailtemplateModule.module.directive("mailTemplate",function(){
	return {
		restrict:'E',
		scope:{
			link:'='
		},
		templateUrl:"templates/lists/mailtemplate/templates/directive.html",
		controller:['$scope','$http','$location','$window','$modal','mailtemplate','appInfo',function($scope,$http,$location,$window,$modal,mailtemplate,appInfo){
			appInfo.info("mailTemplate",function(e,u,appinfo){
				if(e) return;
				$scope.server_url = server_url;
				$scope.condition={txtsearch:'',nhom:''};
				$scope.viewmailtemplate=function(mailtemplate){
					$location.url("/mailtemplate/view/"+mailtemplate._id + "?redirect=" + $location.url());
				}
				$scope.deletemailtemplate = function(mail){
					if($window.confirm("Bạn có chắc chắn xóa email này không?")){
						mailtemplate.delete(id_app,mail._id)
							.success(function(rs){
								$scope.mailtemplates = _.reject($scope.mailtemplates,function(r){
									return(r._id ==mail._id);
								});
							})
							.error(function(e){
								$window.alert(e);
							})
					}
				}
				
				//load list mails
				$scope.service = mailtemplate;
				$scope.limit =20;
				$scope.fields ='name,subject,user_created,date_created,small_text,nhom';

				$scope.search = function(){
					var query ={}
					if($scope.condition.nhom){
						query.nhom = $scope.condition.nhom;
					}
					if($scope.condition.txtsearch){
						query.$or =[{subject:{$regex:$scope.condition.txtsearch,$options:'i'}}];
						query.$or.push({name:{$regex:$scope.condition.txtsearch,$options:'i'}});
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
					if(!$scope.mailtemplates){
						return;
					}
					$scope.isSelectAll = !$scope.isSelectAll;
					for(var i=0;i<$scope.mailtemplates.length;i++){
						var r = $scope.mailtemplates[i];
						r.sel = $scope.isSelectAll;
					}
				}
				//select 1 email
				$scope.isSelected =function(){
					if(!$scope.mailtemplates){
						return false;
					}
					for(var i=0;i<$scope.mailtemplates.length;i++){
						var r = $scope.mailtemplates[i];
						if(r.sel && r.sel==true){
							return true;
						}
					}
					return false;
				}
				$scope.deleteSelected = function(){
					if(!$scope.mailtemplates){
						return;
					}
					if($window.confirm("Bạn có chắc chắn xóa những email đã chọn không?")){
						var selected = _.filter($scope.mailtemplates,function(mail){
							return mail.sel;
						})
						selected.forEach(function(mail){
							mailtemplate.delete(id_app,mail._id)
								.success(function(rs){
									$scope.mailtemplates = _.reject($scope.mailtemplates,function(r){
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
				$scope.editmailtemplate=function(mail){
					mailtemplateModule.quickedit($modal,mail._id,function(rs){
						_.extend(mail,rs);
					});
				}
				$scope.add=function(){
					mailtemplateModule.quickadd($modal,function(rs){
						if(!$scope.mailtemplates){
							$scope.mailtemplates =[];
						}
						$scope.mailtemplates.push(rs);
					});
				}
				
				$scope.$watch("link",function(newValue){
					if(newValue){
						$scope.idLink = $scope.link.email;
						$scope.search();
					}
				},true)
			})
			
		}],
		link:function($scope,element,attrs,controller){
			if(!attrs.link){
				console.error("mail-template directive require 'link' attribute")
			}
		}
	}
})