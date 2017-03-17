import opg from 'ts/opg.ts';
import Popup from "ts/ui/Popup";


class ReAudit{
	constructor(row){

		let pop :Popup = top.opg.confirm(`<iframe src="/page/produce/launch/module/reAudit/index.html?id=${row.id}" allowfullscreen />` , function (i, ifr) {
			ifr.doSave();
			return true;
		}, {
			title: '重播重审',
			btnMax: true,
			width: 700,
			height: 460,
			buttons: {
				ok: '保存',
				cancel: '取消'
			},
		}) ;
	}
}

export default ReAudit ;