;(function($){
	var certf ={
		appServer:utils.APP_URL_,

		access_token:'',
		timestamp:'',
		jsapi_ticket:'',
		nonceStr:'',
		url:'',
		appid:'',
		signature:'',
		
		//type:DOCTOR医生公众号；SICK患者公众号
		init:function(type){
			$.ajax({
				url: this.appServer+"/servlet/WxCertfServlet?type="+type+"&method=signature&url="+encodeURIComponent(location.href),
				data: {},
				dateType:'jsonp',
				async : true,
				success: function(data){
					var result=eval('(' + data + ')');
					certf.access_token = result.access_token;
					certf.timestamp = result.timestamp;
					certf.jsapi_ticket = result.jsapi_ticket;
					certf.nonceStr = result.nonceStr;
					certf.url = result.url;
					certf.appid = result.appid;
					certf.signature = result.signature;
					
					//alert(certf.signature);
				},
				error:function(xhr, type, errorThrown){
					console.log('微信签名失败!');
					console.log(xhr+"--"+type+"--"+errorThrown);
				}
			});
		},
		

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
		config:function(apiArray){
			//alert(wxUtils.timestamp+"==>"+wxUtils.nonceStr);
	  		wx.config({
			    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
			    appId: wxUtils.appid, // 必填，公众号的唯一标识
			    timestamp:wxUtils.timestamp, // 必填，生成签名的时间戳
			    nonceStr: wxUtils.nonceStr, // 必填，生成签名的随机串
			    signature: wxUtils.signature,// 必填，签名，见附录1
			    jsApiList: apiArray // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});
		},
		
		
		//以下是业务分享的js内容和方法
		
		
		//需要单独做签名的页面
		shareUrl:['sickHome.html','doctorHome.html','infoDetail.html','doctorCard.html','invateDoctor.html','questDesc.html'],
		wxShare:function(flag){
			var url = location.href;
			url = url.substring(url.lastIndexOf('/')+1,url.lastIndexOf('.html')+5);
			if(flag && wxUtils.orgMrk=='1'){
			}else{
				if(wxUtils.shareUrl.indexOf(url)!=-1){
					if(url=='sickHome.html'||url=='doctorHome.html'){
						wxUtils.orgMrk='0';
					}else{
						wxUtils.orgMrk='1';
					}
				}else{
					return;
				}
			}
			
			var type =  'SICK';
			try{
				if(userUtils.getUser().role=='1'){
					type = 'DOCTOR';
				}
			}catch(e){type =  'SICK';}

			//type:DOCTOR医生公众号；SICK患者公众号
			$.ajax({
				url: this.appServer+"/servlet/WxCertfServlet?type="+type+"&method=signature&url="+encodeURIComponent(location.href),
				data: {},
				dateType:'jsonp',
				async : true,
				success: function(data){
					var result=eval('(' + data + ')');
					certf.access_token = result.access_token;
					certf.timestamp = result.timestamp;
					certf.jsapi_ticket = result.jsapi_ticket;
					certf.nonceStr = result.nonceStr;
					certf.url = result.url;
					certf.appid = result.appid;
					certf.signature = result.signature;
					
					//alert(certf.signature);
					
					wxUtils.config(['onMenuShareQQ','onMenuShareAppMessage','onMenuShareQZone','onMenuShareTimeline','chooseWXPay']);
					wx.ready(function(){
//						wx.hideMenuItems({
//						    menuList: ['menuItem:copyUrl','menuItem:originPage','menuItem:openWithQQBrowser','menuItem:openWithSafari','menuItem:originPage'] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
//						});
						
						wx.onMenuShareAppMessage({
						    title: wxUtils.getWxShareTitle(), // 分享标题
						    desc: wxUtils.getWxShareDesc(), // 分享描述
						    link: wxUtils.getWxShareLink(), // 分享链接
						    imgUrl: wxUtils.getWxShareImgUrl(), // 分享图标
						    type: '', // 分享类型,music、video或link，不填默认为link
						    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
						    success: function () { 
						        // 用户确认分享后执行的回调函数
						        //alert('success');
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
						   	title: wxUtils.getWxShareTitle(), // 分享标题
						    desc: wxUtils.getWxShareDesc(), // 分享描述
						    link: wxUtils.getWxShareLink(), // 分享链接
						    imgUrl: wxUtils.getWxShareImgUrl(), // 分享图标
						    success: function () { 
						       // 用户确认分享后执行的回调函数
						    },
						    cancel: function () { 
						       // 用户取消分享后执行的回调函数
						    }
						});

						wx.onMenuShareQZone({
						    title: wxUtils.getWxShareTitle(), // 分享标题
						    desc: wxUtils.getWxShareDesc(), // 分享描述
						    link: wxUtils.getWxShareLink(), // 分享链接
						    imgUrl: wxUtils.getWxShareImgUrl(), // 分享图标
						    success: function () { 
						       // 用户确认分享后执行的回调函数
						    },
						    cancel: function () { 
						        // 用户取消分享后执行的回调函数
						    }
						});
						
						wx.onMenuShareTimeline({
						    title: wxUtils.getWxShareTitle(), // 分享标题
						    link: wxUtils.getWxShareLink(), // 分享链接
						    imgUrl: wxUtils.getWxShareImgUrl(), // 分享图标
						    success: function () { 
						        // 用户确认分享后执行的回调函数
						    },
						    cancel: function () { 
						        // 用户取消分享后执行的回调函数
						    }
						});
					});
				},
				error:function(xhr, type, errorThrown){debugger;
					alert('微信签名失败!1');
					alert(xhr+"--"+type+"--"+errorThrown);
				}
			});
		},
		wxBackShare:function(){
			if(wxUtils.orgMrk=='1'){
				wxUtils.wxShare(true);
				wxUtils.orgMrk ='0';
			}
		},
		orgMrk:0,//是否是原始状态的分享 0原始状态，1改变后的状态
		
		getWxShareTitle:function(){
			var url = location.href;
			var role = '0';//默认是患者
			try{
				role = userUtils.getUser().role;
				if(role=='')role='0';
			}catch(e){}
			
			if(url.indexOf('infoDetail.html')!=-1){
				return infoTitle4Share;		
			}else if(url.indexOf('doctorCard.html')!=-1){
				return '医生名片';		
			}else if(url.indexOf('invateDoctor.html')!=-1){
				return '邀请医生';		
			}else if(url.indexOf('doctorHome.html')!=-1){
				return '邀请函';		
			}else{
				if(role=='1'){
					return '邀请函';
				}else{
					return '掌尚儿保';
				}
			}
		},
		getWxShareDesc:function(){
			var url = location.href;
			var role = '0';//默认是患者
			try{
				role = userUtils.getUser().role;
				if(role=='')role='0';
			}catch(e){}
			
			if(url.indexOf('infoDetail.html')!=-1){
				return infoOverview4Share;		
			}else if(url.indexOf('doctorCard.html')!=-1){
				return '这是我在医生云工作室的名片，欢迎关注和咨询，我将竭诚为您服务!';		
			}else if(url.indexOf('invateDoctor.html')!=-1){
				return '我开通了医生云工作室，快来跟我一起把工作搬到云上去吧!';		
			}else if(url.indexOf('doctorHome.html')!=-1){
				return '掌尚儿保诚挚的邀请您一同开通医生云工作站，欢迎点击关注!';		
			}else{
				if(role=='1'){
					return '掌尚儿保诚挚的邀请您一同开通医生云工作站，欢迎点击关注!';
				}else{
					return '掌尚儿保-儿童家长的健康顾问，欢迎关注!';
				}
			}
		},
		getWxShareLink:function(){
			var url = location.href;
			var doctorId = "";
			var role = '0';//默认是患者
			try{
				role = userUtils.getUser().role;
				doctorId = userUtils.getUser().userId;
				if(role=='')role='0';
			}catch(e){}
			
			if(url.indexOf('infoDetail.html')!=-1){
				return url;		
			}else if(url.indexOf('doctorCard.html')!=-1){
				return url;		
			}else if(url.indexOf('invateDoctor.html')!=-1){
				return utils.APP_URL_+"/wx/page/friends/invateDoctor.html?doctorId="+doctorId;		
			}else if(url.indexOf('doctorHome.html')!=-1){
				return utils.APP_URL_+"/wx/page/handbook/doctorHandBook.html";		
			}else{
				if(role=='1'){
					return utils.APP_URL_+"/wx/page/handbook/doctorHandBook.html";		
				}else{
					return utils.APP_URL_+"/wx/page/handbook/sickHandBook.html";		
				}
			}
		},
		getWxShareImgUrl:function(){
			var url = location.href;
			var role = '0';//默认是患者
			try{
				role = userUtils.getUser().role;
				if(role=='')role='0';
			}catch(e){}
			
			if(url.indexOf('infoDetail.html')!=-1){
				return infoImg4Share;		
			}else if(url.indexOf('doctorCard.html')!=-1){
				return "http://7xq2xm.com2.z0.glb.qiniucdn.com/qrcode_zseb.jpg";		
			}else if(url.indexOf('invateDoctor.html')!=-1){
				return "http://7xq2xm.com2.z0.glb.qiniucdn.com/qrcode_zseb_yz.jpg";		
			}else if(url.indexOf('doctorHome.html')!=-1){
				return "http://7xq2xm.com2.z0.glb.qiniucdn.com/zseb_yz.jpg";		
			}else{
				if(role=='1'){
					return "http://7xq2xm.com2.z0.glb.qiniucdn.com/zseb_yz.jpg";	
				}else{
					return "http://7xq2xm.com2.z0.glb.qiniucdn.com/zseb.jpg";		
				}
			}
		}
	
	};
	certf.prototype=function(){
		
	};
	window['wxUtils']=certf;
})(jQuery);
//wxUtils.wxShare();







