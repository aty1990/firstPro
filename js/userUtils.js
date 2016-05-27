var USERUTILS_ = function() {
	//用户信息json数据的模板，不在里面的key不能设置
	var template = {
		'userId' : '',
		'userNme' : '',
		'phoneNo' : '',
		'password':'',
		'role':'',
		'userIconUrl' : '',
		'sign':'',
		//以下是医生特有数据
		'dptId' : '',
		'dptNme' : '',
		'officeId' : '',
		'officeNme' : '',
		'profess':'',
		'other':'',
		'speciality':'',
		'selfIntroduction':'',
		'certfUrl1':'',
		'certfUrl2':'',
		'identify':''
	};
	//临时存储从localStorage中获取的数据，避免重复获取
	var userJson ={};

	this.setUser = function(userInfoJson) {
//		for (var key in userInfoJson) {
//			if (!template.hasOwnProperty(key)) {
//				alert('非法key:' + key);
//				return;
//			}
//		}
		
		//将参数user对象中的属性赋值到localStorage对象中，而不是把整个user对象覆盖
		var t = this.getUser();
		for(var key in userInfoJson){
			t[key]=userInfoJson[key];
		}
		
		window.localStorage.removeItem('userInfo_');
		window.localStorage.setItem('userInfo_', JSON.stringify(t));
		
		//清除缓存
		this.userJson = {};
	}

	this.getUser = function() {
		//从对象中直接取，避免外部调用的时候频繁getUser
		if (this.userJson!=undefined&&JSON.stringify(this.userJson)!='{}') {
			return this.userJson;
		}
		var userInfoStr = window.localStorage.getItem('userInfo_');
		//如果内存数据库中没有userInfo_这个key值，则有可能是首次用户绑定时候的场景，此时返回template
		if(userInfoStr!=undefined&&userInfoStr!='undefined'){
			this.userJson = utils.stringToJson(userInfoStr);
			return this.userJson;
		}else{
			return template;
		}
		
	}

}
var userUtils = new USERUTILS_();

//判断url的参数，确实页面是否从后台直接过来，如果是，则需要初始化前台的userUtils数据
//var urlParam = decodeURIComponent(decodeURIComponent(location.href));
//var urlParamJson = utils.sliceUrl(urlParam);
//if(urlParamJson.hasOwnProperty('fromMenu') && urlParamJson.fromMenu=='true'){
//	var userInfo = urlParamJson.userInfo;
// 	var userInfoJson = utils.stringToJson(userInfo);
// 	userUtils.setUser(userInfoJson);
//}