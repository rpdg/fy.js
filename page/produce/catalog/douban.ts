import opg from 'ts/opg.ts';
import {Cache} from 'ts/util/store' ;


opg.api({
	getDoubanInfoList: 'admin/catalog/getDoubanInfoList',
	'collectDoubanInfo!post': 'admin/catalog/collectDoubanInfo',
});

opg.api.getDoubanInfoList.set('timeout' , 60000);
opg.api.collectDoubanInfo.set('timeout' , 60000);



let dbData = [];
//
let tb = opg('#tb').table({
	api : opg.api.getDoubanInfoList ,
	lazy: true ,
	onAjaxEnd : function (json) {
		dbData = json.results ;
	},
	columns: [
		{text: '封面', src: 'poster' , render: function (src) {
			return `<img src="${src?src:'/css/img/blank.gif'}" class="thumb">` ;
		}},
		{text: '内容名称', src: 'name' , render :function (val, i , row) {
			return `<a class="port" href="javascript:void(0);" data-idx="${row[':index']}">${val}</a>`;
		}},
		{text: '内容类型' , src: 'typeName'},
		{text: '导演', src: 'writerDisplay'},
		{text: '主演', src: 'actorDisplay', },
	],
	pagination: {
		pageSize: 10,
		customizable: [10, 20 , 50]
	}
});


//search
$('#btnSearch').click(() => {
	tb.update({assetName: $('#assetName').val()});
	/*opg.api.getDoubanInfoList({assetName: $('#assetName').val()} , function (data) {
		dbData = data.results ;
		tb.update(data.results);
	});*/
});


//collect
$('#btnCollect').click(function () {
	let url = $('#doubanUrl').val();
	if(!url)
		return opg.alert('请输入豆瓣的内容网址');

	let pop = opg('<div style="display: table-cell; vertical-align: middle; text-align: center; font-size: 16px;">正在采集，请稍候 ...</div>').popup({

	});

	opg.api.collectDoubanInfo.set('onError' , function () {
		pop.close();
		opg.err('采集发生错误，请联系管理员');
	});
	opg.api.collectDoubanInfo({doubanUrl: url} , function (data) {
		pop.close();
		opg.ok('采集完成');
	});
});


//click OK button
tb.jq.on('click' , '.port' , function () {
	let elem = $(this) , idx = elem.data('idx');
	let data = dbData[idx];

	let cache = Cache.getInstance();
	let win = cache.get('windowSrc');
	win.importDbData(data);

	let pop = cache.get('importWin');
	pop.close();

});

