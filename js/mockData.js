$.mockjaxSettings = {
	log:             null,  // DEPRECATED, use $.mockjaxSettings.logger instead
	logger:          window.console,
	logging:         2,
	logLevelMethods: ['error', 'warn', 'info', 'log', 'debug'],
	namespace:       '<%=apiServer%>',
	status:          200,
	statusText:      "OK",
	responseTime:    [250, 750],
	isTimeout:       false,
	throwUnmocked:   false,
	retainAjaxCalls: true,
	contentType:     "application/json",
	response:        "",
	responseText:    "",
	responseXML:     "",
	proxy:           "",
	proxyType:       "GET",
	lastModified:    null,
	etag:            "",
	headers: {
		etag: "IJF@H#@923uf8023hFO@I#H#",
		"content-type" : "application/json"
	}
} ;


$.mockjax({
	url: "roles.json",
	responseText: {
		"data": [
			{
				"id": 11,
				"name": "admin",
				"description": "管理员角色" ,
				"children": [
					{
						"id": 111,
						"name": "版权测试" ,
						"description": "test copyrights"
					},
					{
						"id": 112,
						"name": "livetest" ,
						"description": ""
					},
					{
						"id": 113,
						"name": "节目部运维管理员",
						"children": [
							{
								"id": 1131,
								"name": "节目部操作人员" ,
								"description": "节目部操作人员角色"
							}
						]
					},
					{
						"id": 114,
						"name": "备份管理人员",
						"description": "操作备份"
					}
				]
			}
		],
		"meta": {
			"success": true,
			"message": "ok"
		}
	}
});



/*$.mockjax({
	url : /^system\/amssp\/delete\/([\d]+)$/,
	responseText: {
		"meta": {
			"success": true,
			"message": "ok"
		}
	}
});
$.mockjax({
	url : /^system\/amssp\/(update|add)$/,
	responseText: {
		"meta": {
			"success": true,
			"message": "ok"
		}
	}
});*/

/*$.mockjax({
	url : /^system\/amssp\/findById\/([\d]+)$/,
	responseText: {
		"meta": {
			"success": true,
			"message": "ok"
		},
		"data": {
			"id": 3,
			"name": "bestv3",
			"code": "bestv3"
		}
	}
});*/




/*
* 业务管理
* */

/*
$.mockjax({
	url: "transcode/business/findPage",
	responseText: {
		"meta": {
			"success": true,
			"message": "ok"
		},
		"data": {
			"pageNo": 1,
			"pageSize": 10,
			"totalRecord": 3,
			"totalPage": 1,
			"results": [
				{
					"id": 20000003,
					"orgId": 2,
					"name": "百视通业务4",
					"bizCode": "bestv4",
					"bizDesc": "百视通业务3"
				},
				{
					"id": 20000001,
					"orgId": 5,
					"name": "百视通业务2",
					"bizCode": "bestv5"
				},
				{
					"id": 20000002,
					"name": "百视通业务3",
					"bizCode": "bestv3",
					"bizDesc": "百视通业务3"
				}
			],
			"params": {
				"name": "%百%",
				"bizCode": "%b%"
			}
		}
	}
});*/
