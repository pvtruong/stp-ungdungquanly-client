var dmqct_input = function($scope,options){
    $scope.modules =[];
    options.$http.get(server_url +  "/api/modules")
        .then(function(res){
            res.data.forEach(function(m){
                if(m.type && (m.type=='V' || m.type=='L')){
                    $scope.modules.push(m);
                }
            })
            
        })
}
var dmqctModule = new baseInput('dmqct','dmqct',["ma_ct","ten_qct"],'Danh mục quyển chứng từ',{
    onAdd:function($scope,options){
        dmqct_input($scope,options);
        $scope.data.field='so_ct';
        $scope.data.den_so =999999;
    },
    onEdit:dmqct_input        
              
});