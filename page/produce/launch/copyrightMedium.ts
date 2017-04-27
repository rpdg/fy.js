import opg from 'ts/opg.ts';
import Panel from "ts/ui/Panel.ts";
import Table from "ts/ui/Table.ts";
import {Combo} from 'ts/ui/Combo' ;
import {Cache} from 'ts/util/store'

opg.api({
	programs: 'copyright/programMediaFile/findPage' ,
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
			src: 'id', cmd: 'checkOne'
		},
		{
			text: '介质名称',
			src: 'name',
		},
		{
			text: '节目名称',
			src: 'program',
			render : program=>program.name,
		},
		{
			text: '节目主类',
			src: 'program',
			render : program=>program.mainCategoryDesc,
		},
		{
			text: '出品年代',
			src: 'program',
			render : program=>program.produceYear,
		},
		{
			text: '介质类型',
			src: 'mediaTypeDesc',
		},
		{
			text: '分辨率',
			src: 'resolutionDesc',
		},
		{
			text: '码率',
			src: 'bitRate',
		},
		{
			text: '语言',
			src: 'language',
		},
		{
			text: '字幕',
			src: 'subtitle',
		},
		{
			text: '介质编码',
			src: 'code',
		},
		{
			text: '集数开始',
			src: 'episodeStart',
		},
		{
			text: '集数结束',
			src: 'episodeEnd',
		},
		{
			text: '视频格式',
			src: 'videoFormatDesc',
		},
	],
	pagination: {
		pageSize: 20
	},
});


window['getChecked'] = function () {
	let row = tb.getCheckData();
	if(!row){
		opg.warn('请选择节目');
	}
	return row;
};