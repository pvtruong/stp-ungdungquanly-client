var rptcdpskh = new baseRpt('cdpskh','cdpskh','Cân đối phát sinh theo khách hàng',{
	onLoading:function($scope,options){
		var $filter = options.$filter;
		var $location = options.$location;
		$scope.drilldown = function(row){
			if(row.ma_kh){
				var url ="/sctcnkh?tk=" + $scope.condition.tk;
				url = url + "&ten_tk=" + $scope.condition.ten_tk;
				url = url + "&ma_kh=" + row.ma_kh;
				url = url + "&ten_kh=" + row.ten_kh;
				url = url + "&tu_ngay=" + $filter("date")($scope.condition.tu_ngay,"yyyy-MM-dd");
				url = url + "&den_ngay=" + $filter("date")($scope.condition.den_ngay,"yyyy-MM-dd");
				url = url + "&ma_dvcs=" + $scope.condition.ma_dvcs;
				url = url + "&isDrillDown=true"
				$location.url(url);
			}
		}
		
	}
});
rptcdpskh.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}
rptcdpskh.useExcelTemplate = true;
