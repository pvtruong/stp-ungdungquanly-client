var rptModule = new baseInput('rpt','rpt',["ma_cn","ten_mau_in"],'Quản lý mẫu in',{
	onAdd:function($scope,options){
		var params = options.$location.search();
		var ma_cn = params.ma_cn;
		if(!params.redirect && ma_cn){
			options.$location.search("redirect","/rpt?ma_cn=" + ma_cn)
		}
		
	},
	onEdit:function($scope,options){
		var ma_cn = $scope.data.ma_cn;
		if(!options.$location.search().redirect){
			options.$location.search("redirect","/rpt?ma_cn=" + ma_cn)
		}
	}
});

rptModule.module.controller("initrpt",["$scope","$window","$interval",function($scope,$window,$interval){
	$scope.changeFile = function(){
		var w = $window.open("#uploadexcel","Upload file","width=600,height=300");
		var interval = $interval(function(){
			if(w.document.body.innerHTML=="success"){
				$scope.data.file_mau_in = w.document.title;
				w.close();
				$interval.cancel(interval);
			}
		},100);
	}
}]);
rptModule.init = function($scope,$controller){
	$controller("initrpt",{$scope:$scope});
}
