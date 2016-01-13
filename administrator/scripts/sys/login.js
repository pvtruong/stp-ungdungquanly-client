var loginModule = angular.module('loginModule',['ngRoute']);
loginModule.controller('loginController',['$scope','$rootScope','api','$http','$location','user','Base64','$window','$interval','$localStorage',function($scope,$rootScope,api,$http,$location,user,Base64,$window,$interval,$localStorage){
	$localStorage.set('token','');
	$localStorage.set('id_app','');
	$rootScope.app_info =undefined;
	$rootScope.isLogined = false;
	id_app =undefined;
	$rootScope.id_app = undefined;
	$rootScope.user = undefined;
	api.init();
	$scope.data ={};
	$scope.auth_google = function(){
		var w =$window.open(server_url + "/auth/google" ,"Google authentication",'height=400,width=400');
		var interval = $interval(function(){
			try{
				if(w.location.href && w.location.href.indexOf("/auth/google/callback")){
					if(w.document.body.innerHTML && w.document.body.innerHTML.indexOf("access_token")>=0){
                        
                        var user_profile = JSON.parse(w.document.title);
						var access_token =user_profile.access_token;
						$interval.cancel(interval);
						w.close();
						$localStorage.set('token', access_token);
						api.init(access_token);
						user.getInfo(function(user){
							$rootScope.user = user;
							$location.url("/app");
						});
					}
				}
			}catch(e){
				//console.log(e)
			}
			
		},500);
	}
	$scope.auth_facebook = function(){
		var w =$window.open(server_url + "/auth/facebook" ,"Facebook authentication",'height=400,width=400');
		var interval = $interval(function(){
			try{
				if(w.location.href && w.location.href.indexOf("/auth/facebook/callback")){
					if(w.document.body.innerHTML && w.document.body.innerHTML.indexOf("access_token")>=0){
						var access_token = w.document.title;
						$interval.cancel(interval);
						w.close();
						//
						$localStorage.set('token', access_token);
						api.init(access_token);
						user.getInfo(function(user){
							$rootScope.user = user;
							$location.url("/app");
						});
					}
				}
			}catch(e){
			}
			
		},500);
	}
	$scope.auth_local = function(){	
		var url =server_url + "/auth/local";
		var Authorization ="Basic " + Base64.encode($scope.data.username + ':' + $scope.data.password);
		$http.get(url,{headers:{Authorization:Authorization}}).success(function(token){
			$localStorage.set('token', token);
			api.init(token);
			user.getInfo(function(user){
				$rootScope.user = user;
				$location.url("/app");
			});
		}).error(function(error){
			$scope.messageError = error;
		});
	}
	$scope.signup = function(){
		$location.url("/signup");
	}
}]);
loginModule.controller('signupController',['$scope','$rootScope','api','$http','$location','$localStorage',function($scope,$rootScope,api,$http,$location,$localStorage){
	$localStorage.remove('token');
	$localStorage.remove('id_app');
	$rootScope.app_info =undefined;
	id_app =undefined;
	$rootScope.id_app = undefined;
	$rootScope.isLogined = false;
	api.init();
	$scope.data = {};
	$scope.signup = function(){
		var url = server_url + "/signup";
		$http.post(url,$scope.data)
		.success(function(data){
			$scope.alertType ="alert alert-success"
			$scope.messageError = data;
			$scope.data = {};
		})
		.error(function(error){
			$scope.alertType ="alert alert-danger"
			$scope.messageError = error;
		});
	}
}]);
loginModule.factory("user",['$http','$localStorage','$rootScope','$location','socket','nodeWebkit',function($http,$localStorage,$rootScope,$location,socket,nodeWebkit){
	return {
		getInfo:function(fn){
			if($rootScope.user){
				fn(null,$rootScope.user);
			}else{
				$http.get(server_url + "/api/user").success(function(user){
					var names = user.name.split(" ");
					user.last_name = names[names.length-1];
					$rootScope.error =undefined;
					$rootScope.user = user;
					// Add a connect listener
					socket.on('connect',function() {
					  socket.emit("login",{token:user.token,email:user.email});
					});
					socket.emit("login",{token:user.token,email:user.email});
					// Add a notifies listener
					socket.on('notify:count',function(data) {
					  $rootScope.notifies_count = data;
					  if(data){
						  nodeWebkit.notification("Bạn có thông báo mới");
					  }
					  
					});
					// Add a message listener
					socket.on('message:count',function(data) {
					  $rootScope.messages_count = data;
					  if(data){
						  nodeWebkit.notification("Bạn có tin nhắn mới");
					  }
					   
					});
					// Add a disconnect listener
					socket.on('disconnect',function() {
						//
					});
					
					fn(null,user);
				}).error(function(error){
					if(!error){
						error="Không thể kết nối với máy chủ";
					}
					$rootScope.error = error;
					$rootScope.user = undefined;
					fn(error);
					$location.url("login");
					
				});
			}
			
		},
		getProfile:function(email,fn){
			var url = server_url + "/api/profile?email=" + email;
			$http.get(url).success(function(profile){
				fn(null,profile);
			}).error(function(error){
				fn(error);
			});
		}
		,
		getProfileByToken:function(fn){
			var url = server_url + "/api/profile";
			$http.get(url).success(function(profile){
				fn(null,profile);
			}).error(function(error){
				fn(error);
			});
		},
		updateProfile:function(profile,fn){
			var url = server_url + "/api/updateprofile";
			$http.post(url,profile).success(function(profile){
				fn(null,profile);
			}).error(function(error){
				fn(error);
			});
		},
		updatePassword:function(passwords,fn){
			var url = server_url + "/api/changepassword";
			$http.post(url,passwords).success(function(password){
				fn(null,password);
			}).error(function(error){
				fn(error);
			});
		},
		resetPassword:function(email,fn){
			var url =server_url +  "/resetpassword?email=" + email;
			$http.get(url).success(function(info){
				fn(null,info);
			}).error(function(error){
				fn(error);
			});
		},
		getNotifies:function(fn){
			var url = server_url + "/api/notifies";
			$http.get(url).success(function(notifies){
				fn(null,notifies);
			}).error(function(error){
				fn(error);
			});
		},
		getMessagesColleagues:function(fn,unread){
			
			var url = server_url + "/api/message/colleague/latest";
			$http.get(url).success(function(colleagues){
				fn(null,colleagues);
			}).error(function(error){
				fn(error);
			});
		},
		logout:function(fn){
			if(!$localStorage.get('token')){
				return fn;
			}
			$http.get(server_url + "/api/user/logout").success(function(d){
				fn(d);
			}).error(function(error){
				fn();
			});
		}
	}
}]);
loginModule.controller('uploadController',['$scope','user','$localStorage','$rootScope','$location','app','$window','$routeParams',function($scope,user,$localStorage,$rootScope,$location,app,$window,$routeParams){
	var folder = $routeParams.folder;
	$scope.action = server_url + "/api/uploadfile?access_token=" + $localStorage.get('token') + "&folder=" + folder;
}]);
loginModule.controller('uploadExcelController',['$scope','user','$localStorage','$rootScope','$location','app','$window','$routeParams',function($scope,user,$localStorage,$rootScope,$location,app,$window,$routeParams){
	$scope.action = server_url + "/api/uploadexcel?access_token=" + $localStorage.get('token');
}]);
loginModule.controller('profileController',['$scope','user','$localStorage','$rootScope','$location','app','$window','$interval','appInfo',function($scope,user,$localStorage,$rootScope,$location,app,$window,$interval,appInfo){
	appInfo.info("profile",function(error,uerinfo,appinfo){
		if(error){
			return;
		}
		$scope.access_token = $localStorage.get('token')
		user.getProfileByToken(function(error,profile){
			if(error) {
				$scope.alertType ="danger";
				return $scope.messageError = error;
			}
			$scope.alertType ="success";
			$scope.data = profile;
		});
		$scope.updateProfile = function(){
			user.updateProfile($scope.data,function(error){
				if(error) {
					 $scope.alertType ="danger";
					return $scope.messageError = error
				}
				$scope.alertType ="success";
				$scope.messageError = "Bạn đã cập nhật thành công!";
			});
		}
		$scope.updatePassword = function(){
			user.updatePassword({oldPassword:$scope.oldPassword,newPassword:$scope.newPassword,reNewPassword:$scope.reNewPassword},function(error){
				if(error) {
					 $scope.alertTypeChangePass ="danger";
					return $scope.messageErrorChangePass = error
				}
				$scope.alertTypeChangePass ="success";
				$scope.messageErrorChangePass = "Bạn đã thay đổi mật khẩu thành công!";
			});
		}
	});
	
}]);
loginModule.controller('resetPasswordController',['$scope','user','$rootScope','$location','app',function($scope,user,$rootScope,$location,app){
	$scope.resetPassword = function(){
		user.resetPassword($scope.email,function(error,info){
			if(error){
				$scope.alertType ="alert alert-danger";
				$scope.messageError = error;
			}else{
				$scope.alertType ="alert alert-success";
				$scope.messageError = info;
			}
		});
	}
}]);

loginModule.controller('logoutController',['$scope','$localStorage','api','$location','$rootScope','user','$window','$timeout',function($scope,$localStorage,api,$location,$rootScope,user,$window,$timeout){
	
	user.logout(function(d){
		$rootScope.token =null
		$localStorage.remove('token');
		$localStorage.remove('id_app');
		$rootScope.app_info =undefined;
		$rootScope.isLogined = false;
		id_app =null;
		$rootScope.id_app = undefined;
		api.init();
		$location.url("/login");
		if($rootScope.user){
			var url;
			if($rootScope.user.server=='google'){
				url = "https://mail.google.com/mail/u/0/?logout&hl=en";
			}
			if($rootScope.user.server=='facebook'){
				//url = "https://facebook.com/logout.php?next=http://localhost:8000&access_token=" + token;
			}
			$rootScope.user = undefined;
			if(url){
				var w = $window.open(url,"Logout",'height=400,width=400');
				$timeout(function(){
					w.close();
				},3000);
			}
		}
		
	});
	
	
}]);
loginModule.controller('downloadController',['$scope','$http',function($scope,$http){
	$http.get(server_url + "/public/versioninfo").success(function(downloads){
		$scope.downloads = downloads;
	})
}])
loginModule.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider){
		$routeProvider
			.when("/signup",{
				templateUrl:"templates/login/templates/signup.html",
				controller:"signupController"
			})
			.when("/resetpassword",{
				templateUrl:"templates/login/templates/resetpassword.html",
				controller:"resetPasswordController"
			})
			.when("/profile",{
				templateUrl:"templates/login/templates/profile.html",
				controller:"profileController"
			})
			.when("/login",{
				templateUrl:"templates/login/templates/login.html",
				controller:"loginController"
			})
			.when("/logout",{
				templateUrl:"templates/login/templates/callback.html",
				controller:"logoutController"
			})
			.when("/download",{
				templateUrl:"templates/login/templates/download.html",
				controller:"downloadController"
			})
			.when("/uploadfile/:folder",{
				templateUrl:"templates/login/templates/upload.html",
				controller:"uploadController"
			})
			.when("/uploadexcel",{
				templateUrl:"templates/login/templates/upload.html",
				controller:"uploadExcelController"
			});
}]);