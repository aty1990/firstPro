var DoctorObj = function(options) {
	this.userNme	= $("#userNme");
	this.popover	= $("#custPopover");
	this.dptNme		= $("#dptNme");
	this.header		= $("#header");
	this.headImg	= $("#head-img");
	this.footer		= $("#footer");
	this.twList		= $("#twList");
	this.dhList		= $("#dhList");
	this.sickList	= $("#sickList");
	this.subPageDiv	= $("#subPageDiv");
	this.sickWrapper= $("#sickWrapper");
	this.tabs		= $("#tabs");
	this.init();
};
//页面逻辑处理入口
DoctorObj.prototype.init = function(){
	mui.init();
	//初始化页面
	this.initPage();
	//获取后台业务数据
	this.initData();
	//绑定事件
	this.bindEvent();
};
//初始化页面结构
DoctorObj.prototype.initPage = function(){
	utils.initDivPage('main');
	$(".content").height($(window).height()-50);
};
//初始化数据
DoctorObj.prototype.initData = function(){
	var _this = this;
	//不是从主页直接进来的，比如:从认证过来的
	if(!utils.sliceUrl(location.href).hasOwnProperty('code')){
		//从action获取数据
		utils.ajax([],'homeAction','doctor',{},function(mrk,bd,cd){
			if(mrk){
				//回填数据
				_this.displayData(cd);
				//初始化容联IM即时聊天登陆
				_this.initIM();
				//处理微信分享
				$.getScript("http://res.wx.qq.com/open/js/jweixin-1.0.0.js", function(data, status, jqxhr) {
					_this.shareDoctor();
					window.setTimeout(_this.initAdjustTitle(),200);
				});
			}
		});
	}else{
		//从主页进来加载微信分享
		$.getScript("http://res.wx.qq.com/open/js/jweixin-1.0.0.js", function(data, status, jqxhr) {
			//获取用户数据，并进去后台组装业务对象
			wxUtils.getWxUserInfo(function(data){
				_this.displayData(data);
				//初始化容联IM即时聊天登陆
				_this.initIM();
				//处理微信分享
				_this.shareDoctor();
				window.setTimeout(_this.initAdjustTitle(),200);
			});
		});
	}
};
//绑定事件
DoctorObj.prototype.bindEvent = function(){
	var _this_ = this;
	//初始化底部菜单切换
	_this_.footer.find("li").on('click',function(){
		var _this=$(this);
		var opend=_this.attr('opend');
		if(_this.attr('class')=="current")return;
		$(this.id).show();
		//如果已经打开过就不执行跳转
		if(opend!="true"){
			_this.attr('opend','true');
		    if(this.id.indexOf("mySicks")!=-1){
				(function($) {
					//阻尼系数
					var deceleration = mui.os.ios?0.003:0.0009;
					$('#sickWrapper').scroll({
						bounce: false,
						indicators: true, //是否显示滚动条
						deceleration:deceleration
					});
					$.ready(function() {
						$("#sickWrapperDiv").pullToRefresh({
							up:{
								auto:true,
								callback: function() {
									var self = this;
									var ul = self.element.querySelector('#sickList');
									var fragment = document.createDocumentFragment();
									var firstNum = ul.childNodes.length;
									
									_this_.loadMoreData(firstNum,fragment,function(len){
										ul.appendChild(fragment);
										self.endPullUpToRefresh(len<10);
									});
								}
							}
						});
					});
				})(mui);
			}
		}
		$(this.id).show();
		_this.addClass('current');
		_this.siblings('li').each(function(i,ele){
			$(ele).removeClass('current');
			$(this.id).hide();
		});
	});
	//图文待办事项与电话待办事项切换
	_this_.tabs.children("li").each(function(i,ele){
		$(ele).on("click",function(e){
			var targetDom = $(this).attr("targetId");
			var dom	= $("#"+targetDom);
			dom.show();
			dom.siblings().hide();
			
		});
	});
};
//显示后台返回的数据
DoctorObj.prototype.displayData = function(data){
	//初始化用户信息
	this.initUserData(userUtils.getUser());
	//初始化首页数据
	this.initHomeData(data);
};
//初始化医生头像信息
DoctorObj.prototype.initUserData = function(data){
	document.title=data.userNme+" 医生";
	//用户名称
	this.userNme.html(data.userNme);
	//部门
	this.dptNme.html(data.dptNme);
	//头像
	this.headImg.attr('src',data.userIconUrl+"?v="+Date.now());
};
//初始化首页数据
DoctorObj.prototype.initHomeData = function(data){
	var _this = this;
	//首页需要的业务数据
	var homeData = data.homeBizData;
	//已处理咨询
	this.header.children("li").eq(0).find("p").eq(1).html(homeData.total.done);
	//已累计收入
	this.header.children("li").eq(1).find("p").eq(1).html(homeData.total.charge);
	
	//图文咨询待办
	var twData = homeData.tw;
	$("li[targetId='twList']").find("p>span").html(twData.length);
	//判断是否有图文待办事项
	if(twData.length>0){
		//有 循环添加到页面
		$.each(twData,function(i,ele){
			//对电话号码做处理
			var tel = ele.CBuyerPhoneNo;
			//前3位
			var firstStr = tel.slice(0,3);
			//后4位
			var lastStr = tel.slice(tel.length-4);
			var li = $(	"<li class='mui-table-view-cell mui-media'>										"+
					"	<a href='javascript:;'>															"+
					"		<div class='doctor-list-icon mui-pull-left'>								"+
					"			<span class='newiconfont icon-xiaoxi'></span>							"+
					"		</div>																		"+
					"		<div class='mui-media-body'>												"+
					"			<div class='doctor-list-name'>											"+
					//"				<span class='mui-pull-left'>"+ele.CBuyerNme+"("+firstStr+"****"+lastStr+")</span>"+
					"				<span class='mui-pull-left'>"+ele.CBuyerNme+"</span>"+
					"				<span class='mui-pull-right'>"+ele.TBuyTm+"</span>					"+
					"			</div>																	"+
					"			<p class='mui-ellipsis doctor-list-info mui-col-xs-9 mui-pull-left'>"+(ele.CBuyerMsg==undefined?"无":ele.CBuyerMsg)+"</p>"+
					"			<div class='doctor-list-price mui-pull-right'>"+ele.finalPrice+"元</div>"+
					"			<div class='mui-ellipsis mui-pull-left messages'>"+(ele.lastMsgOwner!==""?(ele.lastMsgOwner+':'+ele.lastMsg):'')+"</div>"+
					"		</div>																		"+
					"	</a>																			"+
					"</li>");
				//设置自定义属性
				li.attr({
					orderId		:ele.COrderId,	//订单id
					targetId	:ele.CBuyerId,	//购买者id
					roomId		:ele.COrderId,	//房间号
					targetName	:ele.CBuyerNme,	//目标名称
					userIcon	:ele.CBuyerImg,	//目标头像
					buyerMsg	:ele.CBuyerNme+"："+ele.CBuyerMsg,	//买家留言
					orderState	:1	//目标头像
				});
				//绑定事件
				li.on("click",function(e){
					var json ={
						orderId 	: $(this).attr("orderId"),
						targetId 	: $(this).attr("targetId"),
						roomId 		: $(this).attr("roomId"),
						targetName 	: $(this).attr("targetName"),
						userIcon 	: $(this).attr("userIcon"),
						orderState 	: $(this).attr("orderState"),
						buyerMsg	: $(this).attr("buyerMsg"),
						sendType 	: "O",			//发送消息的类型 O：订单消息  F：免费消息
						creater 	: "",			//群组创建者
						role 		: 1,			//角色   1：医生   0：患者
						chatType 	: "single"		//聊天类型  single单聊    more群聊
					};  
					var _src="wx/page/sessionmsg/chatWindow.html?v="+Date.now();
					_this.gotoPage(_src,'talkPageDiv_Main','talkPageDiv_Main');
					//发布频道
					$.publish("/params",[json]); 
				});
				//将节点添加到页面元素中
				_this.twList.children("ul").append(li);
		});
	}else{
		//没有图文待办事项
		_this.twList.children("ul").html("<li class='mui-table-view-cell mui-media doctor-list-no'><span class='newiconfont icon-nodata'></span><p>没有图文待办事项</p></li>");
	}
	//电话咨询待办
	var dhData = homeData.dh;
	
	$("li[targetId='dhList']").find("p>span").html(dhData.length);
	//判断是否有电话待办事项
	if(dhData.length>0){
		//有 循环添加到页面
		$.each(dhData,function(i,ele){
			var li = $(	"<li class='mui-table-view-cell mui-media'>"+
					"	<a href='javascript:;'>"+
					"		<div class='doctor-list-icon mui-pull-left'>"+
					"			<span class='newiconfont icon-dianhua'></span>"+
					"		</div>"+
					"		<div class='mui-media-body'>"+
					"			<div class='doctor-list-name'>"+
					//"				<span class='mui-pull-left'>"+ele.CBuyerNme+"("+ele.CBuyerPhoneNo+")</span>"+
					"				<span class='mui-pull-left'>"+ele.CBuyerNme+"</span>"+
					"				<span class='mui-pull-right'>"+ele.TBuyTm+"</span>"+
					"			</div>"+
					"			<p class='mui-ellipsis doctor-list-info mui-col-xs-9 mui-pull-left'>"+ele.CBuyerMsg+"</p>"+
					"			<div class='doctor-list-price mui-pull-right'>"+ele.finalPrice+"元</div>"+
					"			<div class='mui-ellipsis mui-pull-left messages'>"+(ele.callLong!==''?("<span class='mui-pull-left'>"+ele.callTm+"</span><span class='mui-pull-right'>"+ele.callLong+"</span>"):'')+"</div>"+
					"		</div>"+
					"	</a>"+
					"</li>");
				//设置自定义属性
				li.attr({
					orderId:ele.COrderId,	//订单id
					buyerId:ele.CBuyerId,	//购买者id
				});
				//绑定事件
				li.on("click",function(){
					var url = "wx/page/mall/orderDesc4Doctor.html?orderId="+ele.COrderId;
					utils.openDivPage(url,"orderDesc4Doctor_main","orderDesc4Doctor_subPage");
				});
				//将节点添加到页面元素中
				_this.dhList.children("ul").append(li);
		});
	}else{
		//没有电话待办事项
		_this.dhList.children("ul").html("<li class='mui-table-view-cell mui-media doctor-list-no'><span class='newiconfont icon-nodata'></span><p>没有电话待办事项</p></li>");
	}
	
};
//初始化IM登陆
DoctorObj.prototype.initIM = function(){
	//引入依赖的js
	imChat.login(userUtils.getUser().userId,{
		succFn:function(obj){
			utils.IMFlag = true;
		},fail : function(obj){
			mui.toast(JSON.stringify(obj));
		},error : function(obj){
			mui.toast(JSON.stringify(obj));
		}
	}); 
};
//去设置服务和收费
DoctorObj.prototype.gotoSvcSetting = function(_url){
	var _this = this;
	var state = userUtils.getUser().identify;
	if(state=="A"){
		utils.openIframePage("main","subPageDiv",_url);
	}else{
		if(state=="0"){
			mui.toast("医生认证通过才能设置服务");return;
		}
		utils.confirm("只有认证的医生才能设置服务，是否现在去设置?",function(){
			_this.gotoDoctorIdentify();
		},function(){
		});
		
	}
};
//去设置排班
DoctorObj.prototype.gotoWorkSched = function(){
	var state = userUtils.getUser().identify, _this = this;
	if(state == "A")
		_this.gotoPage('wx/page/workSched/defaultWorkSched.html','defaultWorkSched_main','subPageDiv');
	else{
		if(state=="0"){
			mui.toast("医生认证通过才能设置排班");return;
		}
		utils.confirm("只有认证的医生才能设置排班，是否现在去设置?",function(){
			_this.gotoDoctorIdentify();
		},function(){
		});
	}
};
//去医生认证页面
DoctorObj.prototype.gotoDoctorIdentify = function(){
	utils.openDivPage('wx/page/mine/doctorIdentify.html?mrk=add&doctorId='+userUtils.getUser().userId+'&v='+Date.now(),'doctorIdentify_main','doctorIdentify_main');
	return;
};
//加载我的患者列表
DoctorObj.prototype.loadMoreData = function(firstNum,fragment,callback){
	var _this = this;
	utils.ajax([],'mineAction','mySicks',{'firstResult':firstNum,'maxResult':10},function(flag,bizData,custData){
		if(flag){
			if(custData.result.length>0){
				$.each(custData.result,function(index,obj){
					//1:获取孩子信息
					var childList=obj.userInfo.childInfo;
					//3:生成html片段
					var html = $("<li class='mui-table-view-cell mui-media'>"+
								 "    <div class='mui-slider-right mui-disabled' userId='"+obj.userInfo.CUserId+"' id='slideDel'>"+
								 "        <a class='mui-btn mui-btn-red'>删除</a>"+
								 "    </div>"+
								 "    <div class='mui-slider-handle'>"+
								 "	      <img userId='"+obj.userInfo.CUserId+"' userName='"+obj.userInfo.CUserNme+"' class='patient-img mui-pull-left' src='"+obj.userInfo.CUserIconUrl+"'>"+
								 "	      <div class='mui-media-body childrenAll'>"+
								 "	          <div class='patient-name'>"+obj.userInfo.CUserNme+"</div>"+
								 "	  	  </div>"+
								 "    </div>"+
								 "</li>");
						//如果孩子个数大于一
						if(childList.length>0){
							for(var i=0;i<childList.length;i++){
								var dl = $("<dl class='patient-son' CChildId='"+childList[i].CChildId+"' childName='"+childList[i].CChildNme+"' CPatientId='"+childList[i].CPatientId+"' CPatientRecordId='"+childList[i].CPatientRecordId+"'>"+
								 "	          <dt>"+
								 "	              <h4>"+childList[i].CChildNme+"</h4>"+
								 "	              <span class='newiconfont "+(childList[i].CChildSex=='M'?'icon-nan':'icon-nv')+"'></span>"+
								 "	          </dt>"+
								 "	          <dd class='mui-ellipsis'>"+(childList[i].CTag==''?'暂未添加孩子标签信息，请您尽快完善孩子标签信息':childList[i].CTag)+"</dd>"+
								 "	      </dl>");
								 if(childList.length==1){
								 	dl.css("width","100%");
								 }
								 html.find("div.childrenAll").append(dl);
							}
						}
					html.children("div#slideDel").on("click",function(){
						_this.delMySick(this);
						return false;
					});
					html.on("click",function(){
						$("#custPopover ul").children("li.subLi").remove();
						var chatLi = $("<li class='subLi' userId='"+obj.userInfo.CUserId+"' src='"+obj.userInfo.CUserIconUrl+"' userName='"+obj.userInfo.CUserNme+"'>发送消息</li>");
							chatLi.on("click",function(){
								_this.gotoChatWin(this);
							});
						$("#custPopover ul").prepend(chatLi);
						var frame = "";
						html.find("dl.patient-son").each(function(idx,ele){
							frame += "<li class='subLi' onclick='doctorObj_.viewSickDetail(this)' CPatientId='"+$(ele).attr("CPatientId")+"' CPatientRecordId='"+$(ele).attr("CPatientRecordId")+"' CChildId='"+$(ele).attr("CChildId")+"'>"+$(ele).attr("childName")+"</li>";
						});
						$("#custPopover ul").prepend(frame);
						$("<div>", {
							"class":  "ui-mask",
							"id"   :  "ui-mask",
						  	"text" :  "",
						  	click: function(){
						    	_this.popover.slideToggle('fast','swing',function(){
						    		$("#ui-mask").remove();
						    	});
						  	}
						}).appendTo($("#mySicks")); 
						_this.popover.slideToggle('fast','swing');
					});
					fragment.appendChild(html.get(0));
				});
				
				if(callback){
					callback(custData.result.length);
				}
			}else{
				if(callback){
					callback(0);
				}
			}
		}
	},function(xhr, type, errorThrown){
		alert("error");
	},false);
};
//向患者发送消息页面初始化
DoctorObj.prototype.gotoChatWin = function(obj){
	var _this = this;
	$("#ui-mask").trigger("click");
	var json = {
		roomId		: $(obj).attr("userId"),
		targetId	: $(obj).attr("userId"),
		targetName	: $(obj).attr("userName"),
		userIcon	: $(obj).attr("src"),
		orderId		: "",
		sendType	: "F",			//发送消息的类型 O：订单消息  F：免费消息
		creater		: "",			//群组创建者
		role		: "1",			//角色   1：医生   0：患者
		chatType	: "single"		//聊天类型  single单聊    more群聊				
	};
	_this.gotoPage("wx/page/sessionmsg/chatWindow.html?v="+Date.now(),'talkPageDiv_Main','talkPageDiv_Main');
	//发布频道
	$.publish("/params",[json]); 
};
//删除我的患者
DoctorObj.prototype.delMySick = function(obj){
	var sickId  = $(obj).attr("userId");
	//1、confirm 提示用户是否真正删除
	utils.confirm("是否删除该患者",function(){
		utils.ajax([], "mineAction", "delUserRel", {'relUserId':sickId}, function(mrk,bd,cd){
			mui.toast('删除成功');
			$(obj).parent().remove();
		}, function(){
			mui.toast('删除失败');
		});
	},function(){});
};
//去医生名片
DoctorObj.prototype.gotoDoctorCard = function(){
	var state = userUtils.getUser().identify,_this = this;
	if(state =="A")
		_this.gotoPage('wx/page/mine/doctorCardNew.html','doctorCard_main','doctorCard_main');
	else{
		if(state=="0"){
			mui.toast("医生认证通过才能查看名片");return;
		}
		utils.confirm("只有认证的医生才能查看自己名片，是否现在去设置?",function(){
			_this.gotoDoctorIdentify();
		},function(){
		});
	}
};
//去设置收费
DoctorObj.prototype.gotoTollSet = function(){
	var state = userUtils.getUser().identify,_this = this;
	if(state =="A")
		location.href='mine/svcSetting.html' 
	else{
		if(state=="0"){
			mui.toast("医生认证通过才能设置收费");return;
		}
		utils.confirm("只有认证的医生才能设置收费，是否现在去设置?",function(){
			_this.gotoDoctorIdentify();
		},function(){
		});
	}
};

//页面加载完成处理相关页面逻辑
DoctorObj.prototype.gotoPage = function(url,selector,container){
	if(url=='*'){
		mui.toast('功能开发中');return;
	}
	if(url.indexOf("doctorIdentify.html")!=-1){
		url+="&doctorId="+userUtils.getUser().userId;
	}
	if(url.indexOf('?')!=-1){
		url = url+"&v="+Date.now();
	}else{
		url = url+"?v="+Date.now();
	}
	utils.openDivPage(url,selector,container);
};
//查看科普文章
DoctorObj.prototype.gotoInfoList = function(){
	location.href="infomation/infoList.html?v="+Date.now();
};
//查看我的文章
DoctorObj.prototype.gotoMyInfoList = function(){
	location.href = "infomation/infoList.html?articleOwnerId="+userUtils.getUser().userId+"&v="+Date.now();
};
//查看我的收藏
DoctorObj.prototype.gotoMyCollection = function(){
	//location.href="../page/mine/myCollection.html?v="+Date.now();
	this.gotoPage("wx/page/mine/myCollection.html?v="+Date.now(),"myCollection_main","myCollection_main");
};
//初始化医生资料的认证状态
DoctorObj.prototype.initAdjustTitle = function(){
	var state = userUtils.getUser().identify,_this = this;
	if(state=='A'){//通过
		$("#identified").show();
	}else if(state=='0'){//审核中
		$("#adjusting").show();
	}else{//未认证通过 或者 未认证
		$("#noIdentify").show();
		if(state=="0")return;
		utils.confirm("只有认证的医生才能为患者提供服务，<br>是否现在去设置?",function(){
			_this.gotoDoctorIdentify();
		},function(){});
	}
};
//邀请患者
DoctorObj.prototype.invitePatients = function(){
	var state = userUtils.getUser().identify,
		_this = this;
	if(state=="A"){
		var doctorId = userUtils.getUser().userId,
			doctorNme = userUtils.getUser().userNme,
			dptNme = userUtils.getUser().dptNme,
			officeNme = userUtils.getUser().officeNme,
			url = "wx/page/about/invitePatients.html?doctorId="+doctorId+"&doctorNme="+doctorNme+"&dptNme="+dptNme+"&officeNme="+officeNme+"&v="+Date.now();
			_this.gotoPage(url,"invitePatients_main","subPageDiv");
	}else{
		if(state=="0"){
			mui.toast("医生认证通过才能邀请患者");return;
		}
		utils.confirm("只有认证的医生才能邀请患者，是否现在去设置?",function(){
			_this.gotoDoctorIdentify();
		},function(){});
	}
};
//邀请医生
DoctorObj.prototype.inviteDoctor = function(){
	var state = userUtils.getUser().identify,
		_this = this;
	if(state=="A"){
		var doctorId = userUtils.getUser().userId,
			doctorNme = userUtils.getUser().userNme,
			dptNme = userUtils.getUser().dptNme,
			officeNme = userUtils.getUser().officeNme,
			url = "wx/page/about/inviteDoctor.html?doctorId="+doctorId+"&doctorNme="+doctorNme+"&dptNme="+dptNme+"&officeNme="+officeNme+"&v="+Date.now();
			_this.gotoPage(url,"invateDoctor_main","invateDoctor_main");
	}else{
		if(state=="0"){
			mui.toast("医生认证通过才能邀请医生");return;
		}
		utils.confirm("只有认证的医生才能邀请医生，是否现在去设置?",function(){
			_this.gotoDoctorIdentify();
		},function(){});
	}
};
//医生名片分享
DoctorObj.prototype.shareDoctor = function(){
	var apiArray = ['onMenuShareQQ','onMenuShareAppMessage','onMenuShareQZone','onMenuShareTimeline','chooseWXPay'];
	wxUtils.wxConfig(apiArray,function(){
		var title = '掌尚儿保医助',
		 	desc = '掌尚儿保诚挚的邀请您一同开通医生云工作站，欢迎点击关注!!',
		 	link = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7108786cb171967b&redirect_uri='+utils.APP_URL_+'/wx/page/doctorHome_.html&response_type=code&scope=snsapi_userinfo&state={type:DOCTOR}#wechat_redirect',
		 	imgUrl = 'http://7xq2xm.com2.z0.glb.qiniucdn.com/zseb_yz.jpg',
		 	type = '',
		 	dataUrl = '';
		wxUtils.wxShare(title,desc,link,imgUrl,type,dataUrl);
	});
};
//查看患者下孩子对应的详细信息
DoctorObj.prototype.viewSickDetail = function(obj){
	var _this = this,
		_src = "wx/page/mine/childForSick.html?CPatientId="+$(obj).attr('CPatientId')+"&ChildId="+$(obj).attr('CChildId')+"&CPatientRecordId="+$(obj).attr('CPatientRecordId');
	_this.gotoPage(_src,'childForSick_main','subPageDiv');	
	$("#ui-mask").trigger("click");
};
var doctorObj_ = null;
if (!doctorObj_) {doctorObj_ = new DoctorObj();}
	

