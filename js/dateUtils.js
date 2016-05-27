;(function($){
	var dateUtils ={
		defaultFormat:'yyyy-MM-dd',
        //获取指定时间的时间戳  YYYYMMddHHmmss
		getTimeStamp:function(dateObj){
            var timestamp = dateObj.getFullYear()+""
                + ((dateObj.getMonth() + 1) >= 10 ? (dateObj.getMonth() + 1) : "0" + (dateObj.getMonth() + 1))
                + (dateObj.getDate() >= 10 ? dateObj.getDate() : "0" + dateObj.getDate())
                + (dateObj.getHours() >= 10 ? dateObj.getHours() : "0" + dateObj.getHours())
                + (dateObj.getMinutes() >= 10 ? dateObj.getMinutes() : "0" + dateObj.getMinutes())
                + (dateObj.getSeconds() >= 10 ? dateObj.getSeconds() : "0" + dateObj.getSeconds());
            return timestamp;
        },
		//日期类型转换为字符串
		//format可选值：
		//					yyyy-MM-dd HH:mm:ss  
		//					yyyy-MM-dd HH:mm    
		//					yyyy/MM/dd HH:mm:ss   
		//					yyyy/MM/dd HH:mm     
		//					yyyy-MM-dd        
		//					yyyy/MM/dd
        //					yyyy-MM-dd
        //					MM-dd HH:mm
		//format若为空则使用defaultFormat
		date2String:function(date,format){
			var timestamp=dateUtils.getTimeStamp(date);
			var year=timestamp.slice(0,4);
			var month=timestamp.slice(4,6);
			var day=timestamp.slice(6,8);
			var hour=timestamp.slice(8,10);
			var minute=timestamp.slice(10,12);
			var second=timestamp.slice(12,14);
			var dateStr="";
			if(format){
				if(format=="yyyy-MM-dd HH:mm:ss"){
					dateStr=year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
				}else if(format=="yyyy-MM-dd HH:mm"){
					dateStr=year+"-"+month+"-"+day+" "+hour+":"+minute;
				}else if(format=="yyyy/MM/dd HH:mm:ss"){
					dateStr=year+"/"+month+"/"+day+" "+hour+":"+minute+":"+second;
				}else if(format=="yyyy/MM/dd HH:mm"){
					dateStr=year+"/"+month+"/"+day+" "+hour+":"+minute;
				}else if(format=="yyyy/MM/dd"){
					dateStr=year+"/"+month+"/"+day;
				}else if(format=="yyyy-MM-dd"){
					dateStr=year+"-"+month+"-"+day;
				}else if(format=="MM-dd HH:mm"){
					dateStr=month+"-"+day+" "+hour+":"+minute;
				}else{
					return null;
				}
			}else{
				dateStr=year+"-"+month+"-"+day;
			}
			return dateStr;
		},
		//字符串转换为日期类型
		//format可选值同上，若为空则使用defaultFormat
		string2Date:function(str,format){
			var date =""; 
			var year,month,day;
			var hour="00";
			var minute="00";
			var second="00";
			if(format){
				if(format=="yyyy-MM-dd HH:mm:ss"){
					var tempStrs = str.split(" ");
					var dateStrs = tempStrs[0].split("-");
					var timeStrs = tempStrs[1].split(":");
					year	= parseInt(dateStrs[0], 10);
					month	= parseInt(dateStrs[1], 10) - 1;
					day		= parseInt(dateStrs[2], 10);
					hour	= parseInt(timeStrs[0], 10);
					minute	= parseInt(timeStrs[1], 10);
					second	= parseInt(timeStrs[2], 10);
				}else if(format=="yyyy-MM-dd HH:mm"){
					var tempStrs = str.split(" ");
					var dateStrs = tempStrs[0].split("-");
					var timeStrs = tempStrs[1].split(":");
					year	= parseInt(dateStrs[0], 10);
					month	= parseInt(dateStrs[1], 10) - 1;
					day		= parseInt(dateStrs[2], 10);
					hour	= parseInt(timeStrs[0], 10);
					minute	= parseInt(timeStrs[1], 10);
				}else if(format=="yyyy/MM/dd HH:mm"){
					var tempStrs = str.split(" ");
					var dateStrs = tempStrs[0].split("/");
					var timeStrs = tempStrs[1].split(":");
					year	= parseInt(dateStrs[0], 10);
					month	= parseInt(dateStrs[1], 10) - 1;
					day		= parseInt(dateStrs[2], 10);
					hour	= parseInt(timeStrs[0], 10);
					minute	= parseInt(timeStrs[1], 10);
				}else if(format=="yyyy/MM/dd HH:mm:ss"){
					var tempStrs = str.split(" ");
					var dateStrs = tempStrs[0].split("/");
					var timeStrs = tempStrs[1].split(":");
					year	= parseInt(dateStrs[0], 10);
					month	= parseInt(dateStrs[1], 10) - 1;
					day		= parseInt(dateStrs[2], 10);
					hour	= parseInt(timeStrs[0], 10);
					minute	= parseInt(timeStrs[1], 10);
					second	= parseInt(timeStrs[2], 10);
				}else if(format=="yyyy-MM-dd"){
					var dateStrs = str.split("-");
					year	=parseInt(dateStrs[0], 10);
					month	=parseInt(dateStrs[1], 10) - 1;
					day		=parseInt(dateStrs[2], 10);
				}else{
					return null;
				}
			}else{
				var dateStrs = str.split("-");
				year	=parseInt(dateStrs[0], 10);
				month	=parseInt(dateStrs[1], 10) - 1;
				day		=parseInt(dateStrs[2], 10);
			}
			return new Date(year, month,day,hour,minute,second);
		},
		//d1和d2时间比较，
		//若d1>d2 return 正数;
		//若d1<d2,return 负数；
		//若d1=d2，return 0;
		//调用此函数，如果传入的是字符串时间则必须先调用string2Date函数
		compare:function(d1,d2){
			return d1.getTime()>=d2.getTime();
		}
	};
	
	dateUtils.prototype=function(){
		
	};

	window['dateUtils']=dateUtils;
})(jQuery);
