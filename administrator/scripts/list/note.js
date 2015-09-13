var noteModule = new baseInput('note','note',["title"],'Ghi chú',{
	has_view:true
});
noteModule.module.directive("note",function(){
	return {
		restrict:'E',
		scope:{
			link:'='
		},
		templateUrl:"templates/lists/note/templates/directive.html",
		controller:['$scope','$http','$location','$window','$modal','note','appInfo','$rootScope',function($scope,$http,$location,$window,$modal,note,appInfo,$rootScope){
			appInfo.info("note",function(e,u,a){
				if(e) return;
				$scope.server_url = server_url;
				$scope.token = $rootScope.token;
				$scope.addNote=function(){
					noteModule.quickadd($modal,function(rs){
						$scope.notes.push(rs);
					},{id_link:$scope.idLink})
				}
				$scope.saveNote=function(content){
					$scope.$emit("$dataSaveStart")
					var n ={content:content,id_link:$scope.idLink}
					note.create(id_app,n).success(function(rs){
						$scope.notes.push(rs);
						$scope.content =""
						$scope.$emit("$dataSaveSuccess")
					}).error(function(e){
						console.log(e)
						$scope.$emit("$dataSaveError")
					})
				}
				$scope.viewNote=function(n){
					$location.url("/note/view/"+n._id + "?redirect=" + $location.url());
				}
				$scope.deleteNote = function(n){
					if($window.confirm("Bạn có chắc chắn xóa ghi chú này không?")){
						note.delete(id_app,n._id)
							.success(function(rs){
								$scope.notes = _.reject($scope.notes,function(r){
									return(r._id ==n._id);
								});
							})
							.error(function(e){
								if(e) $window.alert(e);
							})
					}
				}
				$scope.editNote=function(n){
					noteModule.quickedit($modal,n._id,function(rs){
						_.extend(n,rs);
					});
				}
				$scope.load = function(){
					note.load(id_app,{condition:{id_link:$scope.idLink}})
						.success(function(notes){
							$scope.notes = notes;
						}).error(function(e){
							if(e) $window.alert(e);
						})
				}
				$scope.openProfile=function(email){
					viewProfile($modal,email)
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
				console.error("note directive require 'link' attribute")
			}
			
		}
	}
})