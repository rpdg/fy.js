import opg from 'ts/opg' ;
import Table from "ts/ui/Table.ts";


opg.api({
	'alias!!': 'produce/asset/copyrights/${id}'
});

const infoPage = '/page/copyright/program/module/detail.html';
const mediaDetailPage = '/page/copyright/program/module/mediaDetail.html';
const width = 900;
const height = 480;


export default class OpenDetail {

	/**
	 * 新增节目
	 * @param tb
	 */
	static addNew(tb: Table) {
		let pop = top.opg.confirm(`<iframe src="${infoPage}" />`, function (i, ifr) {
			return ifr.doSave(pop, tb);
		}, {
			title: '新增节目',
			btnMax: true,
			width: width,
			height: height,
			buttons: {
				ok: '保存新增',
				cancel: '取消'
			}
		});
	}

	/**
	 * 修改节目
	 * @param tb
	 * @param programId
	 */
	static edit(tb: Table, programId: string) {
		let pop = top.opg.confirm(`<iframe src="${infoPage}?id=${programId}" />`, function (i, ifr) {
			return ifr.doSave(pop, tb);
		}, {
			title: '修改节目',
			btnMax: true,
			width: width,
			height: height,
			buttons: {
				ok: '保存',
				cancel: '取消'
			}
		});
	}

	/**
	 * 查看节目
	 * @param programId
	 */
	static view(programId: string) {
		opg.popTop(`<iframe src="${infoPage}?id=${programId}" />`, {
			title: '查看节目',
			btnMax: true,
			width: width,
			height: height,
		});
	}

	/**
	 * 别名
	 * @param programId
	 * @param title
	 */
	static alias(programId: string , title: string){
		opg.api.alias({id: programId} , (data)=>{
			top.opg.confirm(`<div style="padding: 10px;"><table class="search-table" style="width: 100%;">
					<colgroup><col><col></colgroup>
					<tr><td class="lead">节目名称</td><td style="width: 360px !important;">
						${title}
						<input type="hidden" name="id" value="${programId}">
					</td></tr>
					<tr><td class="lead">节目别名</td><td style="width: 360px !important;">
						<input type="text" name="alias" value="${data.alias||''}" >
					</td></tr>
				</table><p class="text-gray">注：不同别名请以空格分开</p></div>`,
			function () {

			} ,
			{
				title: '增加别名',
				width: 600,
				height: 200,
			});
		});
	}

	/**
	 * 介质管理
	 * @param programId
	 */
	static listMedias(programId: string){
		opg.popTop(`<iframe src="/page/copyright/program/module/listMedia.html?id=${programId}" />`, {
			title: '介质列表',
			btnMax: true,
			width: 1200,
			height: 520,
			buttons:{
				add : {
					text : '新增介质' ,
					className : 'btn-success',
					onClick : function(){
						OpenDetail.addNewMedia(programId);
						return true ;
					}
				},
				cancel : '返回'
			}
		});
	}

	/**
	 * 新增介质
	 * @param programId
	 */
	private static addNewMedia(programId: string){
		let pop = top.opg.confirm(`<iframe src="${mediaDetailPage}?programId=${programId}" />`, function (i, ifr) {
			return ifr.doSave(pop);
		}, {
			title: '新增介质',
			btnMax: true,
			width: width,
			height: 550,
			buttons: {
				ok: '保存介质',
				cancel: '取消'
			}
		});
	}
}