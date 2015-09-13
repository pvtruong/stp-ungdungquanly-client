var rptcdpsdt = new baseRpt('cdpsdt','cdpsdt','Cân đối phát sinh theo vụ việc',{
	onLoading:function($scope,options){
		var $filter = options.$filter;
		var $location = options.$location;
		$scope.drilldown = function(row){
			if(row.ma_dt){
				var url ="/sctdt?tk=" + $scope.condition.tk;
				url = url + "&ten_tk=" + $scope.condition.ten_tk;
				url = url + "&ma_dt=" + row.ma_dt;
				url = url + "&ten_dt=" + row.ten_dt;
				url = url + "&tu_ngay=" + $filter("date")($scope.condition.tu_ngay,"yyyy-MM-dd");
				url = url + "&den_ngay=" + $filter("date")($scope.condition.den_ngay,"yyyy-MM-dd");
				url = url + "&ma_dvcs=" + $scope.condition.ma_dvcs;
				url = url + "&isDrillDown=true"
				$location.url(url);
			}
		}
		
	}
});
rptcdpsdt.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}
rptcdpsdt.useExcelTemplate = true;
