import opg from 'ts/opg.ts';
import Popup from "ts/ui/Popup";


class ReTranscode{
	constructor(row){
		//let page = (row.type==3000) ? 'episode' : 'index';

		let pop :Popup = top.opg.confirm(`<iframe src="/page/produce/launch/module/reTranscode/index.html?id=${row.id}&type=${row.type}" />` , function (i, ifr) {
			ifr.doSave();
			return true;
		}, {
			title: '已有内容生产需求',
			btnMax: true,
			width: 800,
			height: 500,
			buttons: {
				ok: '保存',
				cancel: '取消'
			},
		}) ;
	}
}

export default ReTranscode ;