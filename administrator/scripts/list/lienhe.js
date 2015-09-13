var lienheModule = new baseInput('lienhe','lienhe',["ten_lien_he","dia_chi","dien_thoai","fax","email"],'Danh bạ',{
		has_view:true,
		onLoading:function($scope,options){
			options.$rootScope.nextTick(function(){
				options.$http.get(server_url + "/api/" +id_app+"/group?q={group_type:'CONTACT'}").success(function(groups){
					$scope.groups=groups;
				});
			})
			$scope.advCondition ={}
			$scope.searchAVR =function(){
				if(!$scope.renderCompleted){
					return;
				}
				$scope.filter ={}
				if($scope.nh_lh){
					$scope.filter.nh_lh=$scope.nh_lh
				}else{
					delete $scope.filter.nh_lh
				}
				if($scope.advCondition.ten_lien_he){
					$scope.filter.$or=[{ten_lien_he:{$regex:$scope.advCondition.ten_lien_he,$options:'i'}},{dien_thoai:{$regex:$scope.advCondition.ten_lien_he,$options:'i'}},{email:{$regex:$scope.advCondition.ten_lien_he,$options:'i'}}]
				}else{
					delete $scope.filter.$or
				}
				if($scope.advCondition.ten_kh){
					$scope.filter.ten_kh=$scope.advCondition.ten_kh
				}else{
					delete $scope.filter.ten_kh
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
			$scope.searchGroup = function(m){
				$scope.nh_lh = m._id;
				$scope.searchAVR()
			}
			$scope.enter = function(event){
				if(event.keyCode==13){
					$scope.searchAVR();
				}
			}
			$scope.btn3_click = function(){
				var to=[]
				$scope.list.forEach(function(c){
					if(c.email && c.sel){
						to.push({name:c.ten_lien_he,address:c.email})
					}
				})
				if(to.length>0){
					options.$location.url("mailschedule/add?to=" + JSON.stringify(to) +"&redirect=" + options.$location.url());
				}else{
					alert("Bạn phải chọn ít nhất một liên lạc")
				}
				
			}
		},
		onView:function($scope,options){
			$scope.addCustomer = function(){
				dmkhModule.quickadd(options.$modal,function(rs){
					rs.collection_name ="dmkh";
					$scope.addLink(rs,'ten_kh');
					if(!$scope.data.id_kh){
						$scope.data.id_kh = rs._id;
						options.service.update(id_app,$scope.data._id,$scope.data).success(function(t){
							_.extend($scope.data,t);
						})
					}
				})
				
			}
		}
});