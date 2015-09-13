var rptsonkc = new baseRpt('sonkc','sonkc','Sổ nhật ký chung');
rptsonkc.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
}