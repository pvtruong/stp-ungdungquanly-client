var rptsonkct = new baseRpt('sonkct','sonkct','Nhật ký chi tiền');
rptsonkct.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
	condition.tk_co ='111,112'
}