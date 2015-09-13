var pt1Module = new baseVoucher('pt1','pt1',[],'Phiếu thu tiền',{
	onEdit:function($scope,options){
		if($scope.data.tdttnos && $scope.data.tdttnos.length>0){
			$scope.select('thu_hd')
		}else{
			$scope.select('thu_kh')
		}
	},
	onInit:function($scope){
		$scope.select_thu_kh = true;
		$scope.select_thu_hd =false;
		$scope.select = function(t){
			$scope.select_thu_kh = (t=='thu_kh');
			$scope.select_thu_hd =(t=='thu_hd');
		}
	}
});
pt1Module.defaultValues ={
	ma_gd:'1'
}
pt1Module.defaultValues4Detail = {
	tien_nt:0,tien:0
}
pt1Module.defaultCondition4Search = {tu_ngay:new Date(),den_ngay:new Date(),so_ct:'',dien_giai:'',ma_kh:''};
pt1Module.prepareCondition4Search = function($scope,vcondition){
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
pt1Module.watchDetail = function(scope){
	scope.$watch('dt_current.tien_nt',function(newData){
		if(newData!=undefined && scope.status.isOpened){
			scope.dt_current.tien =Math.round(newData * scope.ngMasterData.ty_gia,0);
		}
	});
}
pt1Module.watchMaster = function(scope){
	scope.$watch('data.ty_gia',function(newData){
		if(scope.data){
			if(newData!=undefined && scope.isDataLoaded){
				angular.forEach(scope.data.details,function(r){
					r.tien = Math.round(r.tien_nt * newData,0);
				});
				angular.forEach(scope.data.vatvaos,function(r){
					r.t_tien = Math.round(r.t_tien_nt * newData,0);
					r.t_thue = Math.round(r.t_thue_nt * newData,0);
				});
				angular.forEach(scope.data.vatras,function(r){
					r.t_tien = Math.round(r.t_tien_nt * newData,0);
					r.t_thue = Math.round(r.t_thue_nt * newData,0);
				});
			}
		}
	});
}