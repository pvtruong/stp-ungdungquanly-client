var pn2Module = new baseVoucher('pn2','pn2',[],'Phiếu mua dịch vụ');
pn2Module.defaultValues ={
	vatvaos:[]
}
pn2Module.defaultValues4Detail = {
	tien_nt:0,tien:0
}
pn2Module.defaultCondition4Search = {tu_ngay:new Date(),den_ngay:new Date(),so_ct:'',dien_giai:'',ma_kh:''};
pn2Module.prepareCondition4Search = function($scope,vcondition){
	return {
		so_ct:{$regex:$scope.vcondition.so_ct,$options:'i'},
		dien_giai:{$regex:$scope.vcondition.dien_giai,$options:'i'},
		ma_kh:{$regex:$scope.vcondition.ma_kh,$options:'i'},
		ngay_ct:{
			$gte:dateTime2Date($scope.vcondition.tu_ngay),
			$lte:dateTime2Date($scope.vcondition.den_ngay)
		}
	};
}
	
pn2Module.watchDetail = function(scope){
	
	scope.$watch('dt_current.tien_nt',function(newData){
		if(newData!=undefined && scope.status.isOpened){
			scope.dt_current.tien = Math.round(scope.dt_current.tien_nt * scope.ngMasterData.ty_gia,0);
		}
	});

}
pn2Module.watchMaster = function(scope){
	scope.$watch('data.ty_gia',function(newData){
		if(scope.data){
			if(newData!=undefined && scope.isDataLoaded){
				angular.forEach(scope.data.details,function(r){
					r.tien = Math.round(r.tien_nt * newData,0);
				});
			
			}
		}
	});
}