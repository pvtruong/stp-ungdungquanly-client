﻿var rptScttk = new baseRpt('socaitk','socaitk','Sổ cái tài khoản');
rptScttk.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}
rptScttk.afterLoadData = function($scope,data){
	$scope.title = 'Sổ cái tài khoản: ' + $scope.condition.tk + " - " + $scope.condition.ten_tk;
}