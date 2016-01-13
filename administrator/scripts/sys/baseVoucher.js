var dateTime2Date = function(dateTime){
	return  new Date(Date.UTC(dateTime.getFullYear(),dateTime.getMonth(),dateTime.getDate()));
}
var baseVoucher = function(voucherId,server_path,fields_find,title,options){
	var voucher = this;
	if(!options){
		options ={};
	}
	options.group = "vouchers"
	//options
	voucher.defaultCondition4Search = options.defaultCondition4Search;
	voucher.prepareCondition4Search = options.onPrepareCondition4Search;
	voucher.watchMaster = options.onWatchMaster;
	voucher.defaultValues4Detail = options.onDefaultValues4Detail;
	voucher.watchDetail = options.onWatchDetail;
	//
	var loading =options.onLoading;
	options.onLoading = function($scope,$options){
		if(loading) loading($scope,$options);
		$scope.find = function(){
			var modalInstance = $options.$modal.open({
				  templateUrl:"templates/vouchers/" + voucherId + '/templates/find.html',
				  controller:  ['$scope','$modalInstance','parentScope',function($scope,$modalInstance,parentScope){
						$scope.vcondition = {};
						if(voucher.defaultCondition4Search){
							$scope.vcondition = voucher.defaultCondition4Search;
						}
						$scope.list = parentScope.list;
						$scope.search = parentScope.search;
						$scope.okFind = function (){
							voucher.defaultCondition4Search = $scope.vcondition;
							if(voucher.prepareCondition4Search){
								parentScope.condition= voucher.prepareCondition4Search($scope,$scope.vcondition);
							}else{
								parentScope.condition={};
								_.extend(parentScope.condition,$scope.vcondition);
							}
							$scope.search();
							$modalInstance.close();
							
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
        $scope.updateSoCt = function(){
            var modalInstance = $options.$modal.open({
				  templateUrl:'templates/sys/update-voucher-number.html',
				  controller:  ['$scope','$modalInstance','parentScope','$http',function($scope,$modalInstance,parentScope,$http){
						$scope.vcondition = {tu_so:1,den_so:999999,tu_ngay:new Date(),den_ngay:new Date(),post_again:false};
						$scope.list = parentScope.list;
						$scope.search = parentScope.search;
						$scope.okFind = function (){
							var url = server_url +  "/api/" + id_app + "/" + server_path;
                            if(!$scope.vcondition.post_again){
                                url = url + "/update/so_ct";
                                url = url + "?tu_so=" + $scope.vcondition.tu_so;
                                url = url + "&den_so=" + $scope.vcondition.den_so;  
                                url = url + "&tu_ngay=" + $options.$filter('date')($scope.vcondition.tu_ngay,'yyyy-MM-dd');
                                url = url + "&den_ngay=" + $options.$filter('date')($scope.vcondition.den_ngay,'yyyy-MM-dd');
                                if($scope.vcondition.tien_to){
                                    url = url + "&tien_to=" + $scope.vcondition.tien_to;  
                                }
                                
                                if($scope.vcondition.hau_to){
                                    url = url + "&hau_to=" + $scope.vcondition.hau_to;  
                                }
                                $http.get(url).success(function(rs){
                                    $modalInstance.close();
                                    $scope.search();
                                }).error(function(er){
                                    console.log(er);
                                    alert(er);
                                });
                            }else{
                                url = url + "/action/postagain";
                                url = url + "?tu_so=" + $scope.vcondition.tu_so;
                                url = url + "&den_so=" + $scope.vcondition.den_so;  
                                url = url + "&tu_ngay=" + $options.$filter('date')($scope.vcondition.tu_ngay,'yyyy-MM-dd');
                                url = url + "&den_ngay=" + $options.$filter('date')($scope.vcondition.den_ngay,'yyyy-MM-dd');
                                if($scope.vcondition.tien_to){
                                    url = url + "&tien_to=" + $scope.vcondition.tien_to;  
                                }
                                
                                if($scope.vcondition.hau_to){
                                    url = url + "&hau_to=" + $scope.vcondition.hau_to;  
                                }
                                $http.get(url).success(function(rs){
                                    $modalInstance.close();
                                    alert("Chương trình đã thực hiện xong");
                                }).error(function(er){
                                    console.log(er);
                                    alert(er);
                                });
                            }
                            
							
						}
						$scope.cancelFind = function () {
							$modalInstance.dismiss('cancel');
						}
					}],
				  size: 'lg',
				  resolve: {
					parentScope: function () {
					  return $scope;
					}
				  }
				});
			}
    }
	
	var edit = options.onEdit;
	options.onEdit = function($scope,$options){
		if(edit) edit($scope,$options)
		if(!$scope.data.details) $scope.data.details =[];
		$scope.round =0;
		$scope.$watch('data.ma_nt',function(newData){
			if(newData && newData!='VND'){
				$scope.round =2;
			}
		});
		if(voucher.watchMaster){
			voucher.watchMaster($scope);
		}
	}
	var add = options.onAdd;
	options.onAdd = function($scope,$options){
		if(add) add($scope,$options)
		$scope.data.ty_gia=1;
		$scope.data.ma_nt='VND';
		$scope.data.ngay_ct =new Date();
		$scope.data.details =[];
		$options.service.next(id_app,"so_ct").success(function(seq){
			$scope.data.so_ct = seq.so_ct;
		}).error(function(error){
			console.log(error);
		});
		
		$scope.round =0;
		$scope.$watch('data.ma_nt',function(newData){
			if(newData && newData!='VND'){
				$scope.round =2;
			}
		});
		if(voucher.watchMaster){
			voucher.watchMaster($scope);
		}
	}
	//init
	baseInput.call(this,voucherId,server_path,fields_find,title,options)
	//directive detail
	voucher.module.directive(voucherId + "DetailTable",function(){
		return {
			restrict:'E',
			scope:{
				ngMasterData:'='
			},
			templateUrl:"templates/vouchers/" + voucherId + "/templates/detail-table.html",
			controller:['$scope','$modal','$timeout','$http','$window',function($scope,$modal,$timeout,$http,$window){
				$scope.status ={isOpened:false};
				$scope.$modal = $modal;
				$scope.$http = $http;
				$scope.$window = $window;
				$scope.isNotRowSelected = function(dt){
					return (_.filter(dt,function(r){return r.sel==true}).length==0);
				}
				$scope.deleteRow = function(dt){
					var rc = _.reject(dt,function(r){return r.sel==true});
					dt.length =0;
					var i=0;
					rc.forEach(function(r){
						r.line = i;
						dt.push(r)
						i++;
					});
				}
				//detail input
				$scope.addDetail = function(){
					var line =$scope.ngMasterData.details.length;
					$scope.dt_master = null;
					$scope.dt_current ={line:line};
                    
                    if($scope.ngMasterData.options){
						_.extend($scope.dt_current,$scope.ngMasterData.options);
					}
                    
					if(voucher.defaultValues4Detail){
						_.extend($scope.dt_current,voucher.defaultValues4Detail);
					}
					if(!$scope.ngMasterData.details){
						$scope.ngMasterData.details =[];
					}
					$scope.openDetail('lg');
				}
				$scope.editDetail = function(line){
					$scope.dt_master = _.find($scope.ngMasterData.details,function(r){return r.line==line});
					$scope.dt_current ={};
					_.extend($scope.dt_current,$scope.dt_master);
					$scope.openDetail('lg');
				}
						
				$scope.openDetail = function (size,template) {
					var modalInstance = $modal.open({
					  templateUrl:"templates/vouchers/" + voucherId + '/templates/detail-edit.html',
					  controller:  ['$scope', '$modalInstance','parentScope',function($scope, $modalInstance,parentScope){
							$scope.data = parentScope.ngMasterData;
							$scope.status = parentScope.status;
							
							$scope.dt_master = parentScope.dt_master;
							$scope.dt_current = parentScope.dt_current;
							$scope.updateDetail = function (){
								if(!$scope.dt_master){
									$scope.dt_master  = {};
									$scope.data.details.push($scope.dt_master);
								}
								for(var k in $scope.dt_current){
									$scope.dt_master[k] = $scope.dt_current[k];
								}
								$modalInstance.close();
								
							};
							$scope.cancelDetail = function () {
								$modalInstance.dismiss('cancel');
							};
						}],
					  size: size,
					  resolve: {
						parentScope: function () {
						  return $scope;
						}
					  }
					});
					
					modalInstance.opened.then(function(){
						$timeout(function(){
							$scope.status.isOpened = true;
						},100);
						
					});
					modalInstance.result.then(function(result){
						$scope.status.isOpened = false;
					});

				}
			}],
			link:function(scope,elem,attrs,ctr){
				if(voucher.watchDetail){
					voucher.watchDetail(scope);
				}
			}
		}
	})
}
baseVoucher.prototype = new baseInput;

