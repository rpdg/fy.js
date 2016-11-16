//translate seconds to formatted string
function formatTime(time: number): string {
	// Fallback to 0
	if (isNaN(time)) {
		time = 0;
	}


	let secs = parseInt(time % 60);
	let mins = parseInt((time / 60));
	//let hours = parseInt(((time / 60) / 60) % 60);

	// Do we need to display hours?
	//let displayHours = (parseInt(((duration / 60) / 60) % 60) > 0);

	// Ensure it's two digits. For example, 03 rather than 3.
	let secsStr = ('0' + secs).slice(-2);
	let minsStr = ('0' + mins).slice(-2);

	// Render
	//return (displayHours ? hours + ':' : '') + mins + ':' + secs;

	return `${minsStr}:${secsStr}`;
}

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
	let seed = 0;

	return (): number => {
		return ++seed;
	}
})();


interface DataVO {
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
	appendRow(curTime: number, text?: string = '') {

		let trId = `tr_${serial()}`;
		let row = $(`<tr id="${trId}">
				<td class="lead">
					${formatTime(curTime)}
				</td>
				<td>
					<div class="expandingArea ">
						<pre><span></span><br></pre>
						<textarea data-time="${curTime}" placeholder="输入意见">${text}</textarea>
					</div>
				</td>
				<td class="text-center">
					<button class="btn-mini btn-info" data-time="${curTime}" title="跳转到此处">
						<svg style="width: 8px;height: 8px; fill: currentColor;">
							<use xlink:href="${this._svgPath}#plyr-play"></use>
						</svg>
					</button>
					<button data-tid="${trId}" data-time="${curTime}" class="btn-mini btn-danger">&times;</button>
				</td>
			</tr>`);

		this.tb.append(row);

		makeExpandingArea(row.find('.expandingArea')[0]);
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

	set data(arr: DataVO[]) {
		for (let i = 0, l = arr.length; i < l; i++) {
			let cur = arr[i];
			this.appendRow(cur.time, cur.text);
		}
	}

	get data(): DataVO[] {
		let arr = [];
		let rows = this.tb.find('textarea');

		for (let tx of rows) {
			let $tx = $(tx);
			arr.push({
				time: $tx.data('time'),
				text: $tx.val()
			});
		}

		return arr;
	}
}


export default AuditTable ;