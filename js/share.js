plus.share.getServices(function(s) {
	if (s && s.length > 0) {
		for (var i = 0; i < s.length; i++) {
			var t = s[i];
			shares[t.id] = t;
		}
	}
}, function() {
	$('#loadingMes').hide();
	$('.mui-content').fadeIn();
	console.log("获取分享服务列表失败");
});
var shares = {};
/**
 * 分 享
 * @param {Object} _url 		分享的url地址
 * @param {Object} _title		分享的内容的标题
 * @param {Object} _content		 分享的好友显示的内容
 * @param {Object} _thumbs		分享的图片路径
 * @param {Object} weiboContent 分享到微博  可选参数
 */
function toShare(_url, _title, _content, _thumbs, weiboContent) {
	var ids = [{
			id: "weixin",
			ex: "WXSceneSession"
		}, {
			id: "weixin",
			ex: "WXSceneTimeline"
		}/*, {
			id: "sinaweibo"
		}, {
			id: "tencentweibo"
		}*/],
		bts = [{
			title: "发送给微信好友"
		}, {
			title: "分享到微信朋友圈"
		}/*, {
			title: "分享到新浪微博"
		}, {
			title: "分享到腾讯微博"
		}*/];
	if (plus.os.name == "iOS"||true) {
		ids.push({
			id: "qq"
		});
		bts.push({
			title: "分享到QQ"
		});
	}
	plus.nativeUI.actionSheet({
		cancel: "取消",
		buttons: bts
	}, function(e) {
		var i = e.index;
		if (i > 0) {
			var s_id = ids[i - 1].id;
			var share = shares[s_id];
			if (share.authenticated) {
				shareMessage(share, ids[i - 1].ex, _url, _title, _content, _thumbs, weiboContent);
			} else {
				share.authorize(function() {
					shareMessage(share, ids[i - 1].ex, _url, _title, _content, _thumbs, weiboContent);
				}, function(e) {
					console.log("认证授权失败：" + e.code + " - " + e.message);
				});
			}
		}
	});
}

function shareMessage(share, ex, _url, _title, _content, _thumbs, weiboContent) {
	var msg = {
		extra: {
			scene: ex
		}
	};
	msg.href = _url;
	msg.title = _title;
	msg.content = _content;
	if (~share.id.indexOf('weibo')) {
		msg.content += weiboContent;
	}
	msg.thumbs = _thumbs;
	share.send(msg, function() {
		console.log("分享到\"" + share.description + "\"成功！ ");
	}, function(e) {
		console.log("分享到\"" + share.description + "\"失败: " + e.code + " - " + e.message);
	});
}