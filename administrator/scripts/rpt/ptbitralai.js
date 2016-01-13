var rptptbitralai = new baseRpt('ptbitralai','ptbitralai','Phân tích hàng bán bị trả lại',{
	onLoading:function($scope,options){
		var $filter = options.$filter;
		var $location = options.$location;
	}
});
rptptbitralai.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}