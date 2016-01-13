var rptbaocaokhachhang = new baseRpt('baocaokhachhang','baocaokhachhang','Báo cáo khách hàng',{
	onLoading:function($scope,options){
		var $filter = options.$filter;
		var $location = options.$location;
        $scope.gotoKH = function(r){
            $location.url("dmkh/view/" + r._id);
        }
	}
});
rptbaocaokhachhang.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
    condition.tinh_thanh ="";
    condition.phu_trach ="";
}
