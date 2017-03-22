import opg from 'ts/opg';


opg.api({
	remarks: 'produce/asset/findPage', //获取媒体文件
});


class ViewAudit{
	constructor(currentRow){
		let tb = opg('#tbRemarks').table({
			api : opg.api.remarks ,
			columns : [
				{
					text: '内容名称', width: 220,
					src: 'managerName'
				},
				{
					text: '内容类型', width: 90,
					src: 'contentType'
				},
				{
					text: '已生产业务', width: 120,
					src: 'name',
				},
				{
					text: '生产中业务', width: 120,
					src: 'produceBusiCodes',
				},
				{
					text: '创建时间', width: 120,
					src: 'managerName',
				},
				{
					text: '时长', width: 120,
					src: 'managerName',
				},
				{
					text: '创建人',  width: 90,
					src: 'source',
				},
				{
					text: '操作',  width: 90,
					src: 'source',
				},
			]
		});

		$.when(tb.createdPromise).done(function () {
			tb.tbody.find('tr').each(function (i , tr) {
				let subTb = $(`
					<tr><td colspan="8" style="padding: 3px; ">
						<table class="grid">
						<tbody><tr class="subTHead">
							<th>审片意见</th>
							<th style="width: 90px;">开始时间</th><th style="width: 90px;">结束时间</th>
							<th style="width: 70px;">审核人</th><th style="width: 70px;">工位</th>
						</tr></tbody>
						<tbody></tbody>
						</table>
					</td></tr><tr><td colspan="8" style="height: 10px; background-color: #f6f6f6;"></td></tr>`);

				//console.log(subTb.find('tbody:last'));

				subTb.find('tbody:last').bindList({
					list : [{name: '44k'}] ,
					template : '<tr class="subTBody"><td>${name}</td>' +
								'<td class="text-center">${name}</td><td class="text-center">${name}</td>' +
								'<td class="text-center">${name}</td><td class="text-center">${name}</td></tr>'
				});

				$(tr).addClass('even').after(subTb);
			})
		});

	}
}

export default ViewAudit;