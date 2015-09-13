var rptsochut = new baseRpt('sochut','sochut','Sổ chữ T tài khoản',{
	onLoading:function($scope,options){
		var $filter = options.$filter;
		var $location = options.$location;
		$scope.drilldown = function(row){
			if(row.tk_du){
				var url = "/bkct?tk=" + $scope.condition.tk;
				url = url + "&tk_du=" + row.tk_du;
				url = url + "&tu_ngay=" + $filter("date")($scope.condition.tu_ngay,"yyyy-MM-dd");
				url = url + "&den_ngay=" + $filter("date")($scope.condition.den_ngay,"yyyy-MM-dd");
				url = url + "&ma_dvcs=" + $scope.condition.ma_dvcs;
				url = url + "&isDrillDown=true"
				$location.url(url);
				
			}
			
			
		}
	}
});
rptsochut.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}
rptsochut.afterLoadData = function($scope,data){
	$scope.title = 'Sổ chữ T tài khoản: ' + $scope.condition.tk + " - " + $scope.condition.ten_tk;
}