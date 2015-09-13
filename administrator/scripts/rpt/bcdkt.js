var rptBcdkt = new baseRpt('bcdkt','bcdkt','Bảng cân đối kế toán');
rptBcdkt.defaultCondition = function(condition){
	var c = new Date();
	condition.den_ngay = c;
}