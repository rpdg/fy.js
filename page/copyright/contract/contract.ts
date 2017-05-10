import opg from 'ts/opg' ;
import Table from "ts/ui/Table.ts";
import {store, Cache} from 'ts/util/store';

opg.api({
	'alias!!': 'produce/asset/copyrights/${id}'
});

const moduleRoot :string = '/page/copyright/contract/module/' ;

export default class Contract {

	/**
	 *
	 * @param tb
	 */
	static add(tb :Table){
		let pop = top.opg.confirm(`<iframe src="${moduleRoot}preAdd.html" />`, function (i, ifr) {
			ifr.doSave(pop , Contract.modify , tb);
			return true;
		}, {
			title: '新增合同',
			btnMax: true,
			width: 640,
			height: 320,
			buttons: {
				ok: '保存新增',
				cancel: '返回'
			}
		});
	}


	/**
	 * 修改版权合同
	 * @param id
	 * @param tb
	 */
	static modify(id:string , tb :Table){

		let cache = Cache.getInstance();
		let cacheKey = 'currentPop' ;

		let pop = opg.popTop(`<iframe src="${moduleRoot}add.html?id=${id}" />` , {
			title: '修改版权合同',
			btnMax: true,
			width: 900,
			height: 600,
			onClose : function () {
				cache.remove(cacheKey);
				tb.update();
			}
		});

		cache.set(cacheKey , pop);
	}

	/**
	 * 修改版权节目信息
	 * @param contractId
	 * @param programId
	 * @param tb
	 */
	static editProgram(contractId :string , programId:string , tb:Table){
		let pop = top.opg.confirm(`<iframe src="${moduleRoot}detail.html?pId=${programId}&cId=${contractId}" />`, function (i, ifr) {
			ifr.doSave(pop , Contract.modify , tb);
			return true;
		}, {
			title: '修改版权节目信息',
			btnMax: true,
			width: 900,
			height: 600,
			buttons: {
				ok: '保存',
				cancel: '返回'
			}
		});
	}

	/**
	 * 新增版权节目信息
	 * @param contractId
	 * @param tb
	 */
	static addProgram(contractId :string , tb:Table){
		let pop = top.opg.confirm(`<iframe src="${moduleRoot}detail.html?cId=${contractId}" />`, function (i, ifr) {
			ifr.doSave(pop , Contract.modify , tb);
			return true;
		}, {
			title: '新增版权节目信息',
			btnMax: true,
			width: 900,
			height: 600,
			buttons: {
				ok: '保存',
				cancel: '返回'
			}
		});
	}

	/**
	 * 修改版权时间
	 * @param contractId
	 * @param programId
	 */
	static modifyCopyrightTime(contractId :string , programId:string ){
		let pop = top.opg.confirm(`<iframe src="${moduleRoot}time.html?pId=${programId}&cId=${contractId}" />`, function (i, ifr) {
			ifr.doSave(pop);
			return true;
		}, {
			title: '修改版权时间',
			btnMax: true,
			width: 680,
			height: 400,
			buttons: {
				ok: '保存',
				cancel: '返回'
			}
		});
	}


	/**
	 * 批量导入版权
	 */
	static importExcel(){
		let pop = opg.popTop(`<iframe src="${moduleRoot}import.html" />`, {
			title: '批量导入版权节目',
			btnMax: true,
			width: 480,
			height: 220,
		});
	}
}