import opg from 'ts/opg';


opg.api({
	'comments!!': 'produce/asset/comments/${id}', //获取审核意见
});


class ViewAudit {
	constructor(currentRow) {
		//debugger;
		//console.log(currentRow);
		opg.api.comments({id: currentRow.id}, function (data) {
			let tb = opg('#tbRemarks').table({
				data: data,
				columns: [
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
						src: 'busiCodes',
					},
					{
						text: '生产中业务', width: 120,
						src: 'produceBusiCodes',
					},
					{
						text: '创建时间', width: 120,
						src: 'createTime',
					},
					{
						text: '时长', width: 120,
						src: 'length',
					},
					{
						text: '创建人', width: 90,
						src: 'source',
					},
				]
			});

			let subData = [];
			for (let i = 0, l = data.length; i < l; i++) {
				let item = data[i];
				let comments = item.comments || [];
				let cmtArr = [];

				for (let m = 0, n = comments.length; m < n; m++) {
					let cmt = comments[m], prdCmts ;
					try {
						prdCmts = JSON.parse(cmt.produceComment);
					}
					catch (e) {
						prdCmts = [];
					}

					for (let x = 0, y = prdCmts.length; x < y; x++) {
						let prdCmt = prdCmts[x];
						cmtArr.push({
							text: prdCmt.text,
							time: opg.convert.secondsToTimecode(prdCmt.time),
							creator: cmt.creator,
							stepCodeDesc: cmt.stepCodeDesc,
						});
					}

					//subData
				}

				subData.push(cmtArr);
			}

			tb.tbody.find('tr').each(function (i, tr) {

				let subTb = $(`
					<tr><td colspan="7" style="padding: 3px; ">
						<table class="grid">
						<tbody><tr class="subTHead">
							<th>审片意见</th>
							<th style="width: 180px;">开始时间</th>
							<th style="width: 90px;">审核人</th>
							<th style="width: 90px;">工位</th>
						</tr></tbody>
						<tbody></tbody>
						</table>
					</td></tr><tr><td colspan="7" style="height: 10px; background-color: #f6f6f6;"></td></tr>`);

				//console.log(subTb.find('tbody:last'));

				subTb.find('tbody:last').bindList({
					list: subData[i] ,
					template: '<tr class="subTBody">' +
					'<td style="white-space: normal;">${text}</td>' +
					'<td class="text-center">${time}</td>' +
					'<td class="text-center">${creator}</td>' +
					'<td class="text-center">${stepCodeDesc}</td>' +
					'</tr>',
				});

				$(tr).addClass('even').after(subTb);
			});
		});


	}
}

export default ViewAudit;