var id_app;
var access_token;
var paths_not_require_id_app = ['code','app','colleague','notification','message','profile','users','comment','versioninfo','admin','rptobject'];
var accApp = angular.module("accApp",modulesD);
	
accApp.config(['$provide','$httpProvider', function($provide,$httpProvider) {
  //config for text editor
  var insertTextAtCursor = function(text) {
		var sel, range;
		if (window.getSelection) {
			sel = window.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				range = sel.getRangeAt(0);
				range.deleteContents();
				range.insertNode(document.createTextNode(text));
			}
		} else if (document.selection && document.selection.createRange) {
			document.selection.createRange().text = text;
		}
	}
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions){
		// register the tool with textAngular
		taRegisterTool('insertName', {
			buttontext:'Tên',
			action: function(){
			
                return insertTextAtCursor("{{receiver.name}}");
            
			}
		});
		// register the tool with textAngular
		taRegisterTool('insertAddress', {
			buttontext:'Email',
			action: function(){
			
                return insertTextAtCursor("{{receiver.address}}");
            
			}
		});
		// add the button to the default toolbar definition
		taOptions.toolbar[1].push('insertName');
		taOptions.toolbar[1].push('insertAddress');
		return taOptions;
	}]);
	$provide.factory('myHttpInterceptor',['$q','$rootScope', '$location', function($q, $rootScope, $location) {
	  return {
		  request:function(config){
			  return config;
		  },
		  requestError: function(rejection) {
			  return $q.reject(rejection);
		  },
		  response:function(response){
			  return response
		  },
		  responseEror:function(response){
			  if(response.status === 401){
				  $rootScope.isLogined = false;
				  $location.url('/login');
			  }else{
				  if(response.status==0 || response.status==500){
					  $rootScope.error("Không kết nối được với máy chủ")
				  }
			  }
			  return $q.reject(response);
		  }
	  }
	}])
	 $httpProvider.interceptors.push('myHttpInterceptor');
}])

// allow DI for use in controllers, unit tests
accApp.constant('_', window._);
accApp.constant('async', window.async);

//set token to header cho tat ca ca ham api
accApp.factory('api', ['$http', '$localStorage','$rootScope',function ($http, $localStorage,$rootScope) {
  return {
      init: function (token) {
			if(!token){
				token = $localStorage.get('token');
			}
			if(!token){
				$rootScope.isLogined = false;
			}else{
				$rootScope.isLogined = true;
				$rootScope.token = token;
			}
			//console.log(token);
		  access_token = token;
		 
          $http.defaults.headers.common['X-Access-Token'] = token;
      }
  };
}]);
//khai bao de su dung thu vien async, underscope, init api
accApp.run(['$rootScope','api','$window','user','app','$location','$http','appInfo','$timeout','editableOptions',function ($rootScope,api,$window,user,app,$location,$http,appInfo,$timeout,editableOptions) {
     editableOptions.theme = 'bs3'; 
     //$rootScope.async = window.async;
	 $rootScope.isLogined = false;
	 var version_major =1;
	 var version_minor =4;
	 var os ="WINDOWS"
	 $rootScope.program_name = "ỨNG DỤNG QUẢN LÝ";
	 $rootScope.program_version = version_major +"." + version_minor;
    //
    $http.get(server_url + "/public/province").success(function(province){
        $rootScope.province = province;
    });
	 //check update if desktop version
	 if(appInfo.asDesktop()){
		var url =server_url +  "/public/versioninfo?q={os:'" + os + "',app:'UDQL'}"
        $http.get(url).success(function(versioninfos){
			if(versioninfos.length>0){
				var versioninfo =  versioninfos[0]
				if(version_major<versioninfo.major || (version_major===versioninfo.major && version_minor<versioninfo.minor)){
					if(confirm("Có một bản cập nhật cho chương trình này. Bạn có muốn tải về không?")){
						$window.open(versioninfo.url);
					}
				}
			}
		})
        
	 }
	 //check internet connection
	 $rootScope.online = true;
	 $window.addEventListener("offline", function () {
        $rootScope.$apply(function() {
          $rootScope.online = false;
        });
      }, false);
      $window.addEventListener("online", function () {
        $rootScope.$apply(function() {
          $rootScope.online = true;
        });
      }, false);
	  
	 //$rootScope._ = window._;
	 $rootScope.nextTick = function(callback){
		 $timeout(callback,0)
	 }
	 $rootScope.server_url =server_url
	 //get commands
	 $rootScope.$watch('app_info',function(newValue,oldValue){
		 if(newValue){
			 //get task
			$rootScope.getTask();
			//get menu
			$rootScope.crm_input_visible = false;
			$rootScope.crm_report_visible = false;
			$rootScope.acc_visible = false;
			$rootScope.commands ={}
			appInfo.commands($rootScope.id_app);
			 //members
			 $rootScope.members =[{email:$rootScope.app_info.user_created,name:$rootScope.app_info.user_created.split("@")[0]}];
			$rootScope.app_info.participants.forEach(function(r){
				$rootScope.members.push({email:r.email,name:r.name})
			})
		 }
	 },true)
	 //create menu
	 $rootScope.$watch(function() { 
		  return $location.path(); 
		},
		function(a){
		  a = a.toLowerCase().split("/");
		  if(a.length<=1 || a[1]=="dashboard"|| a[1]==""){
			  $rootScope.menuActive ="DASHBOARD";
		  }else{
			  if($rootScope.commands){
				  var m = _.find($rootScope.commands.modules,function(module){return module.path==a[1]});
				  if(m) $rootScope.menuActive = m.group;
			  }
			  if(a[1]=="login" || a[1] =="logout"){
				$rootScope.messages_count =0;
				$rootScope.notifies_count =0;
				$rootScope.task_count =0;				
			  }
		  }
		  
		});
	$rootScope.$watch('commands',function(newValue){
		if(newValue){
		  var a = $location.path().toLowerCase().split("/");
		  if(a.length<=1){
			  $rootScope.menuActive ="DASHBOARD";
		  }else{
			   var m = _.find($rootScope.commands.modules,function(module){return module.path==a[1]});
			   if(m) $rootScope.menuActive = m.group;
		  }
		}
	},true);
    
     $rootScope.$on('$routeChangeStart', function(next, current) { 
         $window.scrollTo(0, 0);
         $rootScope.$broadcast("$dataChangeSuccess");
     });
    
	 $rootScope.openPath = function(path,menu){
		 $rootScope.menuActive = menu;
		 $location.url(path);
	 }
	 //search
	 $rootScope.searchword =""
	 $rootScope.searchAllKeyup = function($event,word){
		 if($event.keyCode===13){
			 if(word){
				$location.url("search/" + word);
			 }
		 }
	 }
     $rootScope.searchAll = function(word){
        
		  if(word){
				$location.url("search/" + word);
			 }
	 }
	
	 api.init();
	 Metronic.init();
	 Layout.init();
}]);
