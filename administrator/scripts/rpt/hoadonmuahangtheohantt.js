var rpthoadonbanhantheohantt = new baseRpt('hoadonmuahangtheohantt','hoadonmuahangtheohantt','Hóa đơn mua hàng theo hạn thanh toan',{
	onLoading:function($scope,options){
		var $filter = options.$filter;
		var $location = options.$location;
	}
});
rpthoadonbanhantheohantt.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
} 
rpthoadonbanhantheohantt.useExcelTemplate = true;