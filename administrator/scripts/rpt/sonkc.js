var rptsonkc = new baseRpt('sonkc','sonkc','Sổ nhật ký chung',{
    onAfterLoadData:function($scope,data){
        
    },
    onInit:function($scope,$http,$filter,$location,$config,$controller){
        $scope.tableInfo = [
          {header:'Số chứng từ',name:'so_ct'},
          {header:'Ngày chứng từ',name:'ngay_ct',type:'date',f:'dd/MM/yyyy',className:'r-text-right'},
          {header:'Diễn giải',name:'dien_giai'},
          {header:'Tài khoản',name:'tk'},
          {header:'Tài khoản đối ứng',name:'tk_du'},
          {header:'PS nợ',name:'ps_no',className:'r-text-right'},
          {header:'PS có',name:'ps_co',className:'r-text-right'},
          {header:'Mã khách',name:'ma_kh'},
          {header:'Tên khách',name:'ten_kh'}
        ];
    }
});
rptsonkc.defaultCondition = function(condition){
	var c = new Date();
	condition.tu_ngay = new Date(c.getFullYear(),c.getMonth(),1);
	condition.den_ngay = c;
    
}
