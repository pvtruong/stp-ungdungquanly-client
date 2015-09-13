var rptdtbanletheokh = new baseRpt('dtbanletheokh','dtbanletheokh','Doanh thu bán lẻ theo khách hàng',{
	onLoading:function($scope,options){
		var $filter = options.$filter;
		var $location = options.$location;
		$scope.drilldown = function(row){
			if(row.ma_kh){
				var url ="/ctbanle?ma_ct=PBL,SO1&ma_kh=" + row.ma_kh;
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
rptdtbanletheokh.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}