var rptptdonhang = new baseRpt('ptdonhang','ptdonhang','Phân tích đơn hàng',{
	onLoading:function($scope,options){
		var $filter = options.$filter;
		var $location = options.$location;
	}
});
rptptdonhang.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}