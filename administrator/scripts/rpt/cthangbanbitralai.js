var rptcthangbanbitralai = new baseRpt('cthangbanbitralai','cthangbanbitralai','Chi tiết hàng bán bị trả lại');
rptcthangbanbitralai.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(Date.UTC(c.getFullYear(),c.getMonth(),1));
	condition.den_ngay = c;
}