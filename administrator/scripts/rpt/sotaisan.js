var rptsotaisan = new baseRpt('sotaisan','sotaisan','Sổ tài sản');
rptsotaisan.init = function($scope){
	$scope.nams =[];
	for(var nam =(new Date).getFullYear() - 10;nam < (new Date).getFullYear() + 10;nam++){
		$scope.nams.push(nam.toString());
	}
	$scope.gds =[
		{ma_gd:'',ten:"Cả hai"},
		{ma_gd:'1',ten:'Tài sản'},
		{ma_gd:'2',ten:'Công cụ, dụng cụ'}
	]
}
rptsotaisan.defaultCondition = function(condition){
	var c = new Date();
	condition.nam = c.getFullYear().toString();
	condition.ma_gd = '1';
}