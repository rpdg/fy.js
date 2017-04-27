import opg from 'ts/opg.ts';
import ValidTimeModifier from './module/modifyValidTime';
import Table from "ts/ui/Table";
import PopUp from "ts/ui/Popup";
import {store, Cache} from 'ts/util/store';


opg.api({
	'episodes!!': 'produce/asset/episodes/${id}', //查询剧集
	'medias!!': 'produce/asset/medias/${id}', //获取媒体文件
	'delete!DELETE!': 'produce/asset/delete/${id}', //删除媒体
	'deleteFile!DELETE!': 'produce/asset/deleteMedia/${id}', //删除文件(不做了)
});

class ViewMedia {
	private tbMedia: Table;

	constructor(row) {

		if (row.type == 3000) {//电视剧
			this.createEpisode(row);
		}
		else {//其他
			this.createTable(row);
		}


		let cache = Cache.getInstance();

		//delete
		this.tbMedia.tbody.on('click', '.btnDelete', function () {
			let btn = $(this),
				title = btn.data('title'),
				id = btn.data('id');

			opg.confirm(`要删除“<b>${title}</b>”吗？`, () => {
				opg.api.delete({id: id}, () => {
					if (row.type == 3000){
						btn.parent().parent().remove();
						//opg.ok(`删除节目 <b>${title}</b> 成功`);
					}
					else{
						cache.remove('currentRow');

						let pop:PopUp = cache.get('currentViewWindow');
						pop.close();
					}
				});
			});
		});

		
		//delete media file
		this.tbMedia.tbody.on('click', '.btnDeleteFile', function () {
			let btn = $(this),
				title = btn.data('title'),
				id = btn.data('id');

			opg.confirm(`要删除此文件吗？`, () => {
				opg.api.deleteFile({id: id}, () => {
					btn.parent().parent().remove();
					/*opg.ok(`删除文件成功`, () => {
						//PopUp.closeLast();
					});*/
				});
			});
		});
	}

	createTable(mediaRow) {
		let that = this;
		this.tbMedia = opg('#tbMedia').table({
			data: [],
			columns: [
				{
					text: '内容名称',
					src: 'managerName',
					width: 200,
				},
				{
					text: '内容类型',
					src: 'contentType',
					width: 150,
				},
				{
					text: '已生产业务',
					src: 'busiCodes',
					width: 150,
				},
				{
					text: '生产中业务',
					src: 'produceBusiCodes',
					width: 150,
				},
				{
					text: '创建时间',
					src: 'createTime',
					width: 150,
				},
				{
					text: '时长',
					src: 'length',
					width: 150,
				},
				{
					text: '创建人',
					src: 'creator',
				},
				{
					text: '操作',
					src: 'id',
					width: 180, lign: 'left',
					render: (val, i, row) => {
						let btnHTML = '';
						if (mediaRow.updateValidTime_visible) {
							btnHTML += `
									<button class="btn-mini btn-warning btnModifyTime" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}" data-time="${row.validTime || ''}">修改生效时间</button>
								`;
						}
						if (mediaRow.deleteAsset_visible) {
							btnHTML += `
								<button class="btn-mini btn-danger btnDelete" data-id="${mediaRow.id}" data-title="${row.managerName}" data-idx="${row[':index']}">删除</button>
							`;
						}
						return btnHTML;
					}
				},
			],
			onUpdate: function () {
				opg.api.medias({id: mediaRow.id}, (data) => {
					if (data && data.length) {
						/*let th = $(`<tr class="subTHead esd_${esd}">
						 <th></th><th>录入时间</th><th>合同号</th>
						 <th>版权类型</th><th>版权开始时间</th><th>版权结束时间</th>
						 </tr>`).insertAfter(tr);*/
						let tr = $(`<tr></tr>`);
						let td = $('<td colspan="8" style="padding: 3px;"></td>').appendTo(tr);
						let tb = $('<table class="grid"></table>').appendTo(td);

						tb.append(`<tbody><tr class="subTHead">
							<th>生产库</th><th style="width: 90px;">生产状态</th>
							<th style="width: 90px;">备份</th><th style="width: 90px;">云上备份</th>
							<th style="width: 180px;">编码格式</th><th style="width: 90px;">视频尺寸</th>
							<th style="width: 90px;">音频格式</th>
						</tr></tbody>`);


						tb.bindList({
							list: data,
							template: '<tr class="subTBody">' +
							'<td class="text-center">${workPath}</td><td class="text-center">${workStatusDesc}</td>' +
							'<td class="text-center">${offlineStatusDesc}</td><td class="text-center">${cloudBackupStatusDesc}</td>' +
							'<td class="text-center">${movieTypeDesc}</td><td class="text-center">${screenFormatDesc}</td>' +
							'<td class="text-center">${audioType}</td>' +
							'</tr>',
							itemRender: {
								btnDeleteFile: function (v, i, row) {
									if (v)
										return `<button class="btn-mini btn-danger btnDeleteFile" data-id="${row.id}" data-idx="${row[':index']}">删除</button>`;
									return '';
								}
							},
							mode: 'append'
						});

						that.tbMedia.tbody.append(tr);
					}
					else {

					}
				});
			}
		});

		this.tbMedia.update([mediaRow]);

		//modify time
		this.tbMedia.tbody.on('click', '.btnModifyTime', function () {
			let btn = $(this),
				title = btn.data('title'),
				id = btn.data('id');

			new ValidTimeModifier(id, title, mediaRow, that.tbMedia);
		});



	}

	//电视剧
	createEpisode(mediaRow) {
		console.warn(mediaRow);

		let list = [];
		//debugger;
		//媒体文件表
		this.tbMedia = opg('#tbMedia').table({
			api: opg.api.episodes,
			param: {id: mediaRow.id},
			onAjaxEnd: (data) => {
				list = data;
			},
			columns: [
				{
					text: '内容名称',
					src: 'managerName',
					width: 200,
					render: function (val, i, row) {
						return `<b class="ico-expandable ellipse" data-esd="${row.id}"></b> ${val}`;
					}
				},
				{
					text: '内容类型',
					src: 'contentType',
					width: 150,
				},
				{
					text: '已生产业务',
					src: 'busiCodes',
					width: 150,
				},
				{
					text: '生产中业务',
					src: 'produceBusiCodes',
					width: 150,
				},
				{
					text: '创建时间',
					src: 'createTime',
					width: 150,
				},
				{
					text: '时长',
					src: 'length',
					width: 150,
				},
				{
					text: '创建人',
					src: 'creator',
				},
				{
					text: '操作',
					src: 'id',
					width: 180, lign: 'left',
					render: (val, i, row) => {
						let btnHTML: string = '';
						if (row.updateValidTime_visible) {
							btnHTML += `
								<button class="btn-mini btn-warning btnModifyTime" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}" data-time="${row.validTime || ''}">修改生效时间</button>
							`;
						}
						if (row.reTranscode_visible) {
							btnHTML += `
								<button class="btn-mini btn-warning btnReTranscode" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}">再转码</button>
							`;
						}
						if (row.reAudit_visible) {
							btnHTML += `
								<button class="btn-mini btn-warning btnReAudit" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}">重播重审</button>
							`;
						}
						/*if (row.fileRestore_visible) {
						 btnHTML += `
						 <button class="btn-mini btn-warning btnRestore" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}">回迁</button>
						 `;
						 }*/
						if (row.deleteAsset_visible) {
							btnHTML += `
								<button class="btn-mini btn-danger btnDelete" data-id="${val}" data-title="${row.managerName}" data-idx="${row[':index']}">删除</button>
							`;
						}
						return btnHTML;
					}
				},
			]
		});


		//modify time
		let that = this;
		this.tbMedia.tbody.on('click', '.btnModifyTime', function () {
			let btn = $(this),
				title = btn.data('title'),
				id = btn.data('id'),
				idx = btn.data('idx');

			let row = list[idx];

			new ValidTimeModifier(id, title, row, that.tbMedia);
		});


		//expand subTable
		this.tbMedia.tbody.on('click', '.ico-expandable', function (e) {

			let cur = $(this), esd = cur.data('esd');
			let srcTr = $(this).parents('tr');

			if (cur.hasClass('ellipse')) {

				opg.api.medias({id: esd}, (data) => {
					if (data && data.length) {
						/*let th = $(`<tr class="subTHead esd_${esd}">
						 <th></th><th>录入时间</th><th>合同号</th>
						 <th>版权类型</th><th>版权开始时间</th><th>版权结束时间</th>
						 </tr>`).insertAfter(tr);*/
						let tr = $(`<tr class="esd_${esd}"></tr>`);
						let td = $('<td colspan="8" style="padding: 3px;"></td>').appendTo(tr);
						let tb = $('<table class="grid"></table>').appendTo(td);

						tb.append(`<tbody><tr class="subTHead">
							<th>生产库</th><th style="width: 90px;">生产状态</th>
							<th style="width: 90px;">备份</th><th style="width: 90px;">云上备份</th>
							<th style="width: 180px;">编码格式</th><th style="width: 90px;">视频尺寸</th>
							<th style="width: 90px;">音频格式</th>
						</tr></tbody>`);


						tb.bindList({
							list: data,
							template: '<tr class="subTBody">' +
								'<td class="text-center">${workPath}</td><td class="text-center">${workStatusDesc}</td>' +
								'<td class="text-center">${offlineStatusDesc}</td><td class="text-center">${cloudBackupStatusDesc}</td>' +
								'<td class="text-center">${movieTypeDesc}</td><td class="text-center">${screenFormatDesc}</td>' +
								'<td class="text-center">${audioType}</td>' +
							'</tr>',
							itemRender: {
								btnDeleteFile: function (v, i, row) {
									if (v)
										return `<button class="btn-mini btn-danger btnDeleteFile" data-id="${row.id}" data-idx="${row[':index']}">删除</button>`;
									return '';
								}
							},
							mode: 'append'
						});

						tr.insertAfter(srcTr);
						cur.toggleClass('ellipse expanded');
					}
					else {
						opg.alert('没有相关信息');
					}
				})
			}
			else {
				cur.toggleClass('ellipse expanded');
				srcTr.nextAll('.esd_' + esd).remove();
			}

		});
	}

}

export default ViewMedia ;
