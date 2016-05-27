var valObj={
	toValidate:function(arr){
		var result=true;
		//目前只针对一个表单提交
		var box=arr[0];
		var divId=document.getElementById(box);
		//input
		var inputs=$(divId).find('input');
		inputs.each(function(i,obj){
			var _this=$(obj);
			var textVal=obj.value;
			var required=_this.attr('required');
			if(required){
				if(!textVal){
					//空值处理
					_this.css({"background":"url('../../image/xinghao.svg') right center no-repeat","background-size":"20px 20px"});
					result=false;
				}
			}
			//email
			if(_this.attr('type')=="email"){
				//判断email是否为空
				if(_this.val()){
					if(!valObj.checkMail(_this.val())){
						result=false;
					}
				}
			}
			
		});
		//textarea
		$('textarea').each(function(i,ele){
			var _this=$(ele);
			var req=_this.attr('required');
			if(req){
				if(!ele.value){
					//空值处理
					_this.css({"background":"url('../../image/xinghao.svg') right center no-repeat","background-size":"20px 20px"});
					result=false;
				}
			}
		});
		return result;
	},
	//过滤特殊字符
	filterChar:function(textVal){
	    var pattern=/[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im;  
	    if(pattern.test(textVal)){  
	        return false;     
	    }     
	    return true;  
	},
	//验证email格式
	 checkMail:function(mail) {
	 	var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	 	if (filter.test(mail)){
	 		return true;
	 	}else{
	 		alert('您的电子邮件格式不正确');return false;
	 	}
	},
	validateTel:function(tel){
		 var pattern = /^0?1[3|4|5|8][0-9]\d{8}$/;
		 if (pattern.test(tel)) {
			return true;
		 }
		return false;
	},
	//监听文本框输入事件
	listerEvent:function(id){
		var domNode=document.getElementById(id);
		//type=text
		$(domNode).find('input[type=text]').each(function(i,ele){
			$(ele).on('input',function(e){
				var _this=$(this);
				//_this.css({"border":"1px solid #007AFF","background":"none"});
				var textVal=this.value;
				if(!valObj.filterChar(textVal)){
					_this.val(textVal.replace(/[\>\<]/ig,""));
				}
			});
		});
		
		//type=number
		$(domNode).find('input[type=number]').each(function(i,ele){
			var str="";
			$(ele).on('input',function(e){
				var _this=$(this);
				//_this.css({"border":"1px solid #007AFF","background":"none"});
				var textVal=this.value;
				if(/^\d+$/.test(textVal)){
					str=textVal;
				}else{
					_this.val(str);
					if(_this.val().length==1){
						_this.val('');
					}
				}
			});
		});
		
		//监听textarea的input事件
		$("textarea").each(function(i,ele){
			$(ele).on('input',function(e){
				var _this=$(this);
				//_this.css({"border":"1px solid #007AFF","background":"none"});
				var textVal=this.value;
				if(!valObj.filterChar(textVal)){
					_this.val(textVal.replace(/[\>\<]/ig,""));
				}
			});
		});
		//监听email的input事件
		$(domNode).find('input[type=email]').each(function(i,ele){
			$(ele).on('input',function(e){
				var _this=$(this);
				var textVal=this.value;
				if(!valObj.filterChar(textVal)){
					_this.val(textVal.replace(/[\>\<]/ig,""));
				}
			});
		});
	}	
}