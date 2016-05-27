window.imChat=window.imChat|| {
	/**
     * 初始化容联云通讯 (登录，回调（登录成功，登录失败，获取到消息）)
     * @param userId				当前用户的用户id
     * @param options				json参数
     * @param		succFn			成功回调
     * @param		fail			失败回调
     * @param		error			获取令牌失败
     * @param       noticeReceiver	群组通知事件
     */
	userId:'',
	_onMsgReceiveListener : null,
    _noticeReceiveListener : null,
    _onConnectStateChangeLisenter : null,
	login:function(userId,options){
		var _this = this;
		_this.userId = userId;
		var _url=utils.APP_URL_+"/servlet/YuntongxunServlet";
		var timeStamp = imChat.getTimeStamp();
    	$.ajax({
         	type: "post",
         	url:_url,
             data: {
             	userId:userId,
             	timestamp:timeStamp
             },
             success: function(data){
			 	token=data;
			 	var resp = RL_YTX.init(utils.YTX_APPID_); 
				if(102 == resp.code){
					//缺少必要参数
					mui.toast("缺少参数");
					//用户逻辑处理
				}else if(101 == resp.code){
					//不支持HTML5，关闭页面
					mui.toast("不支持html5");
					//用户逻辑处理
				}else if(200 == resp.code){
					//账号登录参数设置,用户登录名和sig之间的两个逗号中间添加一个空的字符串
					//var loginBuilder = new RL_YTX.LoginBuilder(1,userId,"",token,timeStamp);
					var loginBuilder = new RL_YTX.LoginBuilder();
					loginBuilder.setType(1);//登录类型 1账号登录，3voip账号密码登录
					loginBuilder.setUserName(userId);//设置用户名
					loginBuilder.setPwd();//type值为1时，密码可以不赋值
					loginBuilder.setSig(token);//设置sig
					loginBuilder.setTimestamp(timeStamp);//设置时间戳
					
					//注意：sig字段又用户请求自己的服务器生成，sig规则：MD5(appid+userName+timestamp+apptoken); 当voip账号密码登录时，可以不传sig
					//执行用户登录
					RL_YTX.login(loginBuilder, function(obj){
						//imChat.EV_getGroupList();					
						if(options.succFn){
							options.succFn(obj);
						}
						//登录成功回调
						imChat._onMsgReceiveListener = RL_YTX.onMsgReceiveListener(function(obj){
							//被引用的页面需提供 EV_onMsgReceiveListener(obj)函数 
							//EV_onMsgReceiveListener(obj);
							//收到消息之后的业务回调
							onMsgReceiveListener(obj);
							//TODO:CHAT 将消息存储到chatUtils里面
						});
						//注册群组通知事件监听
						imChat._noticeReceiveListener = RL_YTX.onNoticeReceiveListener(function(obj){
							//收到群组通知
							//被引用的页面需提供 EV_noticeReceiveListener(obj)函数 
							noticeReceiveListener(obj); 
							//options.noticeReceiver(obj);
						});
						 //服务器连接状态变更时的监听
						imChat._onConnectStateChangeLisenter = RL_YTX.onConnectStateChangeLisenter(function(obj){
	                        //obj.code;//变更状态 1 断开连接 2 重练中 3 重练成功 4 被踢下线 5 断线需要人工重连
	                        if(1 == obj.code){
	                            console.log('onConnectStateChangeLisenter obj.code:'+ obj.msg);
	                            imChat.login(imChat.userId,options);
	                        }else if(2 == obj.code){
	                            //mui.toas('alert-warning', '网络状况不佳，正在试图重连服务器', 10*60*1000);
	                        	imChat.login(imChat.userId,options);
	                        }else if(3 == obj.code){
	                            //mui.toas('alert-success', '连接成功');
	                        }else if(4 == obj.code){
	                        	imChat.logout();
	                            //mui.toas(obj.msg);
	                        }else if(5 == obj.code){
	                            //mui.toast('alert-warning', '网络状况不佳，正在试图重连服务器');
	                        	imChat.login(imChat.userId,options);
	                        }else{
	                            console.log('onConnectStateChangeLisenter obj.code:'+ obj.msg);
	                        }
	                    });
					},function(obj){
						//登录失败方法回调					
						if(options.fail){
							options.fail(obj);
						}
					});
				}
			 },
			 error:function(){
				
			 	//mui.toast('登录失败,重新连接...');
			 	if(options.error){
			 		options.error();
			 	}
			 	return;
			 }
         });
	},
	
	
	//发送文本消息
	//options json参数
	//		reciever:		消息接受者，若为单聊则为对方的id，若为群组，则为群组id
	//		sendType: 		O表示通过订单号发送  F：免费	
	//		text			需要发送的消息文本
	//		contentBox		展现文字的容器
	//		orderId 		订单id
	//		sucFun 			成功回调
	//		errFun 			失败回调
	sendText:function(options){
		var sendType = "O";
		if(options.sendType){
			sendType = options.sendType;
		}
    	//新建消息体对象
		var obj = new RL_YTX.MsgBuilder();
		//设置自定义消息id
		obj.setId(Date.now());
		//假设页面存在一个id为file的<input type=”file”>元素 
		//获取图片或附件对象
//		var file = document.getElementById("file").files[0];
		//设置图片或附件对象
//		obj.setFile(file);
		//设置发送的文本内容
		obj.setText(options.text);
		//设置发送的消息类型1文本消息4 图片消息6 附件消息
		//发送非文本消息时，text字段将被忽略，发送文本消息时 file字段将被忽略
		obj.setType(1);
		//设置接收者
		obj.setReceiver(options.reciever);
		var  user = userUtils.getUser();
		//TODO:CHAT 需考虑orderId怎么传递过去yaos
		var domain = {
			sendUserId: (options.orderId==""?user.userId:options.orderId),
			iconUrl   : user.userIconUrl,
			userName  : user.userNme,
			role  	  : user.role,
			sendType  : sendType,
			orderId	  : options.orderId || ""
		};
		var json2Str = JSON.stringify(domain);
		obj.setDomain(json2Str);
			
		RL_YTX.sendMsg(obj, function(){
			var domainObj = JSON.parse(obj._domain);
			if(options.contentBox){
				var div = $("<div class='msg-item msg-item-self'>"+
					  	"	<img class='msg-user' src='"+domainObj.iconUrl+"' />"+
						"	<div class='msg-content'>"+
						"		<div class='msg-content-inner'>"+obj._text+"</div>"+
						"		<div class='msg-content-arrow'></div>"+
						"	</div>"+
						"	<div class='mui-item-clear'></div>"+
						"</div>"); 
				options.contentBox.append(div);
				options.contentBox.scrollTop(options.contentBox[0].scrollHeight);	
			}
			
			
			chatUtils.setChat(domain.sendUserId,domain.userName,domain.iconUrl,imChat.getDateFormat(Date.now()),obj._type,obj._text,options.orderId); 
			//发送消息成功
			 
			 if(options.sucFun){
			 	options.sucFun(obj);
			 }
		}, function(obj){//失败
		//发送消息失败
			

			if(options.errFun){
				options.errFun(obj);
			}
		}, function(sended, total){
			//发送图片或附件时的进度条
		}); 
	},
	
	
	//发送图片消息
	//options json参数
	//		reciever:消息接受者，若为单聊则为对方的id，若为群组，则为群组id
	//		sendType: O表示通过订单号发送  F：免费	
	//		text：图片的地址
	//		sucFun：成功回调
	//		errFun：失败回调
	
	sendImg:function(options){
		imChat.sendText(options);
	},
	
	
	//创建群组
	//options json参数
	//		nme:群组名称
	//		notice：群组公告
	//		sucFun：成功回调
	//		errFun：失败回调
	createGroup:function(options){
		//新建创建群组对象
		var obj = new RL_YTX.CreateGroupBuilder();
		//设置群组名称
		obj.setGroupName(options.nme);
		//设置群组公告
		obj. setDeclared(options.notice);
		// 设置群组类型，如：1临时群组（100人）//TODO:CHAT补全参数说明
		obj.setScope(1);
		// 设置群组验证权限，如：需要身份验证2//TODO:CHAT补全参数说明
		obj. setPermission(1);
		//设置为讨论组 该字段默认为2 表示群组，创建讨论组时设置为1
		obj.setTarget(2);
		//发送消息
		RL_YTX.createGroup(obj, function(obj){
			//获取新建群组id
			var groupId = obj.data;
			//更新页面
			
			if(options.sucFun){
				options.sucFun(obj);
			}
		}, function(obj){
			//创建群组失败
			
			if(options.errFun){
				options.errFun(obj);
			}
		});
	},
	
	
	//获取已加入的群组
	//options json参数
	//		sucFun：成功的回调 obj 数组集合，里面的对象见如下代码
	//		errFun：失败的回调
	getGoupList:function(options){
		var obj = new RL_YTX.GetGroupListBuilder();
        obj.setPageSize(1000);
        RL_YTX.getGroupList(obj, function(obj){
        	
        	 if(options.sucFun){
            	options.sucFun(obj);
            }
        }, function(obj){
            alert("error code: "+ obj.code);
            
            if(options.errFun){
            	options.errFun(obj);	
            }
        });
	},
	/**
     * 踢出群组
     * @param groupId	群组id
     * @param memberId	成员id
     * @param sucFun	成功回调
     * @param errFun	失败回调
     * @constructor
     */
    deleteGroupMember : function(groupId, memberId,sucFun,errFun){
        console.log("delete group member groupId:["+groupId+"],memberId:["+memberId+"]");
        var builder = new RL_YTX.DeleteGroupMemberBuilder(groupId,memberId);
        RL_YTX.deleteGroupMember(builder, function(){
            
            if(options.sucFun){
            	options.sucFun(obj);	
            }

        },function(obj){
        	
        	if(options.errFun){
            	options.errFun(obj);	
            }

        });
    },
    /**
     * 解散群组
     * @param groupId	群组id
     * @param sucFn		成功回调
     * @param errFn		失败回调
     * @constructor
     */
    dismissGroup : function(groupId,sucFn,errFn){
        var obj = new RL_YTX.DismissGroupBuilder();
        obj.setGroupId(groupId);
        RL_YTX.dismissGroup(obj, function(){
        	
        	if(sucFn){
        		sucFn();
        	}
            //将群组从列表中移除
        }, function(obj){
        	
        	if(errFn){
        		errFn();
        	}
        });
    },
    /**
     * 退出群组
     * @param options
     * 		groupId				群组id
     * 		options.sucFn		成功回调
     * 		options.errFn		失败回调
     */
    quitGroup : function(options){
        console.log('quit Group...');
        var obj = new RL_YTX.QuitGroupBuilder();
        obj.setGroupId(options.groupId);
        RL_YTX.quitGroup(obj, function(){
            console.log('quit Group SUCC...');
            //将群组从列表中移除
             
            if(options.sucFn){
            	options.sucFn();
            }
        }, function(obj){
        	
        	if(options.errFn){
            	options.errFn();
            }
        });
    },
    /**
     * 事件，获取群组详情
     * @param groupId 	群组id
     * @param sucFn 	成功回调
     * @param errFn 	失败回调
     * @constructor
     */
    getGroupDetail : function(groupId,sucFn,errFn){
        var obj = new RL_YTX.GetGroupDetailBuilder();
        obj.setGroupId(groupId);
        RL_YTX.getGroupDetail(obj, function(obj){
           
            if(options.sucFn){
            	options.sucFn(obj);
            }
        }, function(obj){
        	
        	if(options.errFn){
            	options.errFn(obj);
            }
        });
    },
    /**
     * 事件，获取群组成员列表
     * @param options 		json
     * 		  	groupId 	群组id
     *		  	sucFn	  	成功回调
     *  	  	errFn	  	失败回调
     */
    getGroupMemberList : function(options){
        console.log('get Group Member List...');
        var obj = new RL_YTX.GetGroupMemberListBuilder();
        obj.setGroupId(options.groupId);
        obj.setPageSize(2000);

        RL_YTX.getGroupMemberList(obj, function(obj){
            console.log('get Group Member List SUCC...');
           
            if(options.sucFn){
            	options.sucFn(obj);
            }
        }, function(obj){
        	
        	if(options.errFn){
            	options.errFn(obj);
            }
        });
    },
    /**
     * 获取个人信息
     * @param options 		json
     *		  	sucFn	  	成功回调
     *  	  	errFn	  	失败回调
     */
    getMyInfo:function(options){
    	RL_YTX.getMyInfo(function(obj){
    	    //获取用户名
    		
    		if(options.sucFn){
            	options.sucFn(obj);
            }
    	}, function(obj){
    		
    		if(options.errFn){
            	options.errFn(obj);
            }
    	});
    },
    /**
     * 设置个人信息
     * @param options 		json
     * 			nickName	昵称
     *		  	sucFn	  	成功回调
     *  	  	errFn	  	失败回调
     */
    uploadPersonInfo:function(options){
    	var uploadPersonInfoBuilder = new RL_YTX.UploadPersonInfoBuilder();
    	uploadPersonInfoBuilder.setNickName(options.nickName);
    	/*uploadPersonInfoBuilder.setSex(1);
    	uploadPersonInfoBuilder.setBirth('1990-01-01');
    	uploadPersonInfoBuilder.setSign('个性签名');*/
    	RL_YTX.uploadPerfonInfo(uploadPersonInfoBuilder, function(obj){
    		//设置成功
    		
    		if(options.sucFn){
    			options.sucFn(obj);
    		}
    	}, function(resp){
    	    //设置失败
    	
    		if(options.errFn){
    			options.errFn(obj);
    		}
    	});
    },
    
	/**邀请用户加入到群组
	  *options json参数
	  *		groupId ：群组id
	  *		memberArr:用户id数组
	  *		confirm：是否需要对象确认（1不需要直接加入，2需要）
	  *		sucFun：成功回调
	  *		errFun：失败回调
	  */
	inviteGroupMember:function(options){
		if(options.memberArr.length>50){
            alert("邀请用户过多！");return ;
        }
        var builders = new RL_YTX.InviteJoinGroupBuilder();
        builders.setGroupId(options.groupId);
		builders.setMembers(options.memberArr);
		//是否需要对方确认（1不需要直接加入，2需要）
		builders.setConfirm(options.confirm);
        RL_YTX.inviteJoinGroup(builders,function(){
           	if(options.confirm == 1){ 
           		if(options.sucFun){
           			options.sucFun();
           		}
            } 
        },function(obj){
        	//alert("invite member error:"+obj.code);
        	
        	if(options.errFun){
           		options.errFun();
           	}
        });
	},
	/**
     * 修改群信息
     * @param options json
     * 		groupId		群组id
     * 		groupName	群组名称
     * 		declared 	群组描述
     * 		sucFn		成功回调
     * 		errFn		失败回调
     */
	updateGroupInfo:function(options){
        var builder = new RL_YTX.ModifyGroupBuilder(options.groupId,options.groupName,null,null,null,null,options.declared);
        RL_YTX.modifyGroup(builder, function(){
            console.log("update group info suc");
           
            if(options.sucFn){
           		options.sucFn();
           	}
        },function(obj){
        	
        	if(options.errFn){
           		options.errFn();
           	}
        });
        
        
    },
	//登出
	logout:function(){
		//销毁PUSH监听
		imChat._onMsgReceiveListener = null;
        
		//销毁注册群组通知事件监听
		imChat._noticeReceiveListener = null;
        
		//服务器连接状态变更时的监听
		imChat._onConnectStateChangeLisenter = null;
		
		RL_YTX.logout(function(){
			//登出成功处理
		}, function(obj){
			//登出失败处理
		});
	},
	//private方法
	//获取当前时间的时间戳
	getTimeStamp:function() {
         var now = new Date(),
         currentYear = now.getFullYear(),
         currentMonth = "",
         currentDay = "",
         currentHour = "",
         currentMinutes = "",
         currentSeconds = "";
         if((now.getMonth() + 1) >= 10){
         	currentMonth = now.getMonth() + 1;
         }else{
         	currentMonth = "0" + (now.getMonth() + 1);
         }
         
        if(now.getDate() >= 10){
			currentDay = now.getDate();
        }else{
        	currentDay = "0" + now.getDate();
        }
 		
 		if(now.getHours() >= 10){
			currentHour = now.getHours();
        }else{
        	currentHour ="0" + now.getHours();
        }
        if(now.getMinutes() >= 10){
			currentMinutes = now.getMinutes();
        }else{
        	currentMinutes = "0" + now.getMinutes();
        }
        if(now.getSeconds() >= 10){
			currentSeconds = now.getSeconds();
        }else{
        	currentSeconds = "0" + now.getSeconds();
        }
         
        return currentYear + currentMonth + currentDay + currentHour + currentMinutes + currentSeconds;
     },
     /**
      * 初始化发送图片按钮
      * options
      * 	userIcon 		当然用户头像
      * 	maxWidth		图片最大宽度
      * 	contentBox 		展示图片的容器
      * 	sucFun			成功回调
      */
     initSendImgBtn:function(options){
    	var _this = this;
 		var uploadFile = $("<input type='file'>");
 		uploadFile.attr("accept", "image/*");
 		uploadFile.change(function(){
 			var file = this.files[0];
 			window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
 			var url = window.URL.createObjectURL(file);
 			//这里我们判断下类型如果不是图片就返回 去掉就可以上传任意文件
 			if(!/image\/\w+/.test(file.type)){
 				alert("图片格式不正确，请选择正确格式的图片文件！");
 				return false;
 			}else{
 				var preImg = new Image();
 				preImg.src = window.URL.createObjectURL(file);	
 				//图片预览
            	var dom =$("<div class='msg-item msg-item-self' style='position: relative;'>"+
					"		<img class='msg-user' src='"+options.userIcon+"'/>"+
					"		<div class='msg-content' style='opacity:0.2;'>"+
					"			<div class='msg-content-inner'>"+
					"				<div style='position:relative;width:100px;'>"+
					"					<img class='msg-content-image' src='"+url+"' data-preview-src='' data-preview-group='1' style='width: 100px;border:none;'/>"+
					"				</div>"+
					"			</div>"+
					"			<div class='msg-content-arrow'></div>"+
					"		</div>"+
					"		<div class='mui-item-clear'></div>"+
					"	<span class='mui-icon mui-icon-spinner-cycle mui-spin' style='position: absolute;top:50%;right:100px;margin-top:-20px'></span>"+
            		"</div>");
 				preImg.onload = function(){
 					options.contentBox.append(dom);
 	            	options.contentBox.scrollTop(options.contentBox[0].scrollHeight);
 				};
 				var fileReader = new FileReader();
 				fileReader.onprogress = function(e) {
 					console.log((e.loaded / e.total * 100).toFixed() + "%");
 				};
 				fileReader.onload = function(e) {
 					lrz(file).then(function (rst) {
 						if(!rst.base64)return;
 						//默认最大高度200px
 						var maxW = options.maxWidth || 150,
 						img = new Image();
 						img.onload = function(){ 
 							var dataURL = _this.compress(img);
 							_this.uploadQiNiu(dataURL.substring(dataURL.indexOf(',') + 1),function(iconURL){
 								
 								if(options.sucFun){
 									options.sucFun(iconURL);
 								}
 							});
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
     },
     compress : function(img) {
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
     
     /**
      * 上传图片到七牛
      * 	dataURL		图片base64
      * 	callback	成功回调
      */
     uploadQiNiu:function(dataURL,callback) {
		utils.ajax([],'qiniuAction','getUpToken',{'scene':'chatdata'},function(mrk,bd,cd){
			//准备上传
			var url = "http://up.qiniu.com/putb64/-1/key/"+base64encode(utf16to8("usericon_"+utils.generateUUID()+".jpg"));
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-Type", "MIME");
			xhr.setRequestHeader("Authorization", "UpToken "+cd.upToken);//获取上传token令牌
			xhr.setRequestHeader("Cache-Control", "no-store");
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					//云端文件名字 
					var iconUrl = utils.QINIU_URL_CHAT+utils.stringToJson(xhr.responseText).key;
					
					if(callback){
						callback(iconUrl);
					}
				}
			};
			xhr.send(dataURL);
		},function(){});
     },
     /**
      * 获取IM聊天会话列表缓存
      * options:
      * 	selector	装载聊天记录的容器id
      * 	msgTyle		消息类型 (可选，默认提取所有)
      * 	sucFn		成功回调
      */
     getLocationCache:function(options){
    	var _this = this,chatList = chatUtils.getChatList();
		if(chatList){
			if(chatList.length>0){
				for(var i in chatList){
					//如果消息类型为空则提取所有消息
					if(!options.msgTyle){
						_this.getMsgList(options,chatList[i]);
					}else{
						//根据消息类型提取相应类型的消息
						if(chatList[i].sendType==options.msgTyle){
							_this.getMsgList(options,chatList[i]);
						}
					}
				}
			}
		}
     },
     getMsgList:function(options,obj){
		if(imChat.checkImgExists( obj.msg)){ obj.msg="[图片]";}
		options.selector.sessionList.html("");
		var unReadMsgNum=chatUtils.getUnReadMsgNum(obj.roomId);
		var li = $(	"<li class='mui-table-view-cell mui-media'>																				"+
					"	<div class='mui-slider-right mui-disabled'>																			"+
					"   	<a class='mui-btn mui-btn-red'>删除</a>																			"+
					"   </div>																												"+
					"	<div class='mui-slider-handle'>																						"+
				    "		<img class='mui-media-object mui-media-large mui-pull-left' src='"+obj.targetHead+"' />							"+
				   	"		<div class='mui-media-body'>																					"+
				   	"			<div>																										"+
				   	"				<span>"+obj.targetNme+"11</span>																		"+
					"   			<span style='float: right;font-size:14px'>"+obj.sendTm+"</span>											"+
				    "			</div>																										"+
				    "			<p class='mui-ellipsis' style='padding-top: 8px;width: 80%;'>"+ obj.msg+"</p>								"+
				   	"		</div>																											"+
				   	"		<span class='mui-badge mui-badge-danger' style='position: absolute;right: 5%;top:70%;'>"+unReadMsgNum+"</span>	"+
				   	"	</div>"+		   	
					"</li>");
			li.attr({
				roomId		: obj.roomId,
				targetId	: obj.targetId,
				targetNme	: obj.targetNme,
				targetHead	: obj.targetHead,
				orderId		: obj.orderId,
				sendType	: obj.sendType
			});
			li.on('click',function(){
				//调出相对应的聊天室
				 
				if(options.sucFn){
					options.sucFn(this);
				}
			});
			li.children().eq(0).on("click",function(e){
				imChat.delHistory(this);
				return false;
			});
		if(unReadMsgNum==0){
			li.children('div').eq(1).children("span").eq(0).hide();
		}
		if(unReadMsgNum>99){
			li.children('div').eq(1).children('span').eq(0).html("99+");
		}
		options.selector.sessionList.append(li);
		
     },
     /**
      * 删除指定的会话记录
      */
     delHistory:function(o){
    	 var parentNode = $(o).parent();
    	 chatUtils.removeChatHistory(parentNode.attr("roomId"),function(){
    		 parentNode.remove();
    		 mui.toast("删除成功");
    	 });
    	 
     },
     /**
      * 调出对应对象的聊天记录
      * options
      * 	roomId 具体缓存对象的id
      *  	selector 装载聊天记录的容器id
      *  	orderId	 订单ID
      */
     getChatHistory : function(options){
		if(options.orderId){
			//如果orderId不为空则获取数据库聊天记录
			utils.ajax([],'txtImgChatAction','getChatMsg',{COrderId:options.orderId},function(mrk,bd,cd){
				imChat.displayChatHistory(cd.result,options);
			});
		}else{
			//从localStorage中获取聊天记录
			imChat.displayChatHistory(chatUtils.getChat(options.roomId),options);
		}
     },
     /**
      * 提取对象的聊天记录
      * @param chatHistoryList
      * @param options
      */
     displayChatHistory:function(chatHistoryList,options){
    	var _this = options.selector,
    		imgDiv = "";
 		if(!chatHistoryList || chatHistoryList.length<=0)return;
 		_this.msgBody.html('');
 		for(var i=0;i<chatHistoryList.length;i++){
 			var className=(chatHistoryList[i].userId==userUtils.getUser().userId?"msg-item  msg-item-self":"msg-item");
 			var div = $("<div class='"+className+"'>"+
 						"	<img class='msg-user' src='"+chatHistoryList[i].userHead+"'/>"+
 						"	<div class='msg-content'>"+
 						"		<div class='msg-content-inner'></div>"+
 						"		<div class='msg-content-arrow'></div>"+
 						"	</div>"+
 						"	<div class='mui-item-clear'></div>"+
 						"</div>");
 			if(chatHistoryList[i].type==4){
 				imgDiv=$('<img class="msg-content-image" src="'+chatHistoryList[i].msg+'" data-preview-src="" data-preview-group="1" style="max-width: 100px;"/>');
 				div.find("div.msg-content-inner").html(imgDiv);
 			}else if(chatHistoryList[i].type==1){
 				//判断发送是否为图片
 				if(imChat.checkImgExists(chatHistoryList[i].msg)){
 					imgDiv=$('<img class="msg-content-image" src="'+chatHistoryList[i].msg+'" data-preview-src="" data-preview-group="1"  style="max-width: 100px;"/>');
 					div.find("div.msg-content-inner").html(imgDiv);
 				}else{
 					div.find("div.msg-content-inner").html(chatHistoryList[i].msg);
 				}
 			}
 			_this.msgBody.append(div);
 			_this.msgBody.scrollTop(_this.msgBody[0].scrollHeight);  
 		}
     },
     /**
      * @param time 毫秒数
      * 将毫秒数转换成yyyy-MM-dd
      */
     getDateFormat:function(time){
    	 var newTime = new Date(Math.floor(time)); //就得到普通的时间了 
    	 var month	= newTime.getMonth()+1;
    	 if(month<10){
			month="0"+month;
    	 }
    	 return newTime.getFullYear()+"-"+month+"-"+newTime.getDate();
     },
     
     
     /**
      * 检测url是否为图片路径
      * @param imgurl 图片url地址
      */
     checkImgExists : function(imgurl){
      	if(imgurl.indexOf(utils.QINIU_URL_CHAT)!=-1)
      		return true;
      	else
      		return false;
	 },
	
    /**
     * 监听聊天窗口消息
     * @param options
     * 		msgbox 		装载消息的容器
     * 		roomId		当前房间号
     */
    listenChatMsg:function(options){
    	$.unsubscribe("/listenChatMsg"); 
		//更新窗口聊天记录
		$.subscribe("/listenChatMsg", function (e,obj) {
			var domainObj = JSON.parse(obj.msgDomain),
			imgDiv = "";
			//如果打开的聊天窗口是目标消息窗口
			if(domainObj.sendUserId == options.roomId){
				var div = $("<div class='msg-item'>"+
				  	"	<img class='msg-user' src='"+domainObj.iconUrl+"' />"+
					"	<div class='msg-content'>"+
					"		<div class='msg-content-inner'></div>"+
					"		<div class='msg-content-arrow'></div>"+
					"	</div>"+
					"	<div class='mui-item-clear'></div>"+
					"</div>"); 
				if(obj.msgType=="4"){
					imgDiv=$("<img class='msg-content-image' src='"+obj.msgContent+"' data-preview-src='' data-preview-group='1' style='max-width: 100px;'/>");
					div.find("div.msg-content-inner").html(imgDiv);
				}else if(obj.msgType=="1"){
					//判断发送是否为图片
					if(imChat.checkImgExists(obj.msgContent)){
						imgDiv=$("<img class='msg-content-image' src='"+obj.msgContent+"'  data-preview-src='' data-preview-group='1' style='max-width: 100px;'/>");
						div.find("div.msg-content-inner").html(imgDiv);
						var newImg = new Image();
						newImg.src = obj.msgContent;
						newImg.onload = function(){
							options.msgbox.append(div);
							options.msgbox.scrollTop(options.msgbox[0].scrollHeight);
						};
					}else{
						div.find("div.msg-content-inner").html(obj.msgContent);
						options.msgbox.append(div);
						options.msgbox.scrollTop(options.msgbox[0].scrollHeight);
					}
				} 
				
			}else{
				//如果不是目标聊天窗口则去更新相应聊天会话的状态
				var liLen = $("#sessionList").children();
				for(var i=0; i<liLen.length;i++){
					var $li=$(liLen[i]);
		            var childs=$li.children();
					if($li.attr('roomId') == domainObj.sendUserId){
	            		var num=childs.eq(2).html();
	                    var unReadMsg=Math.ceil(num)+1;
	                    if(unReadMsg>99){
	                        unReadMsg="99";
	                    }
	                    childs.eq(2).show().html(unReadMsg);
						
	            	}	
				}
			}
		}); 
    },
    /**
     * 监听会话列表消息
     * @param options
     * 		sessionList 会话列表容器
     * 		callback	成功回调
     */
    listenSessionMsg:function(options){
    	var flag = false;
    	$.unsubscribe("/listenSessionMsg");
		//更新会话列表
		$.subscribe("/listenSessionMsg", function (e,obj) {
			//获取当前聊天窗口是属于哪个会话
			var domain = JSON.parse(obj.msgDomain),
				unReadMsg = 0,
				num = "";
			var text  = imChat.checkImgExists(obj.msgContent)==true?"[图片]":obj.msgContent;
			var liLen = options.sessionList.children();
			//判断是否有会话记录
            for(var i=0;i < liLen.length; i++){
                var $li=$(liLen[i]);
                var childs=$li.children();
                if($li.attr('roomId') == domain.sendUserId){
            		//判断当前聊天窗口是否打开且聊天窗口是不是当前消息对象的聊天窗口
                	if($("#talkPageDiv").length<1){
	                    num=childs.eq(2).html();
	                    unReadMsg=parseInt(num)+1;
	                    if(unReadMsg>99){
	                        unReadMsg="99";
	                    }
	                    childs.eq(2).show().html(unReadMsg);
                	}
                	childs.eq(1).children().eq(1).html(text);
                	flag = true;
                	break;
                	
            	}else if(!$li.attr('orderId') && $li.attr('roomId')== domain.sendUserId){
            		//如果订单为空且发送者id等于目标id说明是免费消息
            		if($("#talkPageDiv").length<1){
	                    num=childs.eq(2).html();
	                    unReadMsg=parseInt(num)+1;
	                    if(unReadMsg>99){
	                        unReadMsg="99+";
	                    }
	                    childs.eq(2).show().html(unReadMsg);
                	}
                	childs.eq(1).children().eq(1).html(text);
                	flag = true;
                	break;
            	}
            }
            //如果flag为false则会话列表中不存在此会话消息
            if(!flag){
            	//会话列表无会话
	        	var domainObj = JSON.parse(obj.msgDomain);
	        	//if is order message 
	        	if(domainObj.orderId)return;
	        	//如果是订单消息
	        	var title = "与 "+domainObj.userName+" 对话";
	        	if(domainObj.orderId && domainObj.role =="1"){
	        		title = "与 "+domainObj.userName+" 医生 对话";
	        	}
	        	var li = $(	"<li class='mui-table-view-cell mui-media'>"+
				   	"	<img class='mui-media-object mui-media-large mui-pull-left' src='"+domainObj.iconUrl+"' />						"+
				   	"	<div class='mui-media-body'>																					"+
				   	"		<div>																										"+
				   	"			<span>"+title+"</span>																		"+
					"   			<span style='float: right;'>																		"+
					"   				<pre style='color:#000;font-size:14px;font-weight:normal'>"+imChat.getDateFormat(obj.msgDateCreated)+"</pre>"+
					"   			</span>																								"+
				    "		</div>																										"+
				    "		<p class='mui-ellipsis' style='padding-top: 8px;width: 80%;'>"+text+"</p>									"+
				   	"	</div>																											"+
				   	"	<span class='mui-badge mui-badge-danger' style='position: absolute;right: 5%;top:70%;'>1</span>					"+
				   	"</li>");
				li.attr({
					//如果是订单消息，则以订单号作为房间id
					targetId	: obj.msgSender,
					targetNme	: domainObj.userName,
					roomId		: (domainObj.orderId==""?obj.msgSender:domainObj.orderId),
					targetHead	: domainObj.iconUrl,
					orderId		: domainObj.orderId,
					sendType	: domainObj.sendType
				});
				li.on('click',function(){
					//调出相对应的聊天室
					options.callback(this);
				});
				options.sessionList.append(li);
            }
		});
    },
   
    /**
     * 添加内容到群组列表中(friendsList.html用到)
     * @param options
     * 		groupId		群组id
     *		groupName	群组名称
     * 	 	isGroup		是否是群组
     * 		isCreate	是否为创建群组
     * 		owner		群组创建者
     * 		gIcon		群组头像(TODO 暂时设置为默认)
     * 		contentBox	存放新建群组的容器
     * 		noDataMsg	隐藏无群组的提示容器
     */
    addContactToList:function(options){
    	var li = $(	"<li class='mui-table-view-cell' id='im_contact_"+options.groupId+"' contact_type=''>			"+
				"	<div class='mui-slider-cell'>																	"+
				"		<div class='oa-contact-cell mui-table'>														"+
				"			<div class='oa-contact-avatar mui-table-cell'>											"+
				"				<img src='../../image/IMG_1725.PNG' />												"+
				"			</div>																					"+
				"			<div class='oa-contact-content mui-table-cell'>"+options.groupName+"</div>				"+
				"		</div>																						"+
				"	</div>																							"+
				"</li>");
    	li.attr({
    		targetId	: options.groupId,
    		targetNme 	: options.groupName,
    		owner 		: options.owner,
    		targetHead	: "../../image/IMG_1725.PNG",
    		sendType	: "G"
    	});
    	li.on('tap',function(e){
    		friendListObj.toChatHome(this);
    	});
    	options.noDataMsg.hide();
    	options.contentBox.append(li).show();
		//判断是否为新建群   true:新建  false:为拉取群列表
		if(options.isCreate){
			history.back();
		}
    	
    },
    /**
     * 跳转到聊天界面
     * this 页面js对象
     * o  	被调用的li对象
     */
    toChatHome:function(_this,o){
		var roomId		= $(o).attr("roomId");
		var sendType	= $(o).attr("sendType");
		var span 		= $(o).children("span");
		span.html("0").hide();
		//将未读标识设置为0且隐藏
		chatUtils.removeUnReadMsgNum(roomId);
		var json = {
			roomId		: roomId,
			targetId	: $(o).attr("targetId"),
			targetName	: $(o).attr("targetNme"),
			userIcon	: $(o).attr("targetHead"),
			sendType	: sendType,
			orderId		: $(o).attr("orderId"),
			creater		: $(o).attr("owner") || "",
			role		: _this.curRole,
			chatType	: (sendType=="G"?"more":"single")						
		};
		var _src="wx/page/sessionmsg/chatWindow.html?v="+Date.now();
		utils.openDivPage(_src,'talkPageDiv_Main','talkPageDiv_Main');
		//发布频道
		$.publish("/params",[json]); 
    },
    /**
     * 将消息保存到localStorage
     * @param obj			//消息对象
     * @param talkWindow	//聊天页面的dom
     */
    saveMsgToLocal:function(obj,talkWindow){
    	var domainObj = JSON.parse(obj.msgDomain);
     	var _time = imChat.getDateFormat(obj.msgDateCreated);
     	var initCacheObj = {
     		roomId		: (domainObj.orderId==""?obj.msgSender:domainObj.orderId),
     		targetId	: obj.msgSender,
     		targetNme	: domainObj.userName,
     		targetHeadUrl:domainObj.iconUrl,
     		sendType	: domainObj.sendType
     	};
     	chatUtils.init(initCacheObj);
    	chatUtils.setChat(obj.roomId,domainObj.userName,domainObj.iconUrl,_time,obj.msgType,obj.msgContent,domainObj.orderId);
    	//如果是处于聊天状态下未读消息不需存储
		if(talkWindow.length == 0){
    		chatUtils.setUnReadMsgNum(initCacheObj.roomId);
    	}
    	chatUtils.setMsgType(domainObj.sendType);
    }
    
};