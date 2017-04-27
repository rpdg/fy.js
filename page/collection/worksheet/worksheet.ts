/**
 * 此页面已被废除
 */



import opg from 'ts/opg.ts';
import Table from "ts/ui/Table.ts";


opg.api({

});



let tb: Table = opg('#tb').table({
	api: opg.api.amssp,
	titleBar: {
		title: '采集任务列表',
	},
	columns: [
		{
			text: '状态',
			width: 120,
			src: 'name'
		},
		{
			text: '输入类别',
			width: 80,
			src: 'description'
		},
		{
			text: '输入源文件类型',
			src: 'description'
		},
		{
			text: '输出类别',
			width: 80,
			src: 'description'
		},
		{
			text: '输出文件类型',
			src: 'description'
		},
		{
			text: '进度百分比',
			width: 100,
			src: 'description'
		},
		{
			text: '分配次数',
			width: 80,
			src: 'description'
		},
		{
			text: '操作',
			src: 'id',
			width: 70,
			render: (val, i, row) => {
				return `
					<button class="btn-mini btn-info" data-id="${val}" data-title="${row.name}">查看</button>
				`;
			}
		}
	],
	pagination: {
		customizable: [10 , 15, 20],
		pageSize: 10
	}
});

//view only
tb.tbody.on('click', '.btn-info', function () {
	let btn = $(this), title = btn.data('title'), id = btn.data('id');

	opg.popTop(`<iframe src="/page/collection/worksheet/task.html?id=${id}" />`, {
		title: `查看采集任务: ${title}`,
		btnMax: true,
		width: 780,
		height: 600,
	});
});
