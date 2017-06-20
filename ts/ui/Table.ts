import {AjaxDisplayObject, DisplayObject} from './DisplayOject';
import {format} from 'ts/util/utils';

function makeTemplate(sets) {

	let tdTmp = [], render, name, i = 0, l = sets.columns ? sets.columns.length : 0;
	for (let col; i < l , col = sets.columns[i]; i++) {

		if (typeof col.render === 'function') {
			name = col.src + '_render' + DisplayObject.guid();
			render = ':=' + name;
			sets.bindOptions.itemRender[name] = col.render;
		}
		else render = '';

		if (col.cmd) {

			if (col.cmd === 'checkAll') {
				tdTmp[i] = '<td class="text-center"><input type="checkbox" name="chk_' + i + '" value="${' + col.src + render + '}"></td>';
			}
			else {
				tdTmp[i] = '<td class="text-center"><input type="radio" name="chk_' + i + '" value="${' + col.src + render + '}"></td>';
			}

			if (!this.cmd) {
				this.cmd = col.cmd;
				this.cmdColumnIndex = i;
			}
		}
		else {

			let classAlign = "text-" + (col.align ? col.align.toLowerCase() : "center");

			tdTmp[i] = '<td class="' + classAlign + '">${' + col.src + render + '}</td>';
		}
	}

	//console.log('<tr>' + tdTmp.join('') + '</tr>');
	let trSrc;
	if (sets.rows && sets.rows.render) {
		trSrc = sets.rows.src || '___';
		sets.bindOptions.itemRender['__renderTr'] = (val , i, row , attr) => {
			let cn = sets.rows.render(val , i, row, attr) || '' ;
			let sn = ( i % 2 ? 'odd' : 'even');
			return sn + ' ' + cn;
		}
	}
	else {
		trSrc = '___';
		sets.bindOptions.itemRender['__renderTr'] = (val , i) => ( i % 2 ? 'odd' : 'even');
	}

	return '<tr class="${' + trSrc + ':=__renderTr}">' + tdTmp.join('') + '</tr>';

}


function makeTbStructor(tb, sets) {
	let i = 0, l = sets.columns ? sets.columns.length : 0, colCss = [], th = [];
	for (let col; col = sets.columns[i]; i++) {
		if (col.cmd) {
			col.width = col.width || 32;

			if (col.cmd === 'checkAll')
				col.text = '<input type="checkbox" name="' + col.src + '" value="chk_' + i + '">';
			else
				col.text = '<input type="hidden" name="' + col.src + '" value="chk_' + i + '">';
		}

		colCss[i] = "width:" + (col.width ? col.width + "px;" : "auto; ");
		th[i] = '<th style="' + colCss[i] + '">' + (col.text || 'column_' + i) + '</th>';
	}
	let thead = '<thead><tr>' + th.join('') + '</tr></thead>';
	let tfoot = (sets.pagination) ? '<tfoot><tr><td colspan="' + (l || '1') + '"></td></tr></tfoot>' : '';

	tb.prepend(thead + '<tbody id="' + tb[0].id + '_tbody"></tbody>' + tfoot);
}

function setupTitleBar(tb, sets) {
	let html = `<div class="grid-title-bar">
		${sets.title}
	</div>`, bar = $(html);

	let btns = ``;
	if (sets.buttons && sets.buttons.length) {
		for (let i = 0, l = sets.buttons.length; i < l; i++) {
			let btn = sets.buttons[i];
			btns += `<button id="${btn.id}" class="${btn.className}">${btn.html}</button>`;
		}

		bar.append(btns);
	}

	tb.before(bar);
}


class Table extends AjaxDisplayObject {

	table: JQuery;
	thead: JQuery;
	tbody: JQuery;
	tfoot?: JQuery;
	tPager?: JQuery;
	pageCounter?: JQuery;
	iptPageGo?: JQuery;

	cols: number;

	resizable?: boolean;

	cmd?: 'checkOne' | 'checkAll';
	cmdColumnIndex?: number;
	cmdCheckAll?: JQuery;
	cmdCheckOne?: JQuery;

	pageTemplate?: string;
	pagination?: Pagination;

	private pageCount: number;

	constructor(jq: JQuery, cfg: any) {

		cfg = $.extend({
			bindOptions: {
				itemRender: {}
			},
			resizable: true
		}, cfg);


		super(jq, cfg);

	}

	init(jq: JQuery, cfg: any) {

		super.init(jq, cfg);

		let isTable = jq[0].tagName === 'TABLE';

		if (isTable) {
			jq.addClass("grid");
			this.table = jq;
		}
		else {
			this.table = $('<table id="' + jq[0].id + '_table" class="grid"></table>');
		}


		this.resizable = cfg.resizable;

		this._bindOption.template = makeTemplate.call(this, cfg);


		makeTbStructor(this.table, cfg);

		if (cfg.titleBar) setupTitleBar(this.table, cfg.titleBar);


		if (!isTable) jq.append(this.table);

		this.thead = this.table.find("thead");
		this.cols = cfg.columns.length;
		this.tbody = this.table.find("tbody");
		this.container = this.tbody;


		this.tbody.on('click', 'tr', (evt) => {
			//log($(evt.currentTarget).parents("tr")[0].rowIndex);
			this.selectHandler(evt);
		});


		if (this.resizable) {
			this.table.resizableColumns({//refreshHeaders
				minWidth: 1
			});
		}


		if (cfg.pagination) {

			let that = this;
			const pageDefaults = {
				append_number_input : true ,
				link_to: "javascript:void(0)",
				num_edge_entries: 1,
				num_display_entries: 5,
				items_per_page: 10,
				prev_text: "上页",
				next_text: "下页",
				load_first_page: false,
				callback: (pageIndex, paginationContainer) => {
					that._param.pageNo = pageIndex + 1;
					that.update(this._param);
					//that.iptPageGo.val(that._param.pageNo);
					return false;
				},
				pageSize: 10,
				showCount: true,
				customizable: true,
			};


			if (cfg.pagination.pageSize)
				cfg.pagination.items_per_page = cfg.pagination.pageSize;

			cfg.pagination = $.extend(pageDefaults, cfg.pagination);


			this.pagination = cfg.pagination;

			this._param = $.extend({
				pageNo: 1,
				pageSize: cfg.pagination.pageSize
			}, cfg._params);
		}

	}

	createdHandler(data: any) {
		if (this.cmd === 'checkAll') {
			this.cmdCheckAll = this.thead.find('th:eq(' + this.cmdColumnIndex + ')').find('input');
			this.cmdCheckAll.syncCheckBoxGroup('td:eq(' + this.cmdColumnIndex + ')>:checkbox:enabled', this.tbody.find('tr'));
		}
		else if (this.cmd === 'checkOne') {
			this.cmdCheckOne = this.thead.find('th:eq(' + this.cmdColumnIndex + ')').find('input:hidden');
		}


		this._created = true;

		if (this._createdPromise) {
			this._createdPromise.resolve();
		}
		if (this.onCreate) this.onCreate(data);
	}

	bindHandler(json) {
		if (this.pagination) {
			this.makePager(~~json.totalRecord);
		}
		if (typeof this.onBind === 'function') this.onBind(json);
	}

	updateHandler(json) {
		if (this.cmdCheckAll) {
			this.cmdCheckAll.prop("checked", false);
			this.cmdCheckAll.syncCheckBoxGroup('td:eq(' + this.cmdColumnIndex + ')>:checkbox:enabled', this.tbody.find('tr'));
		}


		if ($.isFunction(this.onUpdate))
			this.onUpdate(json);


		return this;
	}

	//分页
	makePager(rowCount) {

		let that = this;

		let pageCount = Math.ceil(rowCount / this._param.pageSize);
		if (pageCount === 0) pageCount = 1;

		if (this._param.pageNo > 1 && pageCount < this.pageCount) {
			this._param.pageNo -= (this.pageCount - pageCount);
			return setTimeout(() => this.update(), 10);
		}

		this.pageCount = pageCount;
		let pageNum = this._param.pageNo;

		if (this.tPager) {
			this.pagination.current_page = this._param.pageNo - 1;
			this.tPager.pagination(rowCount, this.pagination);

			if (this.pagination.showCount) {
				//this.pageCounter.html(format.json(this.pageTemplate, {rowCount, pageNum, pageCount}));

				this.pageCounter.find('.bt').text(rowCount);
				//this.iptPageGo.val(pageNum).data('total' , pageCount);
				this.pageCounter.find('.bc').text(pageCount);
			}
		}
		else {

			this.tfoot = this.table.find("tfoot td:eq(0)");
			this.tPager = $('<div class="pagination_container"></div>').appendTo(this.tfoot);
			this.tPager.pagination(rowCount, this.pagination);


			this.iptPageGo = this.tfoot.find('.iptPageGo');
			this.pagination.append_number_input = this.iptPageGo ;

			this.pageCounter = $('<span></span>');
			this.tPager.after(this.pageCounter);

			if (this.pagination.showCount) {

				if (typeof this.pagination.showCount === "string")
					this.pageTemplate = this.pagination.showCount as string;
				else
					this.pageTemplate = '共<span class="bt">${rowCount}</span>条记录 , 第<span class="bf">${pageNum}</span> / <span class="bc">${pageCount}</span>页';

				this.pageCounter.html(format.json(this.pageTemplate, {rowCount, pageNum, pageCount}));

				let bf = this.pageCounter.find('.bf');
				this.iptPageGo.val(pageNum);//.data('total' , pageCount);
				bf.replaceWith(this.iptPageGo);
			}

			if (this.pagination.customizable) {

				if (typeof this.pagination.customizable != 'object')
					this.pagination.customizable = [10, 20, 50];

				let ps = this.pagination.customizable as Array, arq = [];

				for (let q = 0, ql = ps.length; q < ql; q++)
					arq[q] = '<option value="' + ps[q] + '" ' + (ps[q] == this.pagination.pageSize ? 'selected' : '') + '>' + ps[q] + '</option>';

				let pageSelector = $('<select>' + arq.join('') + '</select>');
				this.pageCounter.after($('<label class="pageSelectorLabel">每页</label>').append(pageSelector).append('条'));

				//on change event
				pageSelector.on('change.opg', function () {

					that.pagination.items_per_page = that._param.pageSize = ~~(this.options[this.selectedIndex] as HTMLOptionElement).value;
					that._param.pageNo = 1;
					that.update(that._param);

					return false;

				});
			}
		}


	}

	//@return object array
	getCheckData() {
		if (this.cmd) {
			let key = (this.cmdCheckAll || this.cmdCheckOne).val(),
				chkBoxes = this.tbody.find("input[name='" + key + "']"),
				rev = this.cmdCheckAll ? [] : null;

			for (let i = 0, l = chkBoxes.length; i < l; i++) {
				if ((chkBoxes[i] as HTMLInputElement).checked) {
					if (this.cmdCheckOne)
						return this.data[i];
					else
						rev.push(this.data[i]);
				}
			}

			return rev;
		}
		else
			return null;
	}

	//@return string value array
	getCheckedValue() {
		if (this.cmd) {
			let key = (this.cmdCheckAll || this.cmdCheckOne).val(),
				chkBoxes = this.tbody.find("input[name='" + key + "']:checked");
			let rev;

			if (this.cmdCheckAll) {
				rev = [];
				chkBoxes.each((i, elem: HTMLInputElement) => {
					rev.push(elem.value);
				});
			}
			else {
				rev = chkBoxes.length ? chkBoxes.val() : null;
			}

			return rev;
		}
		else
			return null;
	}
}


export default Table;
