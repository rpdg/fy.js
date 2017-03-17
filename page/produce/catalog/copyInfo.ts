import opg from 'ts/opg.ts';
import {Cache} from 'ts/util/store' ;


opg.api({
	query: 'admin/catalog/getOrderstWithCatlog',
});



//
let tb = opg('#groupTb').table({
	titleBar: {
		title: '已编目列表',
	},
	columns: [
		{
			text: '内容名称', src: 'assetName' ,
			render : function (val, i , row) {
				return `<a class="port" href="javascript:void(0);" data-id="${row.assetId}">${val}</a>`;
			}
		},
		{text: '内容类型', src: 'contentType', width: 100},
		{text: '来源', src: 'sourceName', width: 100},
		{text: '创建时间', src: 'createTime', width: 120},
		{ text: '创建人', src: 'creator', width: 80 },
	],
	api: opg.api.query,
	pagination: {
		pageSize: 20,
		customizable: [10, 20 , 30]
	}
});



//search
$('#btnSearch').click(() => {
	tb.update({assetName: $('#assetName').val()});
});


//click OK button
tb.jq.on('click' , '.port' , function () {
	let elem = $(this) , id = elem.data('id');
	port(id);
});

function port(assetId){
	parent.window['importMetaData'](assetId);
	let cache = Cache.getInstance();
	let pop = cache.get('importWin');
	cache.remove('importWin');
	pop.close();
}