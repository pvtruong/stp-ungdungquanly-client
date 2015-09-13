var rptCdpstk = new baseRpt('cdpstk','cdpstk','Cân đối phát sinh tài khoản',{
	onLoading:function($scope,options){
		var $filter = options.$filter;
		var $location = options.$location;
		$scope.drilldown = function(row){
			if(row.tk && row.tk!=''){
				var url = "/scttk?tk=" + row.tk;
				url = url + "&ten_tk=" + row.ten_tk;
				url = url + "&tu_ngay=" + $filter("date")($scope.condition.tu_ngay,"yyyy-MM-dd");
				url = url + "&den_ngay=" + $filter("date")($scope.condition.den_ngay,"yyyy-MM-dd");
				url = url + "&ma_dvcs=" + $scope.condition.ma_dvcs;
				url = url + "&isDrillDown=true"
				$location.url(url);
				
			}
			
			
		}
	}
});
rptCdpstk.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}
rptCdpstk.useExcelTemplate = true;
