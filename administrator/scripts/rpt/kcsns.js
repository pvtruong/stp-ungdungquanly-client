var rptkcsns = new baseRpt('kcsns','kcsns','Kết chuyển sang năm sau',{
    onAfterLoadData:function($scope,data){
        alert("Chương trình đã thực hiện xong");
    }
});
rptkcsns.init = function($scope){
	$scope.nams =[];
	for(var nam =(new Date).getFullYear() - 10;nam < (new Date).getFullYear() + 10;nam++){
		$scope.nams.push(nam.toString());
	}
    $scope.namChanged = function(){
        $scope.condition.sang_nam = Number($scope.condition.nam) + 1;
    }
    $scope.namChanged();
}
rptkcsns.defaultCondition = function(condition){
	var c = new Date();
	condition.nam = (c.getFullYear() - 1).toString();
    condition.sang_nam = Number(condition.nam) + 1;
}