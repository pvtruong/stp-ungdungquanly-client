var rptdtbanletheonam = new baseRpt('dtbanletheonam','dtbanletheonam','Doanh thu bán lẻ theo năm',{
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
			var nam = Number(row.nam);
			if(nam>= $scope.condition.tu_nam && nam<=$scope.condition.den_nam){
				var url ="/ctbanle?ma_ct=PBL,SO1&";
				url = url + "tu_ngay=" + $filter("date")(new Date(nam,0,1),"yyyy-MM-dd");
				url = url + "&den_ngay=" + $filter("date")(new Date(nam,12,0),"yyyy-MM-dd");
				url = url + "&ma_dvcs=" + $scope.condition.ma_dvcs;
				url = url + "&isDrillDown=true"
				$location.url(url);
			}
		}
		
	}
});
rptdtbanletheonam.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_nam = (c.getFullYear()-1).toString();
	condition.den_nam = c.getFullYear().toString();
}