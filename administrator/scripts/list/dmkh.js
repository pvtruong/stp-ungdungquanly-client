//["ma_kh","ten_kh","dia_chi","dien_thoai","fax","email"]
var dmkhModule = new baseInput('dmkh','customer',["ma_kh","ten_kh","dia_chi","dien_thoai","fax","email"],'Khách hàng',{
	has_view:true,
	onView:function($scope,options){
		$scope.addContact = function(){
			lienheModule.quickadd(options.$modal,function(rs){
				rs.collection_name ="lienhe";
				$scope.addLink(rs,'ten_lien_he');
			},{id_kh:$scope.data._id,ten_kh:$scope.data.ten_kh})
		}
	},
    onAdd:function($scope,options){
        $scope.data.phu_trach = options.$rootScope.user.email;
        $scope.data.visible_to =1;
        $scope.data.kh_yn =true;
        $scope.data.ncc_yn =false;
    },
	onLoading:function($scope,options){
		$scope.advCondition ={}
		options.$rootScope.nextTick(function(){
			options.$http.get(server_url + "/api/" + id_app + "/group?q={group_type:'CUSTOMER'}")
			.success(function(groups){
				$scope.groups = groups;
			})
		})
		$scope.btn3_click = function(){
				var to=[]
				$scope.list.forEach(function(c){
					if(c.email && c.sel){
						to.push({name:c.ten_kh,address:c.email})
					}
				})
				if(to.length>0){
					options.$location.url("mailschedule/add?to=" + JSON.stringify(to) +"&redirect=" + options.$location.url());
				}else{
					alert("Bạn phải chọn ít nhất một liên lạc")
				}
				
			}
		$scope.searchAVR =function(){
			if(!$scope.renderCompleted){
				return;
			}
			$scope.filter ={}
			//by time
			var tu_ngay,den_ngay;
			var curr = new Date;
			if($scope.time=='d'){
				//xem ngay hien tai
				tu_ngay = new Date();
				den_ngay = new Date();
				
			}
			if($scope.time=='w'){
				var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
				var tu_ngay = new Date(curr.setDate(first));
				var den_ngay = new Date(curr.setDate(tu_ngay.getDate()+6));
			}
			if($scope.time=='m'){
				//xem thang hien tai
				tu_ngay = curr;
				tu_ngay.setDate(1);
				den_ngay = new Date(tu_ngay.getFullYear(),tu_ngay.getMonth()+1,0);		
			}
			if($scope.time=='3m'){
				//xem quy hien tai
				var current_month = curr.getMonth();
				var quy=1;
				if(current_month<3) quy=0; else if (current_month<6) quy =3; else if (current_month<6) quy=6; else quy=9;
				tu_ngay = new Date(curr.getFullYear(),quy,1);
				den_ngay = new Date(curr.getFullYear(),quy + 3,0);
			}
			if($scope.time=='y'){
				//xem nam hien tai
				tu_ngay = new Date(curr.getFullYear(),0,1);
				den_ngay = new Date(curr.getFullYear(),11,31);	
			}
			
			if(tu_ngay && den_ngay){
				tu_ngay.setHours(0);
				tu_ngay.setMinutes(0);
				tu_ngay.setSeconds(0)
	
				den_ngay.setHours(23);
				den_ngay.setMinutes(59);
				den_ngay.setSeconds(0);
				$scope.filter.date_created ={$gte:tu_ngay,$lte:den_ngay};
			}
			//phu trach
			if($scope.phu_trach){
				$scope.filter.phu_trach = $scope.phu_trach;
			}else{
				delete $scope.filter.phu_trach
			}
			if($scope.nh_kh){
				$scope.filter.nh_kh = $scope.nh_kh;
			}else{
				delete $scope.filter.nh_kh
			}
			if($scope.advCondition.ten_kh){
				$scope.filter.$or =[{ten_kh:{$regex:$scope.advCondition.ten_kh,$options:'i'}},{ma_kh:{$regex:$scope.advCondition.ten_kh,$options:'i'}},{dien_thoai:{$regex:$scope.advCondition.ten_kh,$options:'i'}},{phu_trach:{$regex:$scope.advCondition.ten_kh,$options:'i'}},{email:{$regex:$scope.advCondition.ten_kh,$options:'i'}}]
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
			if($scope.advCondition.ma_so_thue){
				$scope.filter.ma_so_thue={$regex:$scope.advCondition.ma_so_thue,$options:'i'}
			}else{
				delete $scope.filter.ma_so_thue
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
			$scope.nh_kh = m._id;
			$scope.searchAVR()
		}
		$scope.reportByTime = function(m){
			$scope.time=m;
			$scope.searchAVR();
		}
	}
});