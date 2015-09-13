var module = angular.module('searchModule',['ngRoute']);
module.controller('searchController',['$scope','$rootScope','$location','$http','$routeParams','dmkh','dmvt','dmtk','lienhe','task','contract','dmdt','$window','$localStorage','appInfo',function($scope,$rootScope,$location,$http,$routeParams,dmkh,dmvt,dmtk,lienhe,task,contract,dmdt,$window,$localStorage,appInfo){
	appInfo.info("SEARCH",function(error,userinfo,appinfo){
		if(!error){
		$scope.viewProduct = function(id){
			$window.open("#dmvt/view/" + id+ "?redirect=" + $location.url())
		}
		$scope.viewCustomer = function(id){
			$window.open("#dmkh/view/" + id + "?redirect=" + $location.url())
		}
		$scope.viewAccount = function(id){
			$window.open("#dmtk/view/" + id + "?redirect=" + $location.url())
		}
		$scope.viewContact = function(id){
			$window.open("#lienhe/view/" + id + "?redirect=" + $location.url())
		}
		$scope.viewTask = function(id){
			$window.open("#task/view/" + id + "?redirect=" + $location.url())
		}
		$scope.viewContract = function(id){
			$window.open("#contract/view/" + id + "?redirect=" + $location.url())
		}
		$scope.viewProject = function(id){
			$window.open("#dmdt/view/" + id + "?redirect=" + $location.url())
		}
		$scope.viewVoucher = function(ma_ct,id_ct){
				if(ma_ct && id_ct){
					var url = "#/" +  ma_ct.toLowerCase() +  "/edit/" + id_ct
					$window.open(url);
				}
				
			}
		$scope.word = $routeParams.word
		$rootScope.searchword = $scope.word
		//find functions
		$scope.functions =[]
		var findword = $scope.word.toLowerCase();
		if($rootScope.commands){
			$rootScope.commands.acc.forEach(function(module){
				module.items.forEach(function(group){
					group.items.forEach(function(fs){
						if(fs.visiable && fs.path !='dxd' && fs.header.toLowerCase().indexOf(findword)>=0){
							$scope.functions.push(fs);
						}
					})
				})
			})
			$rootScope.commands.crm.input.forEach(function(fs){
				if(fs.visiable && fs.path !='dxd' && fs.header.toLowerCase().indexOf(findword)>=0){
					$scope.functions.push(fs);
				}
			})
		}
		//find customer
		dmkh.list(id_app,$scope.word,null,null,1,50)
			.success(function(data){
				$scope.customers = data;
				var kh=[]
				data.forEach(function(k){
					kh.push(k.ma_kh)
				})
				dmtk.list(id_app,$scope.word,null,null,1,50).success(function(t){
					$scope.accounts = t;
					var tk =[]
					t.forEach(function(k){
						tk.push(k.tk)
					})
					//find voucher
					var token = $localStorage.get('token');
					var q = {$or:[]}
					q.$or.push({dien_giai:{$regex:$scope.word,$options:'i'}})
					q.$or.push({so_ct:{$regex:$scope.word,$options:'i'}})
					q.$or.push({ma_ct:{$regex:$scope.word,$options:'i'}})
					q.$or.push({ma_kh:{$regex:$scope.word,$options:'i'}})
					q.$or.push({tk_no:{$regex:$scope.word,$options:'i'}})
					q.$or.push({tk_co:{$regex:$scope.word,$options:'i'}})
					if(kh.length>0){
						q.$or.push({ma_kh_no:{$in:kh}})
						q.$or.push({ma_kh_co:{$in:kh}})
					}
					if(tk.length>0){
						q.$or.push({tk_no:{$in:tk}})
						q.$or.push({tk_co:{$in:tk}})
					}
					var url = server_url + "/api/" + id_app + "/bkct?access_token=" + token + "&q=" + JSON.stringify(q)
					$http.get(url).success(function(vouchers){
						$scope.vouchers = vouchers
					})
				})
				
			}).error(function(e){
			})
		//find product
		dmvt.list(id_app,$scope.word,null,null,1,50)
			.success(function(data){
				$scope.products = data;
			}).error(function(e){
			})
		
		//find contacts
		lienhe.list(id_app,$scope.word,null,null,1,50)
			.success(function(data){
				$scope.contacts = data;
			}).error(function(e){
			})
			
		//find contracts
		contract.list(id_app,$scope.word,null,null,1,50)
			.success(function(data){
				$scope.contracts = data;
			}).error(function(e){
			})
		//find project
		dmdt.list(id_app,$scope.word,null,null,1,50)
			.success(function(data){
				$scope.projects = data;
			}).error(function(e){
			})
		
		//find task
		task.list(id_app,$scope.word,null,null,1,50)
			.success(function(data){
				$scope.dscv = data;
			}).error(function(e){
			})
		}
	})
	
	
}])
module.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider){
	$routeProvider
		.when("/search/:word",{
			templateUrl:"templates/reports/search/templates/browser.html",
			controller:"searchController"
		})
	
}]);