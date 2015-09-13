var dmvtModule = new baseInput('dmvt','dmvt',["ma_vt","ten_vt"],'Danh mục vật tư, hàng hóa',{
	has_view:true,
	onLoading:function($scope,options){
		options.$rootScope.nextTick(function(){
			options.$http.get(server_url + "/api/" + id_app + "/dmnvt")
			.success(function(groups){
				$scope.groups = groups;
			})
		})
		$scope.searchGroup = function(m){
			$scope.ma_nvt = m._id;
			var filter = $scope.filter;
			if(!filter){
				filter = {};
			}
			if($scope.ma_nvt){
				filter['ma_nvt'] = $scope.ma_nvt;
			}else{
				delete filter['ma_nvt'];
			}
			$scope.changeFilter({filter:filter})
		}
		$scope.searchType = function(m){
			$scope.type_filter = m;
			var filter = $scope.filter;
			if(!filter){
				filter = {};
			}
			delete filter.hot;
			delete filter.bestseller;
			delete filter.banner_small;
			delete filter.banner_large;
			if(m){
				filter[m] = true;
			}
			$scope.changeFilter({filter:filter})
		}
	}
});
dmvtModule.defaultValues ={gia_xuat:'1',tk_vt:'1561'};
dmvtModule.init = function($scope,$controller){
	$scope.updatePrice = function(r){
		if(r.gia_ban_le && r.ty_le_ck){
			r.tien_ck = Math.round(r.gia_ban_le * r.ty_le_ck,0)
		}
		$scope.update(r)
	}
	$scope.$watch('data.ty_le_ck',function(newData){
		if($scope.isDataLoaded && $scope.data.gia_ban_le && $scope.data.ty_le_ck){
			$scope.data.tien_ck = Math.round($scope.data.ty_le_ck * $scope.data.gia_ban_le/100,0);
		}
	});
	$scope.$watch('data.gia_ban_le',function(newData){
		if($scope.isDataLoaded && $scope.data.gia_ban_le && $scope.data.ty_le_ck){
			$scope.data.tien_ck = Math.round($scope.data.ty_le_ck * $scope.data.gia_ban_le/100,0);
		}
	});
}
