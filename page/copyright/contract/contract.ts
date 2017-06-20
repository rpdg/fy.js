import opg from 'ts/opg' ;
import Table from 'ts/ui/Table';
import Popup from 'ts/ui/Popup';
import {store, Cache} from 'ts/util/store';

opg.api({
	'alias!!': 'produce/asset/copyrights/${id}',
	'deleteContracts!post' : 'copyright/contract/deleteBatchCopyrightContract' , //删除合同
	'changeContractNumber!post' : 'copyright/contract/changeBatchContractNumber' , //变更合同号
	download: 'copyright/contract/downloadCopyrightContract', //导出全量版权
});

const moduleRoot: string = '/page/copyright/contract/module/';

export default class Contract {

	/**
	 * 新增合同
	 * @param tb
	 */
	static add(tb: Table) {
		let pop = top.opg.confirm(`<iframe src="${moduleRoot}preAdd.html" />`, function (i, ifr) {
			ifr.doSave(pop, Contract.modify, tb);
			return true;
		}, {
			title: '新增合同',
			btnMax: true,
			width: 640,
			height: 320,
			buttons: {
				ok: '保存新增',
				cancel: '返回',
			},
		});
	}


	/**
	 * 修改版权合同（带节目列表展示）
	 * @param contractId
	 * @param tb
	 */
	static modify(contractId: string, tb: Table) {

		let cache = Cache.getInstance();
		let cacheKey = 'currentPop';

		let pop = opg.popTop(`<iframe src="${moduleRoot}add.html?contractId=${contractId}" />`, {
			title: '修改版权合同',
			btnMax: true,
			width: 900,
			height: 600,
			onClose: function () {
				cache.remove(cacheKey);
				tb.update();
			},
		});

		cache.set(cacheKey, pop);
	}

	/**
	 * 修改版权节目信息
	 * @param relContractProgramId
	 * @param tb
	 * @param nextStep
	 */
	static editProgram(relContractProgramId: string, tb: Table , nextStep ?:Function) {
		let pop = top.opg.confirm(`<iframe src="${moduleRoot}detail.html?edit=1&relContractProgramId=${relContractProgramId}" />`, function (i, ifr) {
			ifr.doSave(pop, tb, nextStep);
			return true;
		}, {
			title: '修改版权节目信息',
			btnMax: true,
			width: 900,
			height: 600,
			buttons: {
				ok: '保存',
				cancel: '返回',
			},
		});
	}

	/**
	 * 新增版权节目信息
	 * @param contractId
	 * @param contractNumber
	 * @param tb
	 */
	static addProgram(contractId: string, contractNumber :string , tb: Table) {
		let pop = top.opg.confirm(`<iframe src="${moduleRoot}detail.html?contractId=${contractId}&contractNumber=${contractNumber}" />`, function (i, ifr) {
			ifr.doSave(pop, tb);
			return true;
		}, {
			title: '新增版权节目信息',
			btnMax: true,
			width: 900,
			height: 600,
			buttons: {
				ok: '保存',
				cancel: '返回',
			},
		});
	}

	/**
	 * 修改版权时间
	 * @param row
	 * @param tb
	 */
	static modifyCopyrightTime( row: any , tb: Table) {

		let cache = Cache.getInstance();
		let cacheKey = 'contract';

		console.log(row);
		cache.set(cacheKey, row);

		let pop = top.opg.confirm(`<iframe src="${moduleRoot}time.html" />`, function (i, ifr) {
			ifr.doSave(pop , tb);
			return true;
		}, {
			title: '修改版权时间',
			btnMax: true,
			width: 680,
			height: 400,
			buttons: {
				ok: '保存',
				cancel: '返回',
			},
			onClose: function () {
				cache.remove(cacheKey);
				tb.update();
			},
		});
	}


	/***
	 * 批量导入版权
	 * @param tb
	 */
	static importExcel(tb: Table) {
		let pop :Popup = opg.popTop(`<iframe src="${moduleRoot}upload.html" />`, {
			title: '批量导入版权节目',
			btnMax: true,
			width: 480,
			height: 220,
			buttons : {
				ok : {
					text: '导入',
					className: 'btn-primary',
					onClick: function (i , ifr) {
						ifr.doUpload(pop , tb);
						return true;
					}
				},
				cancel: '取消',
			}
		});
	}


	/***
	 * 变更合同号
	 * @param idArr
	 * @param numArr
	 * @param tb
	 */
	static modifyContractNumber(idArr :Array , numArr :Array , tb: Table){

		let jq = $(`<div style="padding: 20px">
						<table class="search-table">
							<tr>
								<td class="lead">原合同号</td>
								<td style="width: auto;">${numArr.join('; ')}</td>
							</tr>
							<tr>
								<td class="lead">正式合同号</td>
								<td style="width: auto;"><input type="text" name="formalContractNumber"></td>
							</tr>
						</table>
					</div>`);
		let pop = opg.popTop(jq, {
			title: '变更合同号',
			width: 480,
			buttons: {
				ok: {
					text: '保存',
					className: 'btn-primary',
					onClick: function () {
						let contractNumber = jq.find(':text').val() ;
						if(!contractNumber){
							top.opg.warn('正式合同号不能为空');
						}
						else{
							opg.api.changeContractNumber({relContractProgramIds : idArr.join(',') , contractNumber} , function () {
								pop.close();
								tb.update();
								opg.ok('变更合同号成功');
							});
						}
						return true;
					},
				},
				cancel: '取消',
			},
		});
	}

	/***
	 * 批量变更合同号
	 * @param tb
	 */
	static batchModifyContractNumber(tb: Table) {
		let rows = this.getTbChecked(tb);
		if(!rows.length){
			opg.warn('请选择合同');
			return;
		}
		let idArr = [] , numArr = [] ;
		rows.map(function (row) {
			idArr.push(row.relCopyrightProgramId);
			numArr.push(row.contractNumber);
		}) ;
		this.modifyContractNumber(idArr , numArr , tb);
	}

	/***
	 * 批量删除合同节目
	 * @param tb
	 */
	static deleteContracts(tb : Table){

		let rows = this.getTbChecked(tb);
		if(!rows.length){
			opg.warn('请选择合同节目');
			return;
		}
		let idArr = [] , numArr = [] ;
		rows.map(function (row) {
			idArr.push(row.relCopyrightProgramId);
			numArr.push(row.programName);
		}) ;

		this.deleteContractsById(idArr , numArr , tb);
	}

	/**
	 * 删除合同节目
	 * @param ids
	 * @param names
	 * @param tb
	 */
	static deleteContractsById(ids :string[] , names :string[] , tb:Table){
		opg.confirm(`<ul><li>${names.join('</li><li>')}</li></ul>` , function () {
			opg.api.deleteContracts({relContractProgramIds : ids.join(',') } , function () {
				tb.update();
				opg.ok('删除合同节目成功');
			})
		}, {
			title : '确定要删除以下合同节目吗？'
		});
	}


	/***
	 * 获取选中的项目的ID
	 * @param tb
	 * @returns {Array}
	 */
	private static getTbChecked(tb: Table): Array {
		let rev = [];
		let chkBoxes = tb.tbody.find(':checkbox:checked');
		chkBoxes.each((i, elem: HTMLInputElement) => {
			rev.push(tb.data[elem.value]);
		});
		return rev;
	}


	/***
	 * 导出全量
	 */
	static exportAll(){
		let loading = $('#opgAjaxLoading');

		loading.show();
		let req = new XMLHttpRequest();
		req.open('GET', opg.api.download.get('url'),  true);
		req.responseType = 'blob';
		req.setRequestHeader('X-Token', store.get('X-Token'));
		req.onload = function (e) {
			//console.log(req.getResponseHeader('Content-Disposition'));
			loading.hide();
			if(req.status==200 || req.status == 0){
				let blob = req.response;
				let fileName = 'allcopyright.csv';
				if (window.navigator && window.navigator.msSaveBlob) {
					window.navigator.msSaveBlob(blob , fileName);
				}
				else {
					let link = document.createElement('a');
					link.href = window.URL.createObjectURL(blob);
					link.download = fileName;
					document.body.appendChild(link);
					link.click();
					setTimeout(function(){
						document.body.removeChild(link);
						window.URL.revokeObjectURL(link.href);
					}, 100);
				}
			}
			else{
				opg.err(req.statusText);
			}
		};

		req.send();

	}
}