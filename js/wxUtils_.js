function WxUtils_(){
	
	this.getWxUserInfo = wxUtils_getWxUserInfo;
	this.wxConfig = wxUtils_wxConfig;
	this.wxShare = wxUtils_wxShare;
	
	
	this.configErrorNum = 0;//签名错误次数
	this.tryConfigNum = 0;//签名重试次数
	
	function wxUtils_getWxUserInfo(callback){
		var code = utils.sliceUrl(location.href).code;
		var state = utils.sliceUrl(location.href).state;
		$.ajax({
			url: utils.APP_URL_+"/servlet/WxAuthServlet", 
			method:"post",
			dataType:"json",
			async : false,
			data:{
				'code':code,
				'state':state,
				'url':location.href
			},
			success: function(data){
				//需要强制跳转的
				if(data.redirectUrl){
					userUtils.setUser(data.userInfo);
					//alert(JSON.stringify(data.userInfo));
					alert("请先绑定电话号码，以便能更好的为您服务!");
					location.href = data.redirectUrl;
				}else{
					userUtils.setUser(data.userInfo);
					
					//处理业务数据回填
					if(callback){
						callback(data);
					}
				}
			}
		});
	}
	
	//验证微信js-sdk
	//			     	'checkJsApi',
	//			        'onMenuShareTimeline',
	//			        'onMenuShareAppMessage',
	//			        'onMenuShareQQ',
	//			        'onMenuShareWeibo',
	//			        'onMenuShareQZone',
	//			        'hideMenuItems',
	//			        'showMenuItems',
	//			        'hideAllNonBaseMenuItem',
	//			        'showAllNonBaseMenuItem',
	//			        'translateVoice',
	//			        'startRecord',
	//			        'stopRecord',
	//			        'onVoiceRecordEnd',
	//			        'playVoice',
	//			        'onVoicePlayEnd',
	//			        'pauseVoice',
	//			        'stopVoice',
	//			        'uploadVoice',
	//			        'downloadVoice',
	//			        'chooseImage',
	//			        'previewImage',
	//			        'uploadImage',
	//			        'downloadImage',
	//			        'getNetworkType',
	//			        'openLocation',
	//			        'getLocation',
	//			        'hideOptionMenu',
	//			        'showOptionMenu',
	//			        'closeWindow',
	//			        'scanQRCode',
	//			        'chooseWXPay',
	//			        'openProductSpecificView',
	//			        'addCard',
	//			        'chooseCard',
	//			        'openCard'
	function wxUtils_wxConfig(apiArray,callback){
		var type =  'SICK';
		try{
			if(userUtils.getUser().role=='1'){
				type = 'DOCTOR';
			}
		}catch(e){type =  'SICK';}
		//type:DOCTOR医生公众号；SICK患者公众号
		$.ajax({
			url: utils.APP_URL_+"/servlet/WxCertfServlet?type="+type+"&method=signature&url="+encodeURIComponent(location.href.split("#")[0]),
			data: {},
			dateType:'jsonp',
			async : false,//同步调用false，异步调用true
			success: function(data){
				var result=eval('(' + data + ')');
				//alert(JSON.stringify(result));
				wx.config({
				    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				    appId: result.appid, // 必填，公众号的唯一标识
				    timestamp:result.timestamp, // 必填，生成签名的时间戳
				    nonceStr: result.nonceStr, // 必填，生成签名的随机串
				    signature: result.signature,// 必填，签名，见附录1
				    jsApiList: apiArray // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
				});
				
				wx.ready(function(){//debugger;
					if(callback)
						callback();
				});
				wx.error(function(res){
				    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
					//签名失败重试3次
					if(wxUtils.configErrorNum<wxUtils.tryConfigNum){
						wxUtils.configErrorNum	= wxUtils.configErrorNum+1;
						console.log("开始重试第"+wxUtils.configErrorNum+"次签名");
						wxUtils.wxConfig(apiArray, callback);
					}else{
						//mui.toast("微信签名失败"+JSON.stringify(res));
					}
				});
				
			},
			error:function(){
				console.log("微信签名错误，ajax返回error");//debugger;
				if(wxUtils.configErrorNum<wxUtils.tryConfigNum){
					wxUtils.configErrorNum	= wxUtils.configErrorNum+1;
					console.log("开始重试第"+wxUtils.configErrorNum+"次签名");
					wxUtils.wxConfig(apiArray, callback);
				}else{
					//mui.toast("微信签名错误");
				}
			}
		});
	}
	
	function wxUtils_wxShare(title,desc,link,imgUrl,type,dataUrl){
		wx.onMenuShareAppMessage({
		    title: title, // 分享标题
		    desc: desc, // 分享描述
		    link: link, // 分享链接
		    imgUrl: imgUrl, // 分享图标
		    type: type, // 分享类型,music、video或link，不填默认为link
		    dataUrl: dataUrl, // 如果type是music或video，则要提供数据链接，默认为空
		    success: function () { 
		        // 用户确认分享后执行的回调函数
		        mui.toast("感谢您的分享");
		    },
		    cancel: function () { 
		        // 用户取消分享后执行的回调函数
		        //alert('cancel');
		    },
		    complete:function(){
		    	//alert('complete');
		    },
		    trigger:function(){
		    	
		    }
		});
		wx.onMenuShareQQ({
		   	title: title, // 分享标题
		    desc: desc, // 分享描述
		    link: link, // 分享链接
		    imgUrl: imgUrl, // 分享图标
		    success: function () { 
		       // 用户确认分享后执行的回调函数
		    	mui.toast("感谢您的分享");
		    },
		    cancel: function () { 
		       // 用户取消分享后执行的回调函数
		    }
		});

		wx.onMenuShareQZone({
		    title: title, // 分享标题
		    desc: desc, // 分享描述
		    link: link, // 分享链接
		    imgUrl: imgUrl, // 分享图标
		    success: function () { 
		       // 用户确认分享后执行的回调函数
		    	mui.toast("感谢您的分享");
		    },
		    cancel: function () { 
		        // 用户取消分享后执行的回调函数
		    }
		});
		
		wx.onMenuShareTimeline({
		    title: title, // 分享标题
		    link: link, // 分享链接
		    imgUrl: imgUrl, // 分享图标
		    success: function () { 
		        // 用户确认分享后执行的回调函数
		    	mui.toast("感谢您的分享");
		    },
		    cancel: function () { 
		        // 用户取消分享后执行的回调函数
		    }
		});
	}
}
var wxUtils= new WxUtils_();