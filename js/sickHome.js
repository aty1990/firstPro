var SickObj = function(){
	this.content	= $(".content");
	this.footer 	= $("#sickfooter");
	this.doctorList	= $("#doctorList");
	this.childBox	= $("div.mui-slider-item");
	this.subPageDiv	= $("#subPageDiv");
	this.indicator	= $("#mui-slider-indicator");
	this.init();
}
SickObj.prototype.init = function(){
	//初始化页面结构
	this.initPage();
	//初始化事件
	this.bindEvent();
	//初始化页面
	this.initData();
}
SickObj.prototype.initPage = function(){
	utils.initDivPage('main');
	mui.init();
	var bh=document.body.clientWidth;
	$(".content").height($(window).height()-50);
}
//初始化数据
SickObj.prototype.initData = function(){
	var _this = this;
	//不是从主页直接进来的，比如:从认证过来的
	if(!utils.sliceUrl(location.href).hasOwnProperty('code')){
		//从action获取数据
		utils.ajax([],'homeAction','sick',{},function(mrk,bd,cd){
			if(mrk){
				//回填数据
				_this.displayData(cd);
				
				//初始化用户信息
				_this.initUserData();
				//初始化容联IM即时聊天登陆
				_this.initIM();
				
				//处理微信分享
				$.getScript("http://res.wx.qq.com/open/js/jweixin-1.0.0.js", function(data, status, jqxhr) {
					_this.shareSick();
				});
			}
		});
	}else{
		//从主页进来加载微信分享
		$.getScript("http://res.wx.qq.com/open/js/jweixin-1.0.0.js", function(data, status, jqxhr) {
			//获取用户数据，并进去后台组装业务对象
			wxUtils.getWxUserInfo(function(data){
				console.log(JSON.stringify(data));
				//回填数据
				_this.displayData(data);
				//初始化用户信息
				_this.initUserData();
				//初始化容联IM即时聊天登陆
				_this.initIM();
				//处理微信分享
				_this.shareSick();
			});
		});
	}
}
//显示数据
SickObj.prototype.displayData = function(data){
		var userInfo = data.userInfo,
			_this 	 = this,
			layerIdx = "";
		//没有孩子
		if(data.homeBizData.result.length==0){
			layerIdx = layer.open({
			    content: '你还没有提供孩子信息，现在去填写吧!',
			    btn: ['确认','取消'],
			    shadeClose: false,
			    yes: function(){
			        location.href='mine/myChildList.html';
			    },
			    no: function(){
			    	WeixinJSBridge.call('closeWindow');
			    } 
			});
		}
		if(data.homeBizData.result.length<2){
			_this.childBox.eq(1).remove();
			_this.indicator.children().remove();
			mui('.mui-slider');
		}
		$.each(data.homeBizData.result,function(i,ele){
			var imgStr = "../image/img.jpg?v="+Date.now();
			if(ele.childInfo.img){
				imgStr = ele.childInfo.img+"?v="+Date.now();
			}
			_this.childBox.eq(i).attr("childId",ele.childInfo.childId);
			_this.childBox.eq(i).find("div.tips-por").children().eq(0).attr("src",imgStr);
			_this.childBox.eq(i).find("div.tips-babyname").html(ele.childInfo.childNme);
			_this.childBox.eq(i).find("span.age").html(ele.childInfo.age);
			_this.childBox.eq(i).find("span.childDesc").html(ele.tips);
			_this.childBox.eq(i).find("li.height").html("标准身高："+ele.height+"cm");
			_this.childBox.eq(i).find("li.weight").html("标准体重："+ele.weight+"kg");
			_this.childBox.eq(i).find("p.birthday").eq(0).html(ele.birthday);
			_this.childBox.eq(i).find("p.birthday").eq(0).html(ele.childInfo.birthString);
			_this.childBox.eq(i).attr("monthAge",ele.childInfo.monthAge);
			_this.childBox.eq(i).attr("dayAge",ele.childInfo.dayAge);
			var monthDom =_this.childBox.eq(i).find("div.tips-cal");
			monthDom.children().eq(0).html(ele.now.month+"月");
			monthDom.children().eq(1).html(ele.now.day);
			//宝宝贴士
			var infoTip = _this.childBox.find("ul.infoTipsList").eq(i);
			$.each(ele.infoList,function(index,object){
				var li = $(	"<li class='mui-table-view-cell mui-media' id='"+object.id+"'>"+
							"	<a href='javascript:;'>"+
							"		<div class='mui-media-body'>"+
							"			<h4>"+object.title+"</h4>"+
							"			<p class='mui-ellipsis-2'>"+object.overview+"</p>"+
							"		</div>"+
							"	</a>"+
							"</li>");
					li.click(function(){
						_this.viewInfoDetail(this);
					});
					infoTip.append(li);
			});
			
			//疫苗
			var vaccineList = _this.childBox.find("div.vaccine").eq(i);
			$.each(ele.vaccine,function(idx,o){
				var nme = o.nme;
				if(o.type=='1'){
					nme = nme+"(免费)";
				}else{
					nme = nme+"(自费)";
				}
				var div = $("<div class='tips-name' vid='"+o.id+"'>"+nme+"</div>");
					div.on('click',function(){
						_this.gotoVaccineDetail(this);
					});
				vaccineList.append(div);
			});
			//没有需要接种的疫苗
			if(ele.vaccine.length==0){
				_this.childBox.find("p.vaccineTitle").eq(i).html("<div class='nodata' style='padding-top:15px'><span class='newiconfont icon-nodata'></span><p>本月无疫苗接种计划</p></div>");
				
			}
		});
		mui('.mui-slider');
		
		//防止重复获取
		//名医推荐
		$.each(data.homeBizData.doctorList,function(j,obj){
			var li = $("<li class='mui-table-view-cell mui-media mui-col-xs-3' id='"+obj.id+"'>"+
						"	<img class='mui-media-object' src='"+obj.img+"'>"+
						"	<div class='mui-media-body'>"+obj.nme+"</div>"+
						"	<div class='mui-media-body tips-doctor-tit'>"+obj.title+"</div>"+
						"</li>");
				li.on("tap",function(){
					_this.toDoctorCard(this);
				}); 
			_this.doctorList.append(li);
		}); 
		$("#HomeMask").hide();
		$("#main").show();
}
//绑定事件
SickObj.prototype.bindEvent = function(){
	var _this_ = this;
	this.footer.children("li").on('tap',function(e){
		var _this=$(this);
		var opend=_this.attr('opend');
		if(_this.attr('class')=="current")return;
		//如果已经打开过就不执行跳转
		if(opend!="true"){
			_this.attr('opend','true');
			if(this.id.indexOf("adviceDoctor")!=-1){
				$.ajax({
		  			url:"findDoctor/findDoctorNew.html?type=sickHome&v="+Date.now(),
		  			dataType:'html',
		  			async:false,
		  			success:function(data){
		  				var htmlObj = $.parseHTML(data,true);
		  				if(htmlObj==null||htmlObj==''){
		  					mui.toast("指定地址的html内容为空");
		  					return false;
		  				}
		  				var flag = false;
		  				for(var t=0;t<htmlObj.length;t++){
		  					if(htmlObj[t].id=="findDoctor_Main"){
								var content = htmlObj[t].innerHTML;
				  				$("#adviceDoctor").html(content);
				  				flag = true;
		  					}
		  				}
		  				if(!flag){
		  					mui.toast("findDoctorNew.html不存在节点id为findDoctor_Main的元素，请检查代码");
		  				}
		  			},
		  			error:function(xhr, type, errorThrown){
		  				history.replaceState('','',location.href);
		  				mui.toast(xhr+"--"+type+"--"+errorThrown);
		  			}
		  		}); 
			}
		}
		$(this.id).show();
		_this.addClass('current');
		_this.siblings('li').each(function(i,ele){
			$(ele).removeClass('current');
			$(this.id).hide();
		});  
	});
}
//初始化IM登陆
SickObj.prototype.initIM = function(){
	imChat.login(userUtils.getUser().userId,{
		succFn:function(obj){
			utils.IMFlag = true;
			var typeObj = JSON.parse(localStorage.getItem("typeObj"));
			if(typeObj){
				if(typeObj.O){
					$("#unReadMsg").show(function(){
						$("#twMsg").show();
					});
				}
				if(typeObj.F){
					$("#unReadMsg").show(function(){
						$("#hasNewMsg").show();
					});
				}
			}
		},fail : function(obj){
			mui.toast(JSON.stringify(obj));
		},error : function(obj){
			mui.toast(JSON.stringify(obj));
		}
	}); 
}
//页面加载完成处理相关页面逻辑
SickObj.prototype.gotoPage = function(url,selector,container){
	if(url=='*'){
		mui.toast('功能开发中');
		return;
	}
	if(url.indexOf('?')!=-1){
		url = url+"&v="+Date.now();
	}else{
		url = url+"?v="+Date.now();
	}
	utils.openDivPage(url,selector,container);
}
//初始化医生头像信息
SickObj.prototype.initUserData = function(){
	var userInfoJson = userUtils.getUser();
	document.title = "欢迎您  "+userInfoJson.userNme;
	$("#userNme").html(userInfoJson.userNme);
	$("#userIcon").attr('src',(userInfoJson.userIconUrl==""?'../image/default.PNG':userInfoJson.userIconUrl)+"?v="+Date.now());
   
}
//身高体重评测
SickObj.prototype.goGrowthCriteria = function(obj){
	var childId = $(obj).parents(".mui-slider-item").attr('childId');
	location.href="healthExam/health/evaluationEdit.html?childId="+childId+"&v="+Date.now();
}
//儿心量表评测
SickObj.prototype.goCapabilityEvaluation = function(obj){
	var childId = $(obj).parents(".mui-slider-item").attr('childId');
	location.href="healthExam/exlb/baseTest.html?childId="+childId;
}

//查看更多评测
SickObj.prototype.gotoMoreTest = function(obj){
	var childId = $(obj).parents(".mui-slider-item").attr('childId');
	location.href="healthExam/children/healthEdu.html?childId="+childId+"&v="+Date.now();
}

//查看宝宝贴士详细 及文章详情
SickObj.prototype.viewInfoDetail = function(obj){
	var infoId = $(obj).attr('id')
	var url = "wx/page/infomation/infoDetail.html?infoId="+infoId;
	utils.openDivPage(url,'infoDetail_main','subPageDiv');
}

//查看更多的图文资讯
SickObj.prototype.gotoMoreInfo = function(obj){
	var childObj = $(obj).parents(".mui-slider-item");
	var monthAge = childObj.attr("monthAge");
	var dayAge = childObj.attr("dayAge");
	location.href="infomation/infoList.html?monthAge="+monthAge+"&dayAge="+dayAge+"&v="+Date.now();
}
//查看医生名片
SickObj.prototype.toDoctorCard = function(obj){
	var doctorId =$(obj).attr('id');
	utils.openDivPage("wx/page/mine/doctorCardNew.html?doctorId="+doctorId,'doctorCard_main','doctorCard_main');
}

//查看疫苗详细
SickObj.prototype.gotoVaccineDetail = function(obj){
	var vid = $(obj).attr('vid');
	var monthAge = $(obj).parents(".mui-slider-item").attr("monthAge");
	var url = "wx/page/growthtips/vaccineDetails.html?vid="+vid+"&monthAge="+monthAge;
	utils.openDivPage(url,"vaccineDetails_main","subPageDiv");
}

//查看整个疫苗接种计划
SickObj.prototype.gotoVaccineSched = function(obj){
	var monthAge = $(obj).parents("div.mui-slider-item").attr("monthAge");
	var url = "wx/page/growthtips/vaccineList.html?monthAge="+monthAge;
	utils.openDivPage(url,"vaccineList_main","subPageDiv");
}
//患者的分享
SickObj.prototype.shareSick = function(){
	var apiArray = ['onMenuShareQQ','onMenuShareAppMessage','onMenuShareQZone','onMenuShareTimeline','chooseWXPay'];
	wxUtils.wxConfig(apiArray,function(){
		var title = '掌尚儿保';
		var desc = '掌尚儿保,儿童家长的健康顾问，欢迎关注!';
		var link = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7108786cb171967b&redirect_uri='+utils.APP_URL_+'/wx/page/sickHome_.html&response_type=code&scope=snsapi_userinfo&state={type:SICK}#wechat_redirect';
		var imgUrl = 'http://7xq2xm.com2.z0.glb.qiniucdn.com/zseb.jpg';
		var type = '';
		var dataUrl = '';
		wxUtils.wxShare(title,desc,link,imgUrl,type,dataUrl);
	});
}
var sickObj = null;
if (!sickObj)
	sickObj = new SickObj();