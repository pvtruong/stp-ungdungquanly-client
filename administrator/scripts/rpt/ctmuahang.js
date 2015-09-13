var rptctmuahang = new baseRpt('ctmuahang','ctmuahang','Chi tiết mua hàng');
rptctmuahang.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(Date.UTC(c.getFullYear(),c.getMonth(),1));
	condition.den_ngay = c;
}