var warrantyModule = new baseInput('warranty','warranty',["mieu_ta"],'Bảo hành',{
	has_view:false
});
warrantyModule.defaultValues={
	unit_time:2,
	ma_nt:'VND',
	reminder_yn:true,
	start_date:new Date()
}
warrantyModule.module.directive("warranty",function(){
	return {
		restrict:'E',
		scope:{
			link:'='
		},
		templateUrl:"templates/lists/warranty/templates/directive.html",
		controller:['$scope','$http','$location','$window','$modal','warranty','appInfo',function($scope,$http,$location,$window,$modal,warranty,appInfo){
			appInfo.info("warranty",function(e,u,appinfo){
				if(e) return;
				$scope.addwarranty=function(){
					warrantyModule.quickadd($modal,function(rs){
						$scope.warrantys.push(rs);
					},{id_hd:$scope.idLink})
				}
				$scope.viewwarranty=function(n){
					$location.url("/warranty/view/"+n._id + "?redirect=" + $location.url());
				}
				$scope.deletewarranty = function(n){
					if($window.confirm("Bạn có chắc chắn xóa bảo hành này không?")){
						warranty.delete(id_app,n._id)
							.success(function(rs){
								$scope.warrantys = _.reject($scope.warrantys,function(r){
									return(r._id ==n._id);
								});
							})
							.error(function(e){
								$window.alert(e);
							})
					}
				}
				$scope.editwarranty=function(n){
					warrantyModule.quickedit($modal,n._id,function(rs){
						_.extend(n,rs);
					});
				}
				$scope.load = function(){
					warranty.load(id_app,{condition:{id_hd:$scope.idLink}})
						.success(function(warrantys){
							$scope.warrantys = warrantys;
						}).error(function(e){
							$window.alert(e);
						})
				}
				$scope.$watch("link",function(newValue){
					if(newValue){
						$scope.idLink = $scope.link._id;
						$scope.load();
					}
				},true)
			})
			
		}],
		link:function($scope,element,attrs,controller){
			if(!attrs.link){
				console.error("warranty directive require 'link' attribute")
			}
			
		}
	}
})