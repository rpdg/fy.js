import opg from 'ts/opg.ts';
import Table from "ts/ui/Table.ts";

import StartNewProduce from 'page/produce/launch/module/startNewProduce';

opg.api({
	medias: 'copyright/program/findPage',
});


//create a data table
let tb: Table = opg('#tb').table({
	api: opg.api.medias,
	columns: [
		{
			text: '介质名称',
			src: 'name',
		},
		{
			text: '节目名称',
			src: 'name'
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
			text: '入库时间',
			src: 'name',
		},
		{
			text: '集数始',
			src: 'name',
		},
		{
			text: '集数终',
			src: 'name',
		},
		{
			text: '视频格式',
			src: 'name',
		},
		{
			text: '操作',
			src: 'name',
			width: 180,
			render: (val, i, row) => {
				return `
					<button class="btn-mini btn-info btnEdit" data-id="${val}" data-title="${row.name}">修改</button>
					<button class="btn-mini btn-danger btnDelete" data-id="${val}" data-title="${row.name}">删除</button>
					<button class="btn-mini btn-warning btnProduce" data-id="${val}" data-title="${row.name}">发起生产</button>
					`;
			},
		},
	],
	pagination: {
		pageSize: 10
	}
});


//发起生产
tb.tbody.on('click' , '.btnProduce' , function () {
	StartNewProduce.start(tb);
});