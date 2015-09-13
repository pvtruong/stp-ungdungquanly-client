var parameterModule = new baseInput('parameter','parameter',["name"],'Tham số mẫu in',{
	onAdd:function($scope,options){
		var params = options.$location.search();
		var id_rpt = params.id_rpt;
		if(!params.redirect && id_rpt){
			options.$location.search("redirect","/parameter?id_rpt=" + id_rpt)
		}
		$scope.data.type="S"
	},
	onEdit:function($scope,options){
		var id_rpt = $scope.data.id_rpt;
		if(!options.$location.search().redirect){
			options.$location.search("redirect","/parameter?id_rpt=" + id_rpt)
		}
	},
	onLoading:function($scope,options){
		var params = options.$location.search();
		var id_rpt = params.id_rpt;
		options.$http.get(server_url + "/api/" + id_app + "/rpt/" + id_rpt).success(function(rs){
			if(rs){
				$scope.sub_title = rs.ten_mau_in
			}
		}).error(function(e){
			
		})
	}
});
