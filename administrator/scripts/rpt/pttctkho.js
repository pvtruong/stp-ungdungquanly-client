var rptpttctkho = new baseRpt('pttctkho','pttctkho','Phân tích đối tượng theo chỉ tiêu');
rptpttctkho.defaultCondition = function(condition){
	var c = new Date();
	var y = c.getFullYear();
	var m = c.getMonth();
	var d = c.getDate();
	
	condition.tu_ngay = new Date(y,m,1);
	condition.den_ngay = c;
}