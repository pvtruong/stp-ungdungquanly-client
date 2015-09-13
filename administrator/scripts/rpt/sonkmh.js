var rptsonkmh = new baseRpt('sonkmh','sonkmh','Nhật ký mua hàng');
rptsonkmh.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}