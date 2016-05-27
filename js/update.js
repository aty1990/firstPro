var UPDATE_=function(){
	
	this.checkInterval=0,//3600000,//升级检查间隔，单位为ms,1小时为60*60*1000=3600000, 如果每次启动需要检查设置值为0
	this.updateInfo = null;
	//获取服务器最新版本号
	this.getLastestVersion = function(){
		var osName = plus.os.name;
		return update.getServerUpdateInfo()[osName].version;
	}
	//获取当前版本号
	this.getCurrentVersion = function(){
		return plus.runtime.version;
	}
	//获取服务器最新版本信息
	this.getServerUpdateInfo= function(){
		if(update.updateInfo!=null){
			return update.updateInfo;
		}
		//同步获取服务器版本升级信息
		mui.ajax(utils.APP_URL_+"/update.json",{
			data:{},
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型 get 会缓存数据，使用post方式获取数据
			async: false,
			success:function(data){
				update.updateInfo = data;
				console.log(JSON.stringify(data));
			}
		});
		return update.updateInfo;
	}
	
	
	this.init=function(){
		update.getServerUpdateInfo();
	}
	//自动在线升级 flag=M 手动升级，为空表示自动升级
	this.autoUpdate=function(flag){
		var lv = this.getLastestVersion();
		var cv = this.getCurrentVersion();
			
		//自动升级需要检查间隔和忽略的版本号
		if(flag==undefined||flag==null){
			var ignoreVersion = plus.storage.getItem("ignoreVersion_");
			var preUpdateTm = plus.storage.getItem("updateTm");
			if(preUpdateTm==undefined||preUpdateTm==null||preUpdateTm==''){
				preUpdateTm = 0;
			}
			preUpdateTm = parseInt(preUpdateTm);
			var now = (new Date()).getTime();
			//小于升级间隔，不检查
			if(now-preUpdateTm<update.checkInterval){
				return ;
			}
			console.log(ignoreVersion);
			console.log(lv);
			//已经确认忽略的版本号不进行自动提示升级
			if(ignoreVersion==lv){
				return;
			}
		}
		
		
		var n_lv=parseInt(lv.split('.').join(''));
		var n_cv=parseInt(cv.split('.').join(''));
		
		//最新版本比当前版本号大
		if(n_cv<n_lv){
			var updateInfo = update.getServerUpdateInfo();
			var inf = updateInfo[plus.os.name];
			// 提示用户是否升级
			plus.ui.confirm( inf.note, function(i){
				if ( 0==i.index ) {
					plus.runtime.openURL( inf.url );
				} else if ( 1==i.index ) {
					//忽略的版本号
					plus.storage.setItem( 'ignoreVersion_', lv );
					//记录本次升级时间
					plus.storage.setItem( 'updateTm', (new Date()).getTime().toString() );
				} else {
					//记录本次升级时间
					plus.storage.setItem( 'updateTm', (new Date()).getTime().toString() );
				}
			}, inf.title, ["立即更新","跳过此版本","取　　消"] );
		}
	}
	
	this.updateManual=function(){
		update.autoUpdate("M");
	}
	
}

var update = new UPDATE_();
