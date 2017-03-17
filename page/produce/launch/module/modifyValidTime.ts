import opg from 'ts/opg.ts';
import Table from "ts/ui/Table";
import Popup from "ts/ui/Popup";

opg.api({
	'modifyTimer!POST': 'produce/asset/updateValidTime'
});

class ValidTimeModifier {
	private static instance :ValidTimeModifier ;

	private popWinJq: JQuery;
	private popWin: Popup;

	constructor(id: string, title: string, row , srcTable?:Table) {
		this.popWinJq = $(`<div style="padding: 20px;"><table class="search-table" style="width: 100%;">
					<colgroup><col><col></colgroup>
					<tr><td class="lead">内容名称</td><td style="width: 360px !important;">
						${title}
						<input type="hidden" name="id" value="${id}">
					</td></tr>
					<tr><td class="lead">生效时间</td><td style="width: 360px !important;">
						<input type="text" name="validTime" value="${row.validTime||''}" readonly>
					</td></tr>
				</table></div>`);

		this.popWinJq.find('[name="validTime"]').datetimepicker({
			timepicker: true,
			closeOnDateSelect: false,
			format: 'Y-m-d H:i:00'
		});

		this.popWin = opg.confirm(this.popWinJq, () => {
			let param = this.popWinJq.fieldsToJson({
				validTime: {
					name: '生效时间',
					require: true,
					type: 'date'
				}
			});

			if (param) {
				console.log(param);
				param.id = +param.id;
				//param.validTime += ':00';
				opg.api.modifyTimer(param, () => {

					row.validTime = param.validTime ;

					if(srcTable){
						srcTable.update();
					}

					this.popWin.close();
				});
			}

			return true;
		}, {
			title: '修改生效时间',
			width: 480,
			height: 200,
		});

	}

	static getInstance(id: string, title: string, validTime?: string = ''):ValidTimeModifier {
		if(!ValidTimeModifier.instance){
			ValidTimeModifier.instance = new ValidTimeModifier(id , title , validTime);
		}
		else{

		}
		return ValidTimeModifier.instance;
	}
}

export default ValidTimeModifier;