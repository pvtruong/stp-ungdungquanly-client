var calc_qtsdieuchinh = function($scope){
	$scope.$watch('data.nguyen_gia',function(newValue){
		if(newValue!=undefined && newValue!=null){
			$scope.data.gia_tri_con_lai = $scope.data.nguyen_gia - $scope.data.gia_tri_da_kh;
		}
	})
	$scope.$watch('data.gia_tri_da_kh',function(newValue){
		if(newValue!=undefined && newValue!=null){
			$scope.data.gia_tri_con_lai = $scope.data.nguyen_gia - $scope.data.gia_tri_da_kh;
		}
	})
	$scope.$watch('data.gia_tri_con_lai',function(newValue){
		if(newValue!=undefined && newValue!=null){
			$scope.data.gia_tri_kh_ky = $scope.data.so_ky_kh!=0?Math.round($scope.data.gia_tri_con_lai/$scope.data.so_ky_kh,0):0;
		}
	})
	$scope.$watch('data.so_ky_kh',function(newValue){
		if(newValue!=undefined && newValue!=null){
			$scope.data.gia_tri_kh_ky = $scope.data.so_ky_kh!=0?Math.round($scope.data.gia_tri_con_lai/$scope.data.so_ky_kh,0):0;
		}
	})
}
var qtsdieuchinhModule = new baseInput('qtsdieuchinh','qtsdieuchinh',['so_the_ts','so_ct'],'Điều chỉnh giá trị tài sản',{
	onAdd:function($scope,options){
		calc_qtsdieuchinh($scope)
	},
	onEdit:function($scope,options){
		calc_qtsdieuchinh($scope)
	}
});
qtsdieuchinhModule.defaultValues ={
	so_ky_kh:0,ky:(new Date()).getMonth()+1,nam:(new Date()).getFullYear(),ngay_ct:new Date(),
	ngay_ct:new Date(),
	nguyen_gia:0,
	gia_tri_da_kh:0,gia_tri_con_lai:0,
	gia_tri_kh_ky:0
}