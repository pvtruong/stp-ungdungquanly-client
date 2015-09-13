var colleagueModule = new baseInput('colleague','colleague',["email","email_owner"],'Danh sách đồng nghiệp',{services:function($http){
	return {
		active:function(id){
					return $http.get(server_url + "/api/colleague/active/" + id );
				},
		notaccept:function(id){
					return $http.get(server_url + "/api/colleague/notaccept/" + id );
				}
	}
}});
colleagueModule.module.controller('basecolleagueHomeController',['$scope','$window','$rootScope','colleague','$modal',function($scope,$window,$rootScope,colleague,$modal){
	$scope.unLink = function(id){
		colleague.notaccept(id).success(function(data){
			$window.location.reload();
		}).error(function(e){
			alert("Error");
		});
	}
	$scope.active = function(id){
		colleague.active(id).success(function(data){
			$window.location.reload();
		}).error(function(e){
			alert("Error");
		});
	}
	$scope.sendMessage = function(email_receiver){
		messageModule.quickadd($modal,function(msg){
			
		},{email_receiver:email_receiver});
	}
	$scope.openProfile = function(email){
		viewProfile($modal,email);
	}
}]);
colleagueModule.initHomeController = function($controller,$scope){
	$controller("basecolleagueHomeController",{$scope:$scope});
	
}
colleagueModule.initAddController = function($controller,$scope){
	$scope.data.content='Hãy chấp nhận lời mời tham gia vào mạng lưới của tôi';
}

