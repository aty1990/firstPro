var chatUtils = {
	//单个聊天最大保存的聊天信息长度
	maxChatNum:50, 
	//会话列表最大长度
	maxChatListNum:50,
	targetId:'',
	init:function(param){
		chatUtils.targetId = param.roomId;
		try{
			var chartUserData = localStorage.getItem("chartUserData");
			var chartUserDataJson;
			if(chartUserData){
				chartUserDataJson = JSON.parse(chartUserData);
				var userData = chartUserDataJson[param.roomId];
				//存在该用户的基本信息
				if(userData){
					
				}else{
					chartUserDataJson[param.roomId]={"n":param.targetNme,"h":param.targetHeadUrl,'t':param.sendType,'u':param.targetId};
				}
			}else{
				chartUserDataJson={};
				chartUserDataJson[param.roomId]={"n":param.targetNme,"h":param.targetHeadUrl,'t':param.sendType,'u':param.targetId};
			}
			localStorage.setItem("chartUserData",JSON.stringify(chartUserDataJson));
		}catch(e){alert(e);}
	},
	
	//设置聊天记录
	setChat:function(msgOwnerId,msgOwnerNme,sendUserHead,sendTime,type,msg,orderId){
		var chatHistory = localStorage.getItem("chartHistory");
		var chatHistoryJson;
		//1、更新聊天记录
		if(chatHistory){
			chatHistoryJson = JSON.parse(chatHistory);
			var userChat = chatHistoryJson[chatUtils.targetId];
			//存在该targetId用户的聊天记录
			if(userChat){
				//已经是聊天存储的最大长度了
				if(userChat.length==chatUtils.maxChatNum){
					//删除最后一个元素，因为最后一个元素是距离现在时间最久的
					userChat.pop()
				}
				//将当前聊天记录拍在最前
				userChat.unshift({'u':msgOwnerId,'s':sendTime,'t':type,'m':msg,'o':orderId});
				
			}
			//存在聊天记录，但是不存在该targetId用户的聊天记录
			else{
				var charArray = new Array({'u':msgOwnerId,'s':sendTime,'t':type,'m':msg,'o':orderId});
				chatHistoryJson[chatUtils.targetId]=charArray;
			}
		}
		//连聊天的根节点都不存在
		else{
			chatHistoryJson={};
			chatHistoryJson[chatUtils.targetId]=new Array({'u':msgOwnerId,'s':sendTime,'t':type,'m':msg,'o':orderId});
			
		}
		localStorage.setItem("chartHistory",JSON.stringify(chatHistoryJson));
	
		//2、更新会话列表
		var chartListHistory = localStorage.getItem("chartListHistory");
		var chartListHistoryArray ;
		//存在历史会话列表
		if(chartListHistory){
			chartListHistoryArray=chartListHistory.split(',');
			if(chartListHistoryArray.indexOf(chatUtils.targetId)!=-1){
				chartListHistoryArray.splice(chartListHistoryArray.indexOf(chatUtils.targetId),1);
			}
			//将该聊天对象targetId放到数组的第一个
			chartListHistoryArray.unshift(chatUtils.targetId);
		}
		//不存在历史会话列表
		else{
			chartListHistoryArray = new Array(chatUtils.targetId);
		}
		localStorage.setItem("chartListHistory",chartListHistoryArray.toString());
		
		//3、更新chartUserData中的用户基本信息
		var chartUserData = localStorage.getItem("chartUserData");
		var chartUserDataJson;
		if(chartUserData){
			chartUserDataJson = JSON.parse(chartUserData);
			var userData = chartUserDataJson[msgOwnerId];
			//存在该用户的基本信息
			if(userData){
				
			}else{
				chartUserDataJson[msgOwnerId]={"n":msgOwnerNme,"h":sendUserHead};
			}
		}else{
			chartUserDataJson={};
			chartUserDataJson[msgOwnerId]={"n":msgOwnerNme,"h":sendUserHead};
		}
		localStorage.setItem("chartUserData",JSON.stringify(chartUserDataJson));
	},
	
	//获取会话列表
	getChatList:function(){
		var chartListHistory =localStorage.getItem("chartListHistory");
		var chartHistory = localStorage.getItem("chartHistory");
		var chartUserData = localStorage.getItem("chartUserData");
		var chartHistoryJson = JSON.parse(chartHistory);
		var chartUserDataJson = JSON.parse(chartUserData);
		if(chartListHistory){
			//TODO:如何将chartListHistory变成数组
			var chartListHistoryArray=chartListHistory.split(',');
			var chartList = new Array();
			for(var i in chartListHistoryArray){
				var roomId 		= chartListHistoryArray[i];
				var targetNme 	= chartUserDataJson[roomId]['n'];
				var targetHead 	= chartUserDataJson[roomId]['h'];
				var sendType 	= chartUserDataJson[roomId]['t'];
				var targetId 	= chartUserDataJson[roomId]['u'];
				
				var chat = chartHistoryJson[roomId][0];//最新的一条消息
				var sendUserInfo = chartUserDataJson[chat.u];//最新那条消息发送人的基本信息
				//最终返回的结果形式
				var msg = {'roomId':roomId,'targetNme':targetNme,'targetHead':targetHead,'sendType':sendType,'targetId':targetId,
							'sendUserId':chat['u'],'sendUserNme':sendUserInfo['n'],'sendUserHead':sendUserInfo['h'],
							'type':chat['t'],'msg':chat['m'],'sendTm':chat['s'],'orderId':chat['o']
					};
				chartList.push(msg);
			}
			return chartList;
		}
		//根节点都不存在直接返回null
		else{
			return null;
		}
	},
	//获取具体聊天对象的聊天记录
	getChat:function(targetId){
		var chartHistory = localStorage.getItem("chartHistory");
		var chartUserData = localStorage.getItem("chartUserData");
		var chartUserDataJson = JSON.parse(chartUserData);
		if(chartHistory){
			var chartHistoryJson = JSON.parse(chartHistory);
			if(chartHistoryJson[targetId]){
				var chatList = chartHistoryJson[targetId];
				var result = new Array();
				for(var i=chatList.length-1;i>=0;i--){
					var chat = chatList[i];
					var userId = chat.u;
					var type = chat.t;
					var sendTm=chat.s;
					var msg = chat.m;
					var orderId = chat.o;
					var userNme = chartUserDataJson[userId]['n'];
					var userHead = chartUserDataJson[userId]['h'];
					//最终返回的数据形式
					result.push({'userId':userId,'userNme':userNme,'userHead':userHead,'type':type,'msg':msg,'sendTm':sendTm,'orderId':orderId});
				}
				return result;
			}else{
				return null;
			}
		}else{
			return null;
		}
	},
	//移除对应目标对象的聊天记录
	removeChatHistory:function(targetId,callback){
		var chartHistory = localStorage.getItem("chartHistory");
		var chartUserData = localStorage.getItem("chartUserData");
		//获取用户集合
		var chartUserDataJson = JSON.parse(chartUserData);
		//将目标id的值设为空
		chartUserDataJson[targetId] = "" ;
		//删除目标id
		delete chartUserDataJson[targetId];
		if(chartHistory){
			//获取用户聊天记录的集合
			var chartHistoryJson = JSON.parse(chartHistory);
			if(chartHistoryJson[targetId]){
				//将目标id的值设为空
				chartHistoryJson[targetId]="";
				//删除目标id
				delete chartHistoryJson[targetId];
				//将用户集合重新存入本地缓存中
				localStorage.setItem("chartUserData",JSON.stringify(chartUserDataJson));
				//将用户聊天记录集合重新存入本地缓存中
				localStorage.setItem("chartHistory",JSON.stringify(chartHistoryJson));
				
				callback && callback();
			}else{
				return null;
			}
		}else{
			return null;
		}
	},
	//设置未读消息的数量
	setUnReadMsgNum:function(targetId){
		//获取未读消息对象
		var unReadMsgNum=localStorage.getItem('unReadMsgNum');
		//是否存在
		if(unReadMsgNum){
			//字符串转JSON
			var unReadMsgNumJson=JSON.parse(unReadMsgNum);
			//目标id是否存在对象的key中
			if(unReadMsgNumJson[targetId]){
				//存在是 value +1
				unReadMsgNumJson[targetId]=unReadMsgNumJson[targetId]+1;
			}else{
				//不存在就添加进去且初始值为1
				unReadMsgNumJson[targetId]=1;
			}
			//存入缓存
			localStorage.setItem('unReadMsgNum',JSON.stringify(unReadMsgNumJson));
		}else{
			//不存在就手动创建
			var unReadMsgNumJson={};
			//消息自动+1
			unReadMsgNumJson[targetId]=1;
			//存入缓存
			localStorage.setItem('unReadMsgNum',JSON.stringify(unReadMsgNumJson));
		}
		
	},
	//获取未读消息的数量
	getUnReadMsgNum:function(targetId){
		var unReadMsgNum=localStorage.getItem('unReadMsgNum');
		//是否存在
		if(unReadMsgNum){
			var unReadMsgNumJson=JSON.parse(unReadMsgNum);
			//targetId是否在对象的key里
			if(unReadMsgNumJson[targetId]){
				//在就返回value
				return unReadMsgNumJson[targetId];
			}else{
				//不存在表示没有新消息
				return 0;
			}
		}else{
			//表示没有新消息
			return 0;
		}
	},
	//移除未读消息标识
	removeUnReadMsgNum:function(targetId){
		var unReadMsgNum=localStorage.getItem('unReadMsgNum');
		if(unReadMsgNum){
			var unReadMsgNumJson=JSON.parse(unReadMsgNum);
			//判断key值是否存在
			if(unReadMsgNumJson[targetId]){
				//移除key
				delete unReadMsgNumJson[targetId];
				//存入缓存
				localStorage.setItem('unReadMsgNum',JSON.stringify(unReadMsgNumJson));
			}else{
				//不存在不做任何处理
			}
		}else{
			//对象根本不存在此次不需要做任何处理
		}
	},
	/**
	 * 消息类型
	 * @param type
	 */
	setMsgType:function(type){
		var typeObj = localStorage.getItem("typeObj");
		if(!typeObj){
			var json = {
				"O":(type=="O"?true:false),	//订单消息
				"F":(type=="F"?true:false)	//免费消息
			}
			localStorage.setItem('typeObj',JSON.stringify(json));
		}else{
			var json = JSON.parse(typeObj);
			if(type=="O"){
				json.O = true;
			}else if(type=="F"){
				json.F = true;
			}
			localStorage.setItem('typeObj',JSON.stringify(json));
		}
	}
};
