import {AjaxDisplayObject} from 'base';
import {$} from '/es6/util/jquery.plugins';
//import store from '/es6/util/store' ;
var idSeed = 0;

function makeTemplate(sets) {

	var tdTmp = [], render, name, i = 0, l = sets.columns ? sets.columns.length : 0;
	for (let col; i < l , col = sets.columns[i]; i++) {

		if (typeof col.render === 'function') {
			name = col.src + '_render' + (++idSeed);
			render = ':=' + name;
			sets.bindOptions.itemRender[name] = col.render;
		}
		else render = '';

		if (col.cmd) {

			if (col.cmd === 'checkAll') {
				tdTmp[i] = '<td class="text-center"><input type="checkbox" name="chk_' + i + '" value="${' + col.src + render + '}"></td>';
				this.cmd = 'checkAll';
			}
			else {
				tdTmp[i] = '<td class="text-center"><input type="radio" name="chk_' + i + '" value="${' + col.src + render + '}"></td>';
				this.cmd = 'checkOne';
			}
		}
		else {

			var classAlign = "text-" + (col.align ? col.align.toLowerCase() : "center");

			tdTmp[i] = '<td class="' + classAlign + '">${' + col.src + render + '}</td>';
		}
	}

	//console.log('<tr>' + tdTmp.join('') + '</tr>');
	var trSrc;
	if (sets.rows && sets.rows.render) {
		trSrc = sets.rows.src || '___';
		sets.bindOptions.itemRender['__renderTr'] = (val, i, row, attr)=> {
			var cn = sets.rows.render(val, i, row, attr);
			var sn = ( i % 2 ? 'odd' : 'even');
			return sn + ' ' + cn;
		}
	}
	else {
		trSrc = '___';
		sets.bindOptions.itemRender['__renderTr'] = (val, i)=> ( i % 2 ? 'odd' : 'even');
	}

	return '<tr class="${' + trSrc + ':=__renderTr}">' + tdTmp.join('') + '</tr>';

}


function makeTbStructor(tb, sets) {
	var i = 0, l = sets.columns ? sets.columns.length : 0, colCss = [], th = [];
	for (let col; col = sets.columns[i]; i++) {
		if (col.cmd) {
			col.width = col.width || 28;

			if (col.cmd === 'checkAll')
				col.text = '<input type="checkbox" name="' + col.src + '" value="chk_' + i + '">';
			else
				col.text = '<input type="hidden" name="' + col.src + '" value="chk_' + i + '">';
		}

		colCss[i] = "width:" + (col.width ? col.width + "px;" : "auto; ");
		th[i] = '<th style="' + colCss[i] + '">' + (col.text || 'column_' + i) + '</th>';
	}
	var thead = '<thead><tr>' + th.join('') + '</tr></thead>';
	var tfoot = (sets.pagination) ? '<tfoot><tr><td colspan="' + (l || '1') + '"></td></tr></tfoot>' : '';

	tb.append(thead + '<tbody id="' + tb[0].id + '_tbody"></tbody>' + tfoot);
}

var formatJSON = (function () {

	var pattern = /\${(\w*)\}(?!})/g;

	return function (template, json) {
		return template.replace(pattern, function (match, key, value) {
			return json[key];
		});
	}

})();


class Table extends AjaxDisplayObject {

	constructor(jq, cfg) {

		cfg = $.extend({
			bindOptions: {
				itemRender: {}
			},
			resizable: true
		}, cfg);


		super(jq, cfg);

		this.tbody.on('click', 'tr', (evt) => {
			//log($(evt.currentTarget).parents("tr")[0].rowIndex);
			this.selectHandler(evt);
		});
	}

	init(jq, cfg) {


		var isTable = jq[0].tagName === 'TABLE';

		if (isTable) {
			jq.addClass("grid");
			this.table = jq;
		}
		else {
			this.table = $('<table id="' + jq[0].id + '_table" class="grid"></table>');
		}


		this.resizable = cfg.resizable;

		this.bindOptions.template = makeTemplate.call(this, cfg);


		makeTbStructor(this.table, cfg);


		if (!isTable) jq.append(tb);

		this.thead = this.table.find("thead");
		this.cols = cfg.columns.length;
		this.tbody = this.table.find("tbody");
		this.listContainer = this.tbody;


		if (cfg.pagination) {

			var that = this;
			const pageDefaults = {
				link_to: "javascript:void(0)",
				num_edge_entries: 1,
				num_display_entries: 5,
				items_per_page: 10,
				prev_text: "上页",
				next_text: "下页",
				load_first_page: false,
				callback: (pageIndex, paginationContainer)=> {
					that.param.pageIndex = pageIndex;
					that.update(this.param);
					return false;
				}
			};


			if (cfg.pagination.pageSize)
				cfg.pagination.items_per_page = cfg.pagination.pageSize;

			cfg.pagination = $.extend(pageDefaults, cfg.pagination);


			this.pagination = cfg.pagination;

			this.param = $.extend({
				pageIndex: 0,
				pageSize: cfg.pagination.pageSize
			}, cfg.params);
		}

	}

	createHandler(json) {
		if (this.cmd === 'checkAll') {
			this.cmdCheckAll = this.thead.find('th:eq(0)').find('input');
			this.cmdCheckAll.syncCheckBoxGroup('td:eq(0)>:checkbox:enabled', this.tbody.find('tr'));
		}
		else if (this.cmd === 'checkOne') {
			this.cmdCheckOne = this.thead.find('th:eq(0)').find('input:hidden');
		}

		if (this.resizable) {
			this.table.resizableColumns();
		}


		this.created = true;
		if ($.isFunction(this.onCreate)) this.onCreate(json);

		return this;
	}

	bindHandler(json) {
		if (this.pagination) {
			this.makePager(~~json.rowCount);
		}
		if (typeof this.onBind === 'function') this.onBind(json) ;
	}

	updateHandler(json, onceCall) {
		if (this.cmdCheckAll) {
			this.cmdCheckAll.prop("checked", false);
			this.cmdCheckAll.syncCheckBoxGroup('td:eq(0)>:checkbox:enabled', this.tbody.find('tr'));
		}

		if ($.isFunction(this.onUpdate))
			this.onUpdate(json);

		if (onceCall)
			onceCall.call(this, json);

		return this;
	}

	makePager(rowCount) {

		var that = this;

		var pageCount = Math.ceil(rowCount / this.param.pageSize);
		var pageNum = this.param.pageIndex + 1;


		if (this.created) {
			this.pagination.current_page = this.param.pageIndex;
			this.tPager.pagination(rowCount, this.pagination);

			if (this.pagination.showCount) {
				this.pageCounter.html(formatJSON(this.pageTemplate, {rowCount, pageNum, pageCount}));
			}
		}
		else {

			this.tfoot = this.table.find("tfoot td:eq(0)");
			this.tPager = $('<div class="pagination_container"></div>').appendTo(this.tfoot);
			this.tPager.pagination(rowCount, this.pagination);

			this.pageCounter = $('<span></span>');
			this.tPager.after(this.pageCounter);

			if (this.pagination.showCount) {

				if (typeof this.pagination.showCount === "string")
					this.pageTemplate = this.pagination.showCount;
				else
					this.pageTemplate = '共${rowCount}条记录 , 第${pageNum} / ${pageCount}页';

				this.pageCounter.html(formatJSON(this.pageTemplate, {rowCount, pageNum, pageCount}));

			}

			if (this.pagination.customizable) {

				if (!this.pagination.customizable.push)
					this.pagination.customizable = [10, 20, 50];

				var ps = this.pagination.customizable, arq = [];

				for (let q = 0, ql = ps.length; q < ql; q++)
					arq[q] = '<option value="' + ps[q] + '" ' + (ps[q] == this.pagination.pageSize ? 'selected' : '') + '>' + ps[q] + '</option>';

				var pageSelector = $('<select>' + arq.join('') + '</select>');
				this.pageCounter.after($('<label class="pageSelectorLabel">每页</label>').append(pageSelector).append('条'));

				//on change event
				pageSelector.on('change.ops', function () {

					that.pagination.items_per_page = that.param.pageSize = ~~this.options[this.selectedIndex].value;
					that.param.pageIndex = 0;
					that.update(that.param);

					return false;

				});
			}
		}


	}

	getCheckData() {
		if (this.cmdCheckAll || this.cmdCheckOne) {
			var key = (this.cmdCheckAll || this.cmdCheckOne).val(),
				chkBoxes = this.tbody.find("input[name='" + key + "']"),
				rev = this.cmdCheckAll ? [] : null;

			for (var i = 0, l = chkBoxes.length; i < l; i++) {
				if (chkBoxes[i].checked) {
					if (this.cmdCheckOne) return this.data[i];
					else rev.push(this.data[i]);
				}
			}

			return rev;
		}
		else return null;
	}
}


export {Table};
