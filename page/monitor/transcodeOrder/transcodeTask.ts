import opg from 'ts/opg.ts';
import Table from "ts/ui/Table.ts";


opg.api({
	listTasks: `transcode/monitor/listTasks/${opg.request['id']}`,
});


let tb: Table = opg('#tb').table({
	api: opg.api.listTasks,
	columns: [
		{
			text: '任务名',
			src: 'name',
		},
		{
			text: '状态',
			src: 'statusDesc',
			width: 80,
		},
		{
			text: '输入类别',
			src: 'inputProfileDesc',
			width: 80,
		},
		{
			text: '输出类别',
			src: 'isHdDesc',
			width: 80,
		},
		{
			text: '输出文件类型',
			width: 120,
			src: 'outputProfileName',
		},
		{
			text: '进度百分比',
			src: 'progress',
			width: 100,
			render : v=>v+'%'
		},
		{
			text: '输出文件',
			src: 'outputFile',
			width: 190,
			render : v=> `<span title="${v}">${v}</span>`
		},
		{
			text: '备注',
			src: 'note', width: 120,
			render : v=> `<span title="${v}">${v}</span>`
		},
	],
});

