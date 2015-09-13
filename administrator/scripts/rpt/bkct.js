var rptBkct = new baseRpt('bkct','bkct','Bảng kê chứng từ');
rptBkct.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}
rptBkct.module.directive("bkctView",function(){
	return {
		restrict:'E',
		templateUrl:"templates/reports/bkct/templates/view.html"
	}
});
rptBkct.module.directive("bkct",function(){
	return {
		restrict:'E',
		scope:{
			condition:'@',
			run:'='
		},
		templateUrl:"templates/reports/bkct/templates/view.html",
		controller:['$scope','$http','$filter','$location',function($scope,$http,$filter,$location){
			$scope.getData = function(){
				$scope.data = [];
				var condition = eval("({" + $scope.condition +  "})");
				rptBkct.getData($http,$filter,condition,function(e,data){
					if(!e){
						$scope.data = data;
					}else{
						console.log(e);
					}
				})
			}
			$scope.viewVoucher = function(ma_ct,id_ct){
				if(ma_ct && id_ct){
					var url = ma_ct.toLowerCase() +  "/edit/" + id_ct + "?redirect=back";
					$location.url(url)
				}
				
			}
			$scope.order = function(predicate, reverse) {
				$scope.data = $filter("orderBy")($scope.data, predicate, reverse);
			};
		}],
		link:function($scope){
			$scope.$watch("run",function(newValue){
				if($scope.run){
					$scope.getData();
				}
			})
		}
	}
	
})