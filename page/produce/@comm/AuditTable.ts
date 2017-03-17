import opg from 'ts/opg.ts';

function makeExpandingArea(container) {
	let area = container.querySelector('textarea');
	let span = container.querySelector('span');

	area.addEventListener('input', function () {
		span.textContent = area.value;
	}, false);
	span.textContent = area.value;


	// Enable extra CSS
	container.className += " active";
}

let serial: Function = (() => {
	let seed = (new Date()).getTime();

	return (): number => {
		return ++seed;
	}
})();


interface IComment {
	time: number ;
	text: string;
}

class AuditTable {

	public tb: JQuery;

	private _svgPath: string;


	constructor(tbId: string, svgPath: string) {
		this.tb = $(`#${tbId}`);
		this._svgPath = $.detectIE() > 0 ? '' : svgPath;
	}


	//append a comment table row
	appendRow(curTime: number, text?: string = '') :HTMLInputElement {

		let trId = `tr_${serial()}`;
		let row =
			$(`<tr id="${trId}">
				<td class="lead2">
					${opg.format.timeLength(curTime)}
				</td>
				<td>
					<div class="expandingArea ">
						<pre><span></span><br></pre>
						<textarea data-time="${curTime}" placeholder="输入意见">${text}</textarea>
					</div>
				</td>
				<td class="text-center">
					<button class="btn-mini btn-info" data-time="${curTime}" title="从该时间点播放">
						<svg style="width: 8px;height: 8px; fill: currentColor;">
							<use xlink:href="${this._svgPath}#plyr-play"></use>
						</svg>
					</button>
					<button data-tid="${trId}" data-time="${curTime}" class="btn-mini btn-danger">&times;</button>
				</td>
			</tr>`);


		this.tb.append(row);

		makeExpandingArea(row.find('.expandingArea')[0]);

		return row.find('textarea')[0] as HTMLInputElement;
	}


	removeRowById(trId: string) {
		console.log(this.tb.find('tr'), trId);
		$(`#${trId}`).remove();
	}

	removeRowByTime(time: number) {
		console.log(this.tb.find('tr'), time);
		$(`#tr_${$.escapeSelector(time)}`).remove();
	}

	/*removeRow(tr: JQuery) {
	 console.log(this.tb);
	 tr.remove();
	 }*/

	set data(arr: IComment[]) {
		for (let i = 0, l = arr.length; i < l; i++) {
			let cur = arr[i];
			this.appendRow(cur.time, cur.text);
		}
	}

	get data(): IComment[] {

		let arr: IComment[] = [];

		let rows = this.tb.find('textarea');

		for (let tx of rows) {
			let $tx = $(tx);
			let cmt: IComment = {
				time: $tx.data('time'),
				text: $tx.val()
			};
			arr.push(cmt);
		}

		return arr;
	}
}


export {IComment, AuditTable}  ;