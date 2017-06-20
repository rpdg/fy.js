import opg from 'ts/opg.ts';
import Table from "ts/ui/Table.ts";


opg.api({
	cloudTransfer: `transfer/cloudTransfer/findPage?orderId=${opg.request['id']}`,
	'reCloudTransTask!!' : 'transfer/cloudTransfer/reCloudTransTask/${id}'
});


let tb: Table = opg('#tb').table({
	columns: [
		{
			text: '状态',
			src: 'statusDesc',
			width: 80,
		},
		{
			text: '文件类型',
			src: 'movieTypeDesc',
			width: 100,
		},
		{
			text: '源文件',
			src: 'sourceFile',
		},
		{
			text: '目标文件',
			src: 'targetFile',
		},
		{
			text: '开始时间',
			src: 'beginTime',
			width: 150,
		},
		{
			text: '结束时间',
			src: 'endTime',
			width: 150,
		},
		{
			text: '操作',
			src: 'id', width: 80,
			render : function (val , i , row) {
				if(row.status == 1 || row.status == 2)
					return `<button class="btn-mini btn-info btnReTransfer" data-id="${val}" data-title="${row.managerName}">重传</b></button>`;
				return '';
			}
		},
	],
	api: opg.api.cloudTransfer,
	pagination: true
});


tb.tbody.on('click' , '.btnReTransfer' , function () {
	let btn = $(this), id = btn.data('id'), title = btn.data('title');
	opg.danger('确定需要重新传输？' , function () {
		opg.api.reCloudTransTask({id} , function (data) {
			opg.ok(data);
			tb.update();
		})
	});
});