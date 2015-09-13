var rptsonkbh = new baseRpt('sonkbh','sonkbh','Nhật ký bán hàng');
rptsonkbh.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}