import opg from 'ts/opg.ts';
import Popup from "ts/ui/Popup";


class AddEpisode{
	constructor(id){
		let pop :Popup = top.opg.confirm(`<iframe src="/page/produce/launch/module/addEpisode/add.html?assetId=${id}" allowfullscreen />` , function (i, ifr) {
			ifr.doSave();
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