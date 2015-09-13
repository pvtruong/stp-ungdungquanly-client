var commentModule = new baseInput('comment','comment',["content","title"],'Nhận xét, góp ý',{
	has_view:true,
	onCondition:function(condition,value){
		condition.is_reply = false;
		condition.id_product = null;
	},
	onView:function($scope,options){
		var data = $scope.data;
		$scope.replies =[data]
		var query ={is_reply:true,id_topic:data._id};
		options.service.load(id_app,{condition:query})
			.success(function(rs){
				rs.forEach(function(r){
					$scope.replies.push(r);
				})
				
			}).error(function(e){
				console.log(e);
			});
		$scope.reply = function(){
			var r={content:$scope.content,is_reply:true,id_topic:data._id,title:data.title}
			options.service.create(id_app,r)
				.success(function(rs){
					$scope.replies.push(rs);
					$scope.content ="";
				}).error(function(e){
					console.log(e)
				})
		}
		$scope.quickedit = function(r){
			commentModule.quickedit(options.$modal,r._id,function(rs){
				_.extend(r,rs);
			})
		}
		$scope.deleteReply = function(r){
			if(confirm("Có chắc chắn xóa không?")){
				options.service.delete(id_app,r._id)
					.success(function(data){
						$scope.replies = _.reject($scope.replies,function(re){
							return(r._id ==re._id);
						});
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
	}
});
commentModule.module.directive('comment',function(){
	return{
		restrict:'E',
		scope:{
			link:'=',
			user:'=',
			title:'@'
		},
		templateUrl:"templates/lists/comment/templates/directive.html",
		link:function(scope,elem,attrs,controller){
			if(!attrs.user){
				console.error("comment directive require 'user' attribute")
			}
			if(!attrs.link){
				console.error("comment directive require 'link' attribute")
			}
		},
		controller:['$scope','$http','$window','$modal','$rootScope','$location','appInfo',function($scope,$http,$window,$modal,$rootScope,$location,appInfo){
			
			appInfo.info("comment",function(e,u,a){
				if(e) return;
				$scope.token = $rootScope.token;
				$scope.server_url = server_url;
				
				$scope.openProfile = function(email){
					viewProfile($modal,email);
				}
				$scope.getMembers = function(){
					//get members
					if($rootScope.app_info && $rootScope.app_info.participants){
						members =[];
						a = $rootScope.app_info;
						if(a.participants){
							members = _.pluck(a.participants,"email");
						}
						members.push(a.user_created)
						$scope.members = members;
					}
				}
				$scope.deleteComment = function(comment){
					if($window.confirm("Bạn có chắc chắn xóa nhận xét này không?")){
						$http.delete(server_url + "/api/comment/" + comment._id)
							.success(function(rs){
								$scope.comments = _.reject($scope.comments,function(r){
									return(r._id ==comment._id);
								});
								
							})
							.error(function(e){
								if(e) $window.alert(e);
							})
					}
				}
				$scope.editComment = function(comment){
					commentModule.quickedit($modal,comment._id,function(rs){
						_.extend(comment,rs);
					
					})
				}
				$scope.sendComment = function(content){
					if(!$scope.title){
						$scope.title ="Comment"
					}
					var comment ={id_product:$scope.idLink,title:$scope.title,content:content,user_created_obj:$scope.link.user_created,is_reply:true}
					comment.url_topic = server_url + "/#" + $location.url();
					if($scope.link.attends){
						comment.attends = $scope.link.attends;
					}
					$http.post(server_url + "/api/comment",comment).success(function(rs){
						$scope.content ="";
						if(rs){
							if(!$scope.comments){
								$scope.comments =[]
							}
							$scope.comments.push(rs);
							
							
						}
					}).error(function(e){
						if(e) $window.alert(e);
					})
				}
				$scope.load =function(){
					$http.get(server_url + "/api/comment?q={id_product:'" + $scope.idLink  + "'}")
							.success(function(comments){
								$scope.comments = comments;
								
							}).error(function(e){
								//$window.alert(e);
							})
				}
				
				$scope.$watch('link',function(newValue){
					if(newValue){
						$scope.idLink = $scope.link._id;
						$scope.load();
						$scope.getMembers()
					}
				},true)
			})
			
		}]
	}
});