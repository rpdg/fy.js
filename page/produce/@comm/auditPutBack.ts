
import PopUp from "ts/ui/Popup";
import Table from "ts/ui/Table.ts";

class AuditPutBack {
	static showWindow( auditStep: 2|4 , orderId: number , title :string , popWin:PopUp , tb :Table) : void {

		let p = opg.popTop(`<iframe src="/page/produce/@comm/auditPutBack/putBack.html?orderId=${orderId}&title=${title}&step=${auditStep}" />`, {
			title: '打回',
			width: 500,
			height: 300,
			buttons: {
				ok: {
					className: 'btn-warning',
					text: '确定',
					onClick: function (i, ifrWin) {
						ifrWin.doPost(p, popWin, tb);
						return true;
					}
				},
				cancel: {
					text: '返回'
				}
			}
		});
	}
}

export default AuditPutBack;