import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import {Cache} from 'ts/util/store'

opg.api({
	programs: 'admin/catalog/findPage' ,
	contracts : 'transcode/business/findAll'
});


opg.wrapPanel('#tbSearch', {
	title: '节目查询',
	btnSearchText: '<i class="ico-find"></i> 查询',
	btnSearchClick: function () {
		let param = $('#tbSearch').fieldsToJson();
		param.pageNo = 1;
		tb.update(param);
	}
});


let tb: Table = opg('#tbResult').table({
	api: opg.api.programs,
	titleBar: {
		title: '介质列表',
	},
	columns: [
		{
			text: ' ',
			src: 'name', cmd: 'checkOne'
		},
		{
			text: '介质名称',
			src: 'assetName',
		},
		{
			text: '节目名称',
			src: 'assetName',
		},
		{
			text: '节目主类',
			src: 'name',
		},
		{
			text: '出品年代',
			src: 'name',
		},
		{
			text: '介质类型',
			src: 'name',
		},
		{
			text: '分辨率',
			src: 'name',
		},
		{
			text: '码率',
			src: 'name',
		},
		{
			text: '语言',
			src: 'name',
		},
		{
			text: '字幕',
			src: 'name',
		},
		{
			text: '介质编码',
			src: 'name',
		},
		{
			text: '集数开始',
			src: 'name',
		},
		{
			text: '集数结束',
			src: 'name',
		},
		{
			text: '视频格式',
			src: 'name',
		},
	],
	pagination: {
		pageSize: 10
	},
});


window['getChecked'] = function () {
	let row = tb.getCheckData();
	if(!row){
		opg.warn('请选择节目');
	}
	return row;
};