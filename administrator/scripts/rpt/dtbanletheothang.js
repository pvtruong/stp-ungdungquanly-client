var rptdtbanletheothang = new baseRpt('dtbanletheothang','dtbanletheothang','Doanh thu bán lẻ theo tháng',{
	onLoading:function($scope,options){
		var nams =[];
		var nam = (new Date()).getFullYear();
		for(var n=nam-10;n<nam+10;n++){
			nams.push(n.toString())
		}
		$scope.nams = nams

		var $filter = options.$filter;
		var $location = options.$location;
		$scope.drilldown = function(row){
			var thang = Number(row.thang);
			var nam = Number($scope.condition.nam);
			if(thang >0 && thang <=12){
				var url ="/ctbanle?ma_ct=PBL,SO1&";
				url = url + "tu_ngay=" + $filter("date")(new Date(nam,thang-1,1),"yyyy-MM-dd");
				url = url + "&den_ngay=" + $filter("date")(new Date(nam,thang,0),"yyyy-MM-dd");
				url = url + "&ma_dvcs=" + $scope.condition.ma_dvcs;
				url = url + "&isDrillDown=true"
				$location.url(url);
			}
		}
	}
});
rptdtbanletheothang.defaultCondition = function(condition){
	var c = new Date();
	condition.nam = c.getFullYear().toString();
}