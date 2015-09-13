var dmnvModule = new baseInput('dmnv','dmnv',["ma_nv","ten_nv","dia_chi","dien_thoai","fax","email"],'Nhân viên',{
	has_view:true,
	onView:function($scope,options){
		$scope.addContact = function(){
			lienheModule.quickadd(options.$modal,function(rs){
				rs.collection_name ="lienhe";
				$scope.addLink(rs,'ten_lien_he');
			},{id_nv:$scope.data._id,ten_nv:$scope.data.ten_nv})
		}
	},
	onLoading:function($scope,options){
		$scope.advCondition ={}
		options.$rootScope.nextTick(function(){
			options.$http.get(server_url + "/api/" + id_app + "/group?q={group_type:'DMNV'}")
			.success(function(groups){
				$scope.groups = groups;
			})
		})
		$scope.btn3_click = function(){
				var to=[]
				$scope.list.forEach(function(c){
					if(c.email && c.sel){
						to.push({name:c.ten_nv,address:c.email})
					}
				})
				if(to.length>0){
					options.$location.url("mailschedule/add?to=" + JSON.stringify(to) +"&redirect=" + options.$location.url());
				}else{
					alert("Bạn phải chọn ít nhất một nhân viên")
				}
				
			}
		$scope.searchAVR =function(){
			if(!$scope.renderCompleted){
				return;
			}
			$scope.filter ={}
			//phu trach
			if($scope.phu_trach){
				$scope.filter.phu_trach = $scope.phu_trach;
			}else{
				delete $scope.filter.phu_trach
			}
			if($scope.nh_nv){
				$scope.filter.nh_nv = $scope.nh_nv;
			}else{
				delete $scope.filter.nh_nv
			}
			if($scope.advCondition.ten_nv){
				$scope.filter.$or =[{ten_nv:{$regex:$scope.advCondition.ten_nv,$options:'i'}},{ma_nv:{$regex:$scope.advCondition.ten_nv,$options:'i'}},{dien_thoai:{$regex:$scope.advCondition.ten_nv,$options:'i'}},{email:{$regex:$scope.advCondition.ten_nv,$options:'i'}}]
			}else{
				delete $scope.filter.$or
			}
			if($scope.advCondition.dien_thoai){
				$scope.filter.dien_thoai={$regex:$scope.advCondition.dien_thoai,$options:'i'}
			}else{
				delete $scope.filter.dien_thoai
			}
			if($scope.advCondition.email){
				$scope.filter.email={$regex:$scope.advCondition.email,$options:'i'}
			}else{
				delete $scope.filter.email
			}
			if($scope.advCondition.dia_chi){
				$scope.filter.dia_chi={$regex:$scope.advCondition.dia_chi,$options:'i'}
			}else{
				delete $scope.filter.dia_chi
			}
			
			//search
			$scope.search();
		}
		$scope.enter = function(event){
			if(event.keyCode==13){
				$scope.searchAVR();
			}
		}
		$scope.searchPhuTrach = function(m){
			$scope.phu_trach = m.email;
			$scope.searchAVR()
		}
		$scope.searchGroup = function(m){
			$scope.nh_nv = m._id;
			$scope.searchAVR()
		}
		$scope.reportByTime = function(m){
			$scope.time=m;
			$scope.searchAVR();
		}
	}
});