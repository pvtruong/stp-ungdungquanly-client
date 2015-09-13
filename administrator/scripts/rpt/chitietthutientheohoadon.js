var rptchitietthutientheohoadon = new baseRpt('chitietthutientheohoadon','chitietthutientheohoadon','Chi tiết thu tiền theo hóa đơn',{
	onLoading:function($scope,options){
		var $filter = options.$filter;
		var $location = options.$location;
	}
});
rptchitietthutientheohoadon.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}
rptchitietthutientheohoadon.useExcelTemplate = true;
