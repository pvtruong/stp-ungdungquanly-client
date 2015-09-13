var rptsonktt = new baseRpt('sonktt','sonktt','Nhật ký thu tiền');
rptsonktt.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
	condition.tk_no ='111,112'
}