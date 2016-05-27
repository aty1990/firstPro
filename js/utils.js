var UTILS = function() {
	var _this=this;
	//this.APP_URL_ = 'http://sunnidy.wicp.net/app';//hneb0731.oicp.net
	this.APP_URL_ = 'http://aty.ittun.com/app';//hneb0731.oicp.net
//	this.APP_URL_ = 'http://app.hneb.net/app/';//hneb0731.oicp.net
	this.YTX_APPID_="aaf98f8950e15fc10150f478cd742ca8";
	//this.QINIU_URL_ ='http://7xq2xk.com2.z0.glb.qiniucdn.com/';//七牛云端对应的存储地址
	this.QINIU_URL_CHAT ='http://7xqbp2.com2.z0.glb.qiniucdn.com/';//七牛云端对应的存储地址
	this.QINIU_URL_SYS ='http://7xq2xm.com2.z0.glb.qiniucdn.com/';//七牛云端对应的存储地址
	this.QINIU_URL_USER ='http://7xq2xk.com2.z0.glb.qiniucdn.com/';//七牛云端对应的存储地址
	//发送ajax请求
	this.ajax 				= utils_ajax;
	this.layerIndex			= "";
	//防止首页初始化就返回（兼容写法，android ios返回的问题）
	this.backflag 			= false;
	//用于标识用户当前处于哪个页面
	this.position			= "";
	this.currentDivId		= "";
	//用于表示是否登陆了容联IM
	this.IMFlag				= false;	
	this.initDivPage=function(container){
		utils.currentDivId=container;
	}
	this.confirm=function(msg,yesFn,noFn){
		var layerObj = layer.open({
		    content: msg,
		    btn: ['取消','确认'],
		    shadeClose: false,
		    style: 'width:80%;border:none;',
		    no: function(){
		    	layer.close(layerObj);
		    	yesFn&&yesFn();
		    },
		    yes: function(){
		    	layer.close(layerObj);
		    	noFn&&noFn();
		    } 
		});
	}
	
	
	//监听文本框输入事件
	this.listerEvent=function(id){
		var domNode=document.getElementById(id);
		//type=text
		$(domNode).find('input[type=text]').each(function(i,ele){
			$(ele).on('input',function(e){
				var _this_=$(this);
				//_this.css({"border":"1px solid #007AFF","background":"none"});
				var textVal=this.value;
				if(!_this.filterChar(textVal)){
					_this_.val(textVal.replace(/[\>\<]/ig,""));
				}
			});
		});
		
		//type=number
		$(domNode).find('input[type=number]').each(function(i,ele){
			var str="";
			$(ele).on('input',function(e){
				var _this_=$(this);
				//_this.css({"border":"1px solid #007AFF","background":"none"});
				var textVal=this.value;
				if(/^\d+$/.test(textVal)){
					str=textVal;
				}else{
					_this_.val(str);
					if(_this_.val().length==1){
						_this_.val('');
					}
				}
			});
		});
		
		//监听textarea的input事件
		$("textarea").each(function(i,ele){
			$(ele).on('input',function(e){
				var _this_=$(this);
				//_this.css({"border":"1px solid #007AFF","background":"none"});
				var textVal=this.value;
				if(!_this.filterChar(textVal)){
					_this_.val(textVal.replace(/[\>\<]/ig,""));
				}
			});
		});
		//监听email的input事件
		$(domNode).find('input[type=email]').each(function(i,ele){
			$(ele).on('input',function(e){
				var _this_=$(this);
				var textVal=this.value;
				if(!_this.filterChar(textVal)){
					_this_.val(textVal.replace(/[\>\<]/ig,""));
				}
			});
		});
		
	}
	//监听文本框输入事件 end
	
	//过滤特殊字符
	this.filterChar=function(textVal){
	    var pattern=/[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im;  
	    if(pattern.test(textVal)){  
	        return false;     
	    }     
	    return true;  
	}
	//验证email格式
	this.checkMail=function(mail) {
	 	var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	 	if (filter.test(mail)){
	 		return true;
	 	}else{
	 		alert('您的电子邮件格式不正确');return false;
	 	}
	}
	//电话验证
	this.validateTel=function(tel){
		 var pattern = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
		 if (pattern.test(tel)) {
			return true;
		 }
		return false;
	}
	
	//表单字段监听
	this.toValidate=function(arr){
		var result=true;
		//目前只针对一个表单提交
		var box=arr[0];
		var divId=document.getElementById(box);
		//input
		var inputs=$(divId).find('input');
		inputs.each(function(i,obj){
			var _this_=$(obj);
			var textVal=obj.value;
			var required=_this_.attr('required');
			if(required){
				if(!textVal){
					//空值处理
					_this_.css({"background":"url('../../image/xinghao.svg') right center no-repeat","background-size":"20px 20px"});
					result=false;
				}
			}
			//email
			if(_this_.attr('type')=="email"){
				//判断email是否为空
				if(_this_.val()){
					if(!_this.checkMail(_this_.val())){
						result=false;
					}
				}
			}
			
		});
		//textarea
		$('textarea').each(function(i,ele){
			var _this_=$(ele);
			var req=_this_.attr('required');
			if(req){
				if(!ele.value){
					//空值处理
					_this_.css({"background":"url('../../image/xinghao.svg') right center no-repeat","background-size":"20px 20px"});
					result=false;
				}
			}
		});
		return result;
		
	}
	
	//
	/**
	 * 
	 * @param {} urlParam 需要请求的url页面地址
	 * @param {} selector 需要请求的url页面地址中的哪个dom节点，该参数该节点的id值
	 * @param {} container 获得目标页面的dom片段后放到哪个容器显示
	 */
	this.openDivPage=function(urlParam,selector,container){
		urlParam = utils.APP_URL_+"/"+urlParam;
		if(!container || ''==container){
			container = new Date().getTime();
		}
		var orgUrl = location.href;
		if(!history.state){
			history.pushState(utils.currentDivId,'',location.href);
		}
		history.pushState(container,'',urlParam);
		
		var t1 = new Date().getTime();
		var t2='';
		var containerObj = document.getElementById(container);
		//容器存在，且容器内的url与需要请求的url一致，不重新请求，只需要显示出来即可
		if(containerObj && $(containerObj).attr('url') && $(containerObj).attr('url')==urlParam){
			$("#"+utils.currentDivId).hide();
			$("#"+container).show();
			utils.currentDivId = container;
		}else{
			$.ajax({
	  			url:urlParam,
	  			dataType:'text',
	  			cache:false,
	  			async:false,
	  			success:function(data){
	  				t2= new Date().getTime();
	  				var htmlObj = $.parseHTML(data,true);
	  				if(htmlObj==null||htmlObj==''){
	  					alert("指定地址的html内容为空");
	  					return false;
	  				}
	  				//目标url是否存在指定selector节点
	  				var selectorExist = false;
	  				for(var t=0;t<htmlObj.length;t++){
	  					if(htmlObj[t].id==selector){
							var content = htmlObj[t].innerHTML;
			  				if(containerObj){
			  					$(containerObj).attr('url',urlParam);
			  					$(containerObj).children('div').html(content);
			  				}else{
				  				var divObj = "<div autoCreate='true' style='background: #eee;width: 100%;height: 100%;position: absolute;left:0;right:0;z-index:99;' id='"+container+"' url='"+urlParam+"'>"
				  								+"<div style='height:100%;overflow:auto;'>"+content+"</div>"
				  								//+content
				  							+"</div>";
				  				$('body').append(divObj);
			  				}
			  				selectorExist = true;
							break;
	  					}
	  				}
	  				if(!selectorExist){
	  					history.replaceState('','',orgUrl);
	  					alert(urlParam+"不存在指定节点的id为"+selector+"请检查代码");
	  					return false;
	  				}else{
  						$("#"+utils.currentDivId).hide();
						$("#"+container).show();
						utils.currentDivId = container;
	  				}
	  			},
	  			error:function(xhr, type, errorThrown){
	  				history.replaceState('','',orgUrl);
	  				console.log("请求"+urlParam+"失败，请确认地址是否存在!");
	  				console.log(xhr+"--"+type+"--"+errorThrown);
	  			}
	  		});
		}
		//wxUtils.wxShare();
		var t3 = new Date().getTime();
		//alert("请求html耗时："+(t2-t1)+"---动态修改html耗时"+(t3-t2));
	}
	/**
	 * 以iframe打开页面
	 * 	 currenPage 当前页面的Div的id
	 *   targetPage 当前页面目标Div的id
	 *   url		请求页面的url地址
	 */
	this.openIframePage = function(currenPage,targetPage,url){
		var iframePage=$("<iframe frameborder=0  scrolling='no' src='"+url+"'></iframe>");
			iframePage.css({
				"overflow"	: "hidden",
				"width"		: "100%",
				"height"	: "100%",
				"padding"	: 0,
				"margin"	: 0,
			});
		var targetDom = $("#"+targetPage);
		if(targetDom.html()==undefined){
			targetDom = $("<div id='"+targetPage+"'><div></div></div>");
			targetDom.css({
				"position"	: "absolute",
				"background": "#eee",
				"left"		: 0,
				"right"		: 0,
				"z-index"	: 9999,
				"overflow"	: "hidden",
				"bottom"	: 0,
				"top"		: 0
			});
			targetDom.children().eq(0).css({
				"height"	: "100%",
				"width"		: "100%",
				"overflow"	: "hidden"
			});
		}
		targetDom.children('div').eq(0).html(iframePage);
		$("body").append(targetDom);
		this.showDiv(currenPage,targetPage);
	}
	
	this.showDiv=function(currentDiv,targetDiv){
		if(!history.state){
			history.pushState(utils.currentDivId,'',location.href);
		}
		history.pushState(targetDiv,'','');
		utils.currentDivId = targetDiv;
		$('#'+targetDiv).show();
		$('#'+currentDiv).hide();
	}
	//判断空对象
	this.isEmptyObject = function(obj){
		for (var key in obj) {
		  	return false;
		}
		return true;
	}
	this.loadStr="<svg class='loadMsg' viewBox='0 0 120 120' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>"+
					"<g id='circle' class='g-circles'>"+
						"<circle id='12' transform='translate(35, 16.698730) rotate(-30) translate(-35, -16.698730) ' cx='35' cy='16.6987298' r='10'></circle>"+
						"<circle id='11' transform='translate(16.698730, 35) rotate(-60) translate(-16.698730, -35) ' cx='16.6987298' cy='35' r='10'></circle>"+
						"<circle id='10' transform='translate(10, 60) rotate(-90) translate(-10, -60) ' cx='10' cy='60' r='10'></circle>"+
						"<circle id='9' transform='translate(16.698730, 85) rotate(-120) translate(-16.698730, -85) ' cx='16.6987298' cy='85' r='10'></circle>"+
						"<circle id='8' transform='translate(35, 103.301270) rotate(-150) translate(-35, -103.301270) ' cx='35' cy='103.30127' r='10'></circle>"+
						"<circle id='7' cx='60' cy='110' r='10'></circle>"+
						"<circle id='6' transform='translate(85, 103.301270) rotate(-30) translate(-85, -103.301270) ' cx='85' cy='103.30127' r='10'></circle>"+
						"<circle id='5' transform='translate(103.301270, 85) rotate(-60) translate(-103.301270, -85) ' cx='103.30127' cy='85' r='10'></circle>"+
						"<circle id='4' transform='translate(110, 60) rotate(-90) translate(-110, -60) ' cx='110' cy='60' r='10'></circle>"+
						"<circle id='3' transform='translate(103.301270, 35) rotate(-120) translate(-103.301270, -35) ' cx='103.30127' cy='35' r='10'></circle>"+
						"<circle id='2' transform='translate(85, 16.698730) rotate(-150) translate(-85, -16.698730) ' cx='85' cy='16.6987298' r='10'></circle>"+
						"<circle id='1' cx='60' cy='10' r='10'></circle>"+
					"</g>"+
					"<use xlink:href='#circle' class='use'/>"+
				"</svg>";
	//json格式转换成string格式
	this.jsonToString = utils_jsonToString;
	//string格式转换成json格式
	this.stringToJson = utils_stringToJson;
	//截取url里的参数以json格式返回
	this.sliceUrl = function(_url){
		var jsonData={};
		var _url = decodeURIComponent(decodeURIComponent(_url));
		var paramStr=_url.slice(_url.indexOf('?')+1);
		//多个参数
		if(paramStr.indexOf('&')!=-1){
			var paramArr=paramStr.split('&');
		    for(var i in paramArr){
		    	var tempArr=paramArr[i].split('=');
		    	jsonData[tempArr[0]]=tempArr[1];
		    }
		}else{
			//一个参数
			var tempArr=paramStr.split('=');
			jsonData[tempArr[0]]=tempArr[1];
		}
		
	    return jsonData;
	}
	/**
	 * 上传图片
	 * options json参数
	 * 		previewImg      图片预览
	 * 		succFn:			图片成功回调		返回图片base64编码
	 * 		maxWidth		图片最大宽度
	 */
	this.uploadImage = function(options){
		var _this = this;
		var uploadFile = $("<input type='file'>");
		uploadFile.attr("accept", "image/*");
		uploadFile.change(function(){
			var file = this.files[0];
			//这里我们判断下类型如果不是图片就返回 去掉就可以上传任意文件
			if(!/image\/\w+/.test(file.type)){
				alert("图片格式不正确，请选择正确格式的图片文件！");
				return false;
			}else{
	 			var fileReader = new FileReader();
				fileReader.onprogress = function(e) {
					console.log((e.loaded / e.total * 100).toFixed() + "%");
				};
				fileReader.onload = function(e) {
					lrz(file).then(function (rst) {
						if(!rst.base64)return;
			 			options.previewImg && options.previewImg(rst.base64);
 						//默认最大高度200px
 						var maxW = options.maxWidth || 150,
 						img = new Image();
 						img.onload = function(){ 
 							var dataURL = _this.compress(img);
 							options.succFn && options.succFn(dataURL);
 						};
 						// 记住必须先绑定事件，才能设置src属性，否则img没内容可以画到canvas
 						img.src = rst.base64;
 						uploadFile.remove();
					});
				};
				fileReader.onerror = function(e) {
					alert("图片加载失败");
					//loadError.call(this, e);
				};
				fileReader.readAsDataURL(file); // 读取文件内容
			} 
		});
		uploadFile.trigger('click');
	}
	 /**
     * 生成16随机字符串
     */
	this.generateUUID = (function (uuidRegEx, uuidReplacer) { 
	     return function () { 
	         return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase(); 
	     }; 
	 })(/[xy]/g, function (c) { 
	     var r = Math.random() * 16 | 0, 
	         v = c == "x" ? r : (r & 3 | 8); 
	     return v.toString(16); 
	 }),
	/**
	 * 图片压缩
	 * 	img	图片
	 */
	this.compress = function(img){
		var canvas = document.createElement("canvas");
        var ctx = canvas.getContext('2d');
        var moreCanvas = document.createElement("canvas");
        var morectx = moreCanvas.getContext("2d");
        var width = img.width;
        var height = img.height;
        var ratio;
        if ((ratio = width * height / 4000000) > 1) {
            ratio = Math.sqrt(ratio);
            width /= ratio;
            height /= ratio;
        } else {
            ratio = 1;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var count;
        if ((count = width * height / 1000000) > 1) {
            count = ~~(Math.sqrt(count) + 1);
            var nw = ~~(width / count);
            var nh = ~~(height / count);
            moreCanvas.width = nw;
            moreCanvas.height = nh;
            for (var i = 0; i < count; i++) {
                for (var j = 0; j < count; j++) {
                    morectx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                    ctx.drawImage(moreCanvas, i * nw, j * nh, nw, nh);
                }
            }
        } else {
            ctx.drawImage(img, 0, 0, width, height);
        }
        var ndata = canvas.toDataURL('image/jpeg', 0.4);
        moreCanvas.width = moreCanvas.height = canvas.width = canvas.height = 0;
        return ndata;
	},
	//上传孩子头像七牛
	this.upload = function(options) {
		var o=this;
		//获取上传token令牌
		utils.ajax([],'qiniuAction','getUpToken',{'scene':'sysdata'},function(mrk,bd,cd){
			var targetId = o.generateUUID();
			//准备上传
			var url = "http://up.qiniu.com/putb64/-1/key/"+base64encode(utf16to8("usericon_"+targetId+".jpg"));
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-Type", "MIME");
			xhr.setRequestHeader("Authorization", "UpToken "+cd.upToken);
			xhr.setRequestHeader("Cache-Control", "no-store");
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					//云端文件名字
					var remoteFileName = o.QINIU_URL_SYS + o.stringToJson(xhr.responseText).key;
					options.succFn && options.succFn(remoteFileName);  
				}
			}
			xhr.send(options.dataURL);
		},function(){});
	},
	//上传头像到七牛 end-------------------
	//监听微信返回事件
	this.back = function(){
		var o = this,
			state = history.state;
		if(state){
			try{
				var showObjId = state,
					hideObjId = o.currentDivId;
		  		//如果是自动创建的容器，则隐藏后消亡，回收内存
		  		var autoCreate = $("#"+utils.currentDivId).attr('autoCreate');
		  		$("#"+hideObjId).hide();
				$("#"+showObjId).show();
				//判断用户是否修改了孩子信息，是就刷新首页数据
		  		if(o.currentDivId=="myChildList_main" && o.position=="editChild"){
		  			location.reload();return;
		  		}
		  		o.currentDivId = state;
		  		if(autoCreate && autoCreate=='true'){
		  			$("#"+hideObjId).remove();
		  		}
		  		o.backflag = true;
		  		
		  		if(state=="main"){
		  			o.backflag = false,
		  			o.position = "main";
		  		}
		  		//检测当前用户是否全屏预览图片（friendsList.html的聊天图片预览）
		  		if(mui.getPreviewImage()){
		  			var _MUI_PREVIEWIMAGE = document.getElementById("__MUI_PREVIEWIMAGE");
			  		if(_MUI_PREVIEWIMAGE.style.display=="block"){
			  			$(_MUI_PREVIEWIMAGE).removeClass('mui-preview-in').addClass('mui-preview-out');
			  			IMDom.groupList.find("li[checkedState=true]").trigger("tap");
			  		}
		  		}
			}catch(e){
				//alert(e);
			}
		}else{
			if(utils.backflag){
				history.back();
				utils.backflag = false;
				if(state=="main"){
					WeixinJSBridge.call('closeWindow');
					imChat.logout();
				}
			}else{
				//hack iphone5s iphone4s
				if((window.screen.height==480 || window.screen.height==568) && o.position != "main")return;
				WeixinJSBridge.call('closeWindow');
			}
		}
	}
	
	/**
	 * 业务提示框，相当于window.alert(); 业务自己手动调用
	 * msg  	信息提示内容，
	 * type 	图标类型， 1:加载中的图片  2:成功  3：提示信息图标 
	 * endSuc	提示框消失后的回调  
	 * time 	关闭的秒数
	 */
	this.popMsg = function(msg,type,time,endSuc){
		if(!msg)msg="成功";
		var iconTip=iconTip='<span class="icon newiconfont icon-tstip2" style="font-size:60px;padding-bottom:.2em;"></span><br/>'+msg;
		if(type){
			switch (type) {
			case 1:
				iconTip=_this.loadStr+"<br/>"+msg;
				break;
			case 2:
				iconTip='<br/><span class="icon newiconfont icon-tstip2" style="font-size:60px;padding-bottom:.2em;"></span><br/><br/>'+msg;
				break;
			case 3:
				iconTip='<br/><span class="icon newiconfont icon-tstip1" style="font-size:60px;color:#fff;"></span><br/><br/>'+msg;
				break;
			default:
				break;
			}
		}
		_this.layerIndex=layer.open({
		    style: 'border:none; background-color:black; color:#fff;opacity:0.8;text-align:center;',
		    content:iconTip,
		    time:time,
		    end:function(){
		    	endSuc && endSuc();
		    }
		});
	}

	this.isWxBrows=function(){
	    var ua = navigator.userAgent.toLowerCase();
	    if(ua.match(/MicroMessenger/i)=="micromessenger") {
	        return true;
	    } else {
	        //return false;
	    	return window.navigator.userAgent.indexOf("Chrome") !== -1  ;
	    }
	}
	
	
	this.loginMrk = false;

	this.replaceStr = utils_replaceStr;
	this.validate = utils_validate;

	function utils_replaceStr(str) {
		str = str.replace(/%/g, "%25");
		str = str.replace(/&/g, "%26");
		str = str.replace(/\+/g, "%2B");
		str = str.replace(/\n/g, "<br/>");
		return str;
	}
	
	function utils_validate(dzId) {
		var validateMrk = true;
		var result = {
			"data": [],
			"errors": {},
			"validateMrk": true
		};
		for (var i in dzId) {
			//	过程变量
			var data = {};
			var errors = {};
			var validtaMrk = true;
			var id = '#' + dzId[i] + " ";
			//	调用校验方法
			validateMrk = this.radioValidation(id, data, errors) ? validateMrk : false;
			validateMrk = this.checkboxValidation(id, data, errors) ? validateMrk : false;
			validateMrk = this.selectValidation(id, data, errors) ? validateMrk : false;
			validateMrk = this.textValidation(id, data, errors) ? validateMrk : false;
			validateMrk = this.numberValidation(id, data, errors) ? validateMrk : false;
			//	整理数据格式
			var dataArray = [];
			dataArray.push(data);
			
			var data1={'formId_':dzId[i],'data_':dataArray};//,'filter_':{}
			
			var errorsArray = [];
			errorsArray.push(errors);
			result.data.push(data1);
			result.errors[dzId[i]] = errorsArray;
		}
		result.validateMrk = validateMrk;
		//	返回结果
		return result;
	}


	this.numberValidation = function(id, data, errors) {
			var selector = id + "input[type='number']";
			var validateMrk = true;
			$(selector).each(function() {
				name = this.id;
				value = this.value;
				data[name] = value;
				var mustInput = $(this).attr('mustInput');
				if (!value && mustInput == '1') {
					var anError = {};
					anError['type'] = 'number';
					anError['desc'] = $(this).attr("desc");
					anError['errorMsg'] = $(this).attr("desc")+': '+'必输\n';
					errors[name] = anError;
					validateMrk = false;
				}
			}); //	TODO 目前number无校验，因为控件自带最大值和最小值参数
		return validateMrk;
	}
		/*
		 * 	校验radio
		 * 	若用户未勾选任一选项，data中 value为''，errors中包含详细信息。
		 *  'errors': [{"animal2":{"type":"radio","desc":"动物2","errorMsg":"必输"}}]
		 */
	this.radioValidation = function(id, data, errors) {
			var names = [];
			var validateMrk = true;
			selector = $(id).find("input[type=radio]:checked");
			$(selector).each(function() {
				if (names.indexOf(this.name) == -1) { //	names里面没有此 radio name， 需新增
					names.push(this.name);
					var mustInput = $(this).attr('mustInput');
					var name = this.name;
//					var value = $(this + ':checked[name=\"' + name + '\"]').attr('value'); //	相同name
					var value = $("input[name='"+name+"']:checked").val();//	相同name
					data[name] = (value) ? value : ""; //	全部存入data
					if (!value && (mustInput == "1")) { //	若未选value=undefined; mustInput='1'表示必须勾选，存入errors;

						var anError = {};
						anError['type'] = 'radio';
						anError['desc'] = $(this).attr("desc");
						anError['errorMsg'] = $(this).attr("desc")+': '+'必输\n';
						errors[name] = anError;
						validateMrk = false;
						//	valid.allErrorMsg += (anError['errorMsg'] + '\n');
					}
				}
			});
			return validateMrk;
		}
		/*
		 * 	checkbox校验
		 */

	this.checkboxValidation = function(id, data, errors) {
		var validateMrk = true;
		var checkboxs=$(id).find("input[type=checkbox]:checked");
		if(checkboxs.length>0){
			var name=$(checkboxs[0]).attr('name');
			data[name]=[];
			$.each(checkboxs,function(i,ele){
				data[name][i]=$(ele).attr('value');
			});
		}
		
		
		return validateMrk;
	}

	this.selectValidation = function(id, data, errors){
		var selector = id + 'select';
		var desc = this.desc;
		var validateMrk = true;
		$(selector).each(function() {
			name = this.name;
			desc = $(this).attr("desc");
			mustInput = $(this).attr("mustInput");
			$(this).find(':selected').each(function() {
				if (this.value == "" && mustInput == '1') { // ''表示用户未改变select选项卡，存入errors

					var anError = {};
					anError['type'] = 'select';
					anError['desc'] = desc;
					anError['errorMsg'] = desc+': '+'必输\n';
					errors[name] = anError;
					validateMrk = false;
				}
				data[name] = this.value;
			});
		});
		return validateMrk;
	}
	/*
	 *   判断是否满足输入要求： 一、字符类型（正则），二、数值大小OR字符长度
	 */
	this.textValidation = function(id, data, errors){
		var validateMrk = true;
		var passCheck = false;
		var reg = {
			"NUMBER": {
				"REG": "^[1-9]\d*\.?\d*|0\.\d*[1-9]\d*$",
				"MSG": "必须是数值"
			}, //	数字类型匹配正则，含小数
			"ALLSTRING": {
				"REG": "^.*$",
				"MSG": "必须是字符"
			}, //	换行，行结束符除外的所有字符
			"STRING": {
				"REG": "^[0-9A-Za-z-\u2E80-\uFE4F]*$",
				"MSG": "不能包含符号"
			}, // 	不包含符号的字符：中文、数字、字母
			"CN": {
				"REG": "\u2E80-\uFE4F",
				"MSG": "必须是中文字符"
			}, //	中文字符
			"EN": {
				"REG": "^[A-Za-z]*$",
				"MSG": "必须是英文字符"
			}, //	英文字符
			"EMAIL": {
				"REG": "^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$",
				"MSG": "邮箱"
			},  //	电子邮箱
			"MOBILE": {
				"REG": "^1(3[0-9]|5[0-35-9]|8[0235-9])\\d{8}$",
				"MSG": "手机号码"
			} , //	手机号码
			"DATE": {
				"REG": "/^(\d{4})-(\d{2})-(\d{2})$/",
				"MSG": "日期格式非法"
			},  //日期格式
			"IDCARD": {
				"REG": "/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/",
				"MSG": "日期格式非法"
			}
		}

		check($(id + "input[type='text']"));
		check($(id + "input[type='password']"));
		check($(id + "input[type='hidden']"));
		check($(id + "textarea"));

		function check(selector) {
			selector.each(function(i) {
				var name = this.id;
//				var value = $(this).attr('value');
				var value = this.value;
				data[name] = value; //	不管是否错误存入data;
				//				console.log(value);
				var max = parseFloat($(this).attr('max'));
				var min = parseFloat($(this).attr('min'));
				var checkType = $(this).attr('checkType');
				var mustInput = $(this).attr("mustInput");
				var anError = {};
				var desc =  $(this).attr('desc');
				if (mustInput == '1' && value.trim() == '') { //	检验到错误,存入errors
					if (selector[i].getAttribute("type") == "text") { //	判断是text控件还是textarea控件
						anError['type'] = "text";
					} else if (selector[i].getAttribute("type") == "password") {
						anError['type'] = "password";
					} else if (selector[i].getAttribute("type") == "hidden") {
						anError['type'] = "hidden";
					} else {
						anError['type'] = "textarea";
					}
					anError['desc'] = desc;
					anError['errorMsg'] = desc+': '+'必输\n';
					errors[name] = anError;
					validateMrk = false;							// 输入值为空 且需要检验，提示  必输
				} 
				if(value) {
					if (checkType) {
						console.log(checkType);
						var passCheck = new RegExp(reg[checkType]['REG']).test(value.toString()); // 正则校验 
						//校验不通过，提示为什么不通过
						if (!passCheck) {
							anError['desc'] =  desc;
							anError['errorMsg'] = desc+': '+reg[checkType]['MSG'];
							errors[name] = anError;
							validateMrk = false;					// 正则校验不通过， 提示  输入类型要求
							
						} else {
							if ($(this).attr('checkType') == 'NUMBER') {
								if ((max && parseFloat(value) > max) || (min && parseFloat(value) < min)) {
									anError['desc'] = desc;
									anError['errorMsg'] = desc+': '+'值范围为' + min + "~" + max+'\n';
									errors[name] = anError;
									validateMrk = false;			// 数值大小不符合要求
								}
							} else {
								if ((max && value.length > max) || (min && value.length < min)) {
									anError['desc'] = desc;
									anError['errorMsg'] = desc+': '+'长度为' + min + "~" + max+'\n';
									errors[name] = anError;
									validateMrk = false;			// 字符长度不符合要求
								} 
							}
						}
					} else {
						console.log("No CheckType defined -------- name:"+name+"--value:"+value);
					}
				}
			});
		}
		return validateMrk;
	}

	//向后台发送数据
	//dzId:数组，目前暂时传[]
	//action:请求后台的哪个类，即spring注册的id
	//method：请求后台的哪个方法
	//custData：自定义json业务数据
	//successCB:成功回调函数
	//errorCB：错误回调函数
	//loadingMrk：是否显示数据加载层 true:显示 false：隐藏
	function utils_ajax(dzId, action, method, custData, successCB, errorCB,loadingMrk) {
		if(loadingMrk){
			_this.popMsg("数据加载中...",1,10);
		}
		var t1 = new Date();
		//	
		var errorMsg, validateResult;
		var submitMrk = true;
		if (dzId[0]) {
			errorMsg = '';
			try{
				validateResult = utils.validate(dzId);
				submitMrk = validateResult.validateMrk;
				if (!validateResult.validateMrk){
					alert("参数传递错误");return;
				}
			}catch(e){
				alert(e.message);
			}
		}
		if (submitMrk) {
			var param = {
				'bizData_': validateResult ? validateResult.data :[],
//				'filterData_':{},
				'custData_': custData
			};
			console.log(JSON.stringify(param));
//			mui.ajax(utils.APP_URL_ + '/ActionControl?RequestJsonData_=' + encodeURIComponent(encodeURIComponent(utils.replaceStr(utils.jsonToString(param)))), {
			mui.ajax(utils.APP_URL_ + '/ActionControl', {
				data: {
					'ServiceName_': action,
					'ServiceMethod_': method,
					'RequestJsonData_':encodeURIComponent(encodeURIComponent(utils.replaceStr(utils.jsonToString(param))))
				},
				dataType: 'jsonp', //服务器返回json格式数据
//				async:false,//同步调用false，异步调用true
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					layer.close(_this.layerIndex);
					//将json字符串转换成json变量
					data = eval('(' + data + ')');
					//权限判断,需要登录的直接跳转到登陆
					if ('please login first' == data.AuthPermissionError_) {
						mui.toast('请先登陆');
						//跳转到登陆页面
						//					setTimeout(function () {
						var currentUrl = location.pathname;
						console.log(currentUrl);
						currentUrl = currentUrl.substring(0, currentUrl.indexOf('www') + 3);
						currentUrl = currentUrl + "/html/mine/login.html";
						console.log(currentUrl);
						plus.webview.create(currentUrl, currentUrl).show('slide-in-right', 150);
						//					},1000);
						return false;
					}
					//没有访问权限的提示
					if ('no access permission' == data.AuthPermissionError_) {
						mui.toast('无权访问');
						return false;
					}
					
					//回填业务数据
					if(data.BizJsonData_){
						for(var t in data.BizJsonData_){
							var dz = $("#"+data.BizJsonData_[t].formId_);
							for(var x in data.BizJsonData_[t].data_.rows){
								for(var key in data.BizJsonData_[t].data_.rows[x]){
									var obj = dz.find("#"+key);
									if(obj[0]){//如果通过id能获取到就直接给值
										obj.val(data.BizJsonData_[t].data_.rows[x][key]);
									}else{
										//通过id获取不到就可能是radio或者checkbox
										dz.find("[name='"+key+"']"+"[value='"+data.BizJsonData_[t].data_.rows[x][key]+"']").attr('checked',true);
									}
								}
							}
						}
						
//						for(var key in data.ResultBizData_){
//							var obj = $("#"+key);
//							if(obj[0]){//如果通过id能获取到就直接给值
//								$("#"+key).val(data.ResultBizData_[key]);
//							}else{
//								//通过id获取不到就可能是radio或者checkbox
//								$("[name='"+key+"']"+"[value='"+data.ResultBizData_[key]+"']").attr('checked',true);
//							}
//						}
					}
					//ResponseStatus_ 后台返回的成功失败标志
					//ResultBizData_ dzId对应的数据区域块
					//CustJsonData_ 自定义返回的json数据
					//				console.log('请求后台耗费时间 ：'+(new Date().getTime()-t1.getTime()));
					successCB(data.ResponseStatus_, data.BizJsonData_, data.CustJsonData_);
				},
				error: function(xhr, type, errorThrown) {
					//_this.hideTips();
					layer.close(_this.layerIndex);
					//				console.log(utils.replaceStr(utils.jsonToString(param)));
					//异常处理；
					if(type=='timeout')
						mui.toast("连接超时，请重试");
					console.log(type);
					errorCB(xhr, type, errorThrown);
				}
			});
		}
	}


	function utils_stringToJson(obj) {
		return eval('(' + obj + ')');
	}

	function utils_jsonToString(obj) {
		var THIS = this;
		switch (typeof(obj)) {
			case 'string':
				return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
			case 'array':
				return '[' + obj.map(THIS.jsonToString).join(',') + ']';
			case 'object':
				if (obj instanceof Array) {
					var strArr = [];
					var len = obj.length;
					for (var i = 0; i < len; i++) {
						strArr.push(THIS.jsonToString(obj[i]));
					}
					return '[' + strArr.join(',') + ']';
				} else if (obj == null) {
					return 'null';

				} else {
					var string = [];
					for (var property in obj) string.push(THIS.jsonToString(property) + ':' + THIS.jsonToString(obj[property]));
					return '{' + string.join(',') + '}';
				}
			case 'number':
				return obj;
			case false:
				return obj;
		}
	}
}
var utils = new UTILS();
//重写mui.back方法
try{
	var old_back = mui.back;
	mui.back = function() {
	//	var wvs=plus.webview.all();
		//获取父窗口的子页面
		var children = plus.webview.currentWebview().children();
		if(children.length>0){
			var child = children[0];
			//判断子页面是否可以回退
			child.canBack(function(e) {
				if (e.canBack) { //若可以回退，则调用回退
					child.back();
				} else { //若不可以回退，则执行默认的mui.bakc方法
					old_back();
				}
			});
		}else{
			old_back();
		}
	}
	
}catch(e){}

