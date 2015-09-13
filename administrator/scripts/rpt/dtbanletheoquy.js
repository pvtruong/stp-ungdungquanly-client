var rptdtbanletheoquy = new baseRpt('dtbanletheoquy','dtbanletheoquy','Doanh thu bán lẻ theo quý',{
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
			var quy = Number(row.quy);
			if(quy > 0 && quy < 5){
				var den_thang = quy * 3;
				var tu_thang = den_thang-2;
				var nam = Number($scope.condition.nam);
				var url ="/ctbanle?ma_ct=PBL,SO1&";
				url = url + "tu_ngay=" + $filter("date")(new Date(nam,tu_thang-1,1),"yyyy-MM-dd");
				url = url + "&den_ngay=" + $filter("date")(new Date(nam,den_thang,0),"yyyy-MM-dd");
				url = url + "&ma_dvcs=" + $scope.condition.ma_dvcs;
				url = url + "&isDrillDown=true"
				$location.url(url);
			}
		}
	}
	
});
rptdtbanletheoquy.defaultCondition = function(condition){
	var c = new Date();
	condition.nam = c.getFullYear().toString();
}