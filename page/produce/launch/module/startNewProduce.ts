import opg from 'ts/opg.ts';
import Popup from "ts/ui/Popup";
import Table from "ts/ui/Table";




export default class StartNewProduce{
	static start(tb: Table){

		if(!window['doCatalog']){
			window['doCatalog'] = function (assetId , orderId , title) {
				let pop = parent.opg.confirm(`<iframe src="/page/produce/catalog/metaData.html?assetId=${assetId}&orderId=${orderId}" />`, function (i, ifr) {
					ifr.doSave(true , pop , tb);
					return true;
				}, {
					title: `编目: ${title}`,
					btnMax: true,
					width: 900,
					height: 500,
					buttons: {
						ok: {
							className : 'btn-warning' ,
							text : '完成编目'
						},
						cancel: '返回'
					}
				}).toggle();
			};
		}



		let pop = top.opg.confirm(`<iframe src="/page/produce/launch/module/startNewProduce/createNew.html" />`, function (i, ifr) {
			//debugger;
			//console.log(i , ifr , v);
			ifr.doSave(pop, tb , window);
			return true;
		}, {
			title: '新内容生产需求',
			btnMax: true,
			width: 900,
			height: 500,
			buttons: {
				ok: '保存新增',
				cancel: '取消'
			}
		});
		//pop.toggle();
	}
}