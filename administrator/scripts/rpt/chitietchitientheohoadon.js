var rptchitietchitientheohoadon = new baseRpt('chitietchitientheohoadon','chitietchitientheohoadon','Chi tiết chi tiền theo hóa đơn',{
	onLoading:function($scope,options){
		var $filter = options.$filter;
		var $location = options.$location;
	}
});
rptchitietchitientheohoadon.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}
rptchitietchitientheohoadon.useExcelTemplate = true;
