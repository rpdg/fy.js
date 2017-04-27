import opg from 'ts/opg.ts';
import Popup from "ts/ui/Popup";
import Table from "ts/ui/Table";


class AddEpisode{
	constructor(row, tb: Table , parentWin:Window){
		console.dir(row);
		let pop :Popup = top.opg.confirm(`<iframe src="/page/produce/launch/module/addEpisode/add.html?assetId=${row.id}" allowfullscreen />` , function (i, ifr) {
			ifr.doSave(pop, tb , parentWin);
			return true;
		}, {
			title: '添加剧集',
			btnMax: true,
			width: 900,
			height: 500,
			buttons: {
				ok: '保存',
				cancel: '取消'
			},
		}).toggle();
	}
}

export default AddEpisode;