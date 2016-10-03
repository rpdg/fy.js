import $ from '$';




/**
 * plugins
 * Created by bestv on 2016/9/13.
 */

;
(function ($) {
	//复选框组作全选全非选的同步checkBox
	$.fn.syncCheckBoxGroup = function (expr, context) {
		var $t = this, $cxt = $(context || document);
		$cxt.on('change', expr, function () {
			var $chks = $(expr, $cxt);
			$t.prop("checked", $chks.filter(':checked').length === $chks.length);
		});
		$t.on('change', function () {
			$(expr, $cxt).prop("checked", this.checked);
		});
		return this;
	};

	$.fn.fieldsToJson = function () {
		var objResult = {}, a, form;

		if (this[0].tagName !== "FORM") {
			var tmp = $('<form/>').append(this.clone());
			form = tmp;
			a = tmp.serializeArray();
			tmp = null;
		}
		else {
			form = this;
			a = this.serializeArray();
		}
		//a = this.serializeArray() ;

		$.each(a, function () {
			var i = this.name.indexOf("[]"),
				isArr = !(i === -1),
				prop = isArr ? this.name.substr(0, i) : this.name,
				val = $.trim(this.value + "") || '';

			if (form.find('[name="' + this.name + '"]').eq(0).attr('type') === 'number') {
				val = parseFloat(val, 10);
			}

			if (objResult[prop]) {
				if (!objResult[prop].push) objResult[prop] = [objResult[prop]];
				objResult[prop].push(val);
			}
			else {
				if (isArr) {
					objResult[prop] = [];
					objResult[prop][0] = val;
				}
				else objResult[prop] = val;
			}
		});

		form = null;
		return objResult;
	};

	$.fn.recheckElement = function (_value) {
		var a = $.isArray(_value) ? _value : [_value];
		var element, isSingleSelector, isDroplist;

		if (this.prop("tagName").toLowerCase() == "select") //// select (droplist)
		{
			element = this[0].options;
			isSingleSelector = (this.attr("type") != "select-multiple");
			isDroplist = true;
		}
		else //// radio or checkbox
		{
			element = this;
			isSingleSelector = (this.attr("type") == "radio");
			isDroplist = false;
		}

		var e, v, b;

		loopElement :
			for (var i = 0, l = element.length; i < l; i++) {
				e = element[i];
				b = false;
				v = e.value;

				searchArray :
					for (var j = 0, f = a.length; j < f; j++) {
						if (v == a[j]) {
							if (isSingleSelector) {
								isDroplist ? (e.selected = true) : (e.checked = true);
								break loopElement;
							}
							else {
								b = true;
								break searchArray;
							}
						}
					}
				// 用于设定新的选中状态，以及清除原来的选中状态
				isDroplist ? (e.selected = b) : (e.checked = b);
			}
		return this;
	};

	$.fn.jsonToFields = function (jsonObject) {
		this.find("input,select,textarea").each(function (index, elem) {

			if (!elem.name) {
				if (elem.id) this.name = this.id;
				else return; //Skip no name no id element
			}

			var elName = elem.name.split('[]')[0];

			var val = jsonObject[elName];

			if (elem.type == "checkbox" || elem.type == "radio") {
				var a = $.isArray(val) ? val : [val];
				for (var i = 0; i < a.length; i++) {
					if (a[i] == elem.value) {
						elem.checked = true;
						break;
					}
				}
			}
			else if (elem.type.indexOf("select-") != -1) {
				$(elem).recheckElement(val);
			}
			else if (elem.tagName.toLowerCase() == "textarea") {
				$(elem).val(val);
			}
			else {
				elem.value = val || '';
			}
		});

		return this;
	};


	/**
	 * Decimal Mask Plugin
	 *
	 * @version 3.1.1
	 *
	 * @licensed MIT <see below>
	 * @licensed GPL <see below>
	 *
	 * @requires jQuery 1.4.x
	 *
	 * @author Stéfano Stypulkowski <http://szanata.com>
	 */
	/**
	 * MIT License
	 * Copyright (c) 2010 Stéfano Stypulkowski
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	/**
	 * GPL LIcense
	 * Copyright (c) 2010 Stéfano Stypulkowski
	 *
	 * This program is free software: you can redistribute it and/or modify it
	 * under the terms of the GNU General Public License as published by the
	 * Free Software Foundation, either version 3 of the License, or
	 * (at your option) any later version.
	 *
	 * This program is distributed in the hope that it will be useful, but
	 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
	 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
	 * for more details.
	 *
	 * You should have received a copy of the GNU General Public License along
	 * with this program. If not, see <http://www.gnu.org/licenses/>.
	 */
	$.fn.decimalMask = function (mask) {

		if (!mask || !mask.match) {
			throw 'decimalMask: you must set the mask string.';
		}

		var
			v,
			neg = /^-/.test(mask) ? '(-)?' : '',
			is = (function () {
				v = mask.match(/[0-9]{1,}/);
				return v !== null ? v[0].length : 0
			})(),
			ds = (function () {
				v = mask.match(/[0-9]{1,}$/);
				return v !== null ? v[0].length : 0
			})(),
			sep = (function () {
				v = mask.match(/,|\./);
				return v !== null ? v[0] : null
			})(),
			events = /.*MSIE 8.*|.*MSIE 7.*|.*MSIE 6.*|.*MSIE 5.*/.test(navigator.userAgent) ? 'keyup propertychange paste' : 'input paste',
			tester = (sep === null)
				? new RegExp('^' + neg + '[0-9]{0,' + is + '}$')
				: new RegExp('^' + neg + '[0-9]{0,' + is + '}' + (sep === '.' ? '\\.' : ',') + '[0-9]{0,' + ds + '}$|^' + neg + '[0-9]{0,' + is + '}' + (sep === '.' ? '\\.' : ',') + '$|^' + neg + '[0-9]{0,' + is + '}$');

		function handler(e) {
			var self = $(e.currentTarget);
			if (self.val() !== e.data.ov) {
				if (!tester.test(self.val())) {
					self.val(e.data.ov);
				}
				e.data.ov = self.val();
			}
		}

		return this.each(function () {
			$(this)
				.attr('maxlength', is + ds + (sep === null ? 0 : 1) + (neg === '' ? 0 : 1 ))
				.val($(this).val() ? $(this).val().replace('.', sep) : $(this).val())
				.on(events, {ov: $(this).val()}, handler);
		});
	};


	// the setting cache for bindUrl and bindList use
	var boundCache = {
		m_Count: 0,
		make: function (sets) {
			//alert('boundCache.make.caller');

			var template = sets.template, cache = {name: template},
				nullShown = sets['nullShown'] || '',
				rnderFns = template.match(/\${\w+(:=)+\w+}/g),
				renderEvalStr = 'row[":index"]=i;';

			if (rnderFns) {
				var _attr, _ndex, keyName;
				for (var fs = 0; fs < rnderFns.length; fs++) {
					_attr = rnderFns[fs].substr(2, rnderFns[fs].length - 3);
					_ndex = _attr.indexOf(":=");
					keyName = _attr.substr(0, _ndex);
					renderEvalStr += "row['" + _attr + "']=scope['" + _attr.substr(_ndex + 2) + "'](row['" + keyName + "'] , i , row ,'" + keyName + "') ;";
				}
			}

			var pattern = /\${(\w*[:]*[=]*\w+)\}(?!})/g,
				//ods = template.match(pattern) ,
				str = template.replace(pattern, function (match, key, i) {
					return '\'+((row[\'' + key + '\']===null||row[\'' + key + '\']===undefined||Infinity===row[\'' + key + '\'])?\'' + nullShown + '\':row[\'' + key + '\'])+\'';
				});

			renderEvalStr += 'var out=\'' + str + '\';return out;';

			//console.warn(renderEvalStr);

			cache["render"] = new Function("row", "i", "scope", renderEvalStr);

			if (sets.mode) cache.mode = sets.mode;
			if (sets.itemRender) cache.itemRender = sets.itemRender;
			if (sets.itemFilter) cache.itemFilter = sets.itemFilter;
			if (sets.onBound) cache.onBound = sets.onBound;
			cache.joiner = sets.joiner || '';
			cache.storeData = !!sets.storeData;
			//cache.nullShown = nullShown ;

			return cache;
		},
		newId: function () {
			return "_Object__id" + this.m_Count++;
		},
		remove: function (id) {
			delete this[id];
		}
	};

	// bindList :
	// 转义用： {{property}}
	// 模板特定内置值  : {:index} 代入当前的nodeIndex，不受filter影响;  {:rowNum} 当前的行序号（此指受filter影响, 运行时产生，未必等于{:index}+1）
	// sets.itemRender : 在每个function可依次传入3个参数： 属性值/当前索引值/当前整个listNode[i]的obj对象，必须返回string
	// sets.itemFilter ：可在每行操作前，先对该 Node 对象做一些预先加工操作, 可接收2个参数 node/index ， 返回node
	//                   也可以用这个对nodeList进行过滤，将满足过滤条件的node，返回false即可，
	//                   后续的node 的{:index}不受过滤影响
	// sets.mode     : append / prepend /after / before / and anyOther or undefined (default) is use html-replace
	// sets.onBound  : [event]
	// sets.joiner : 各个结果的连接字符，默认空
	// sets.storeData : 是否将过滤后的绑定数组保存于jq对象的data("bound-array")当中
	// set.nullShown : 将值为null的属性作何种显示，默认显示为empty string
	$.fn.bindList = function (sets) {
		var _this_ = this[0], cacheId = _this_.id || _this_.uniqueID || (function () {
				_this_.id = boundCache.newId();
				return _this_.id;
			})();

		var cache = boundCache[cacheId] || {},
			template, list, itemRender, itemFilter, mode, storeData, storeArray;

		if (sets.push && sets.slice) {
			// 当先前已经设定过template的时候，
			// 可以只传入一个JSON list作参数以精简代码，
			// 而且render/filter/mode/event 均依照最近一次设定
			list = sets;
			itemRender = cache.itemRender;
			itemFilter = cache.itemFilter;
			mode = cache.mode;
			storeData = cache.storeData;
		}
		else {
			template = sets.template;

			if (template !== undefined && cache["name"] != template) {
				cache = boundCache.make(sets);
				boundCache[cacheId] = cache;
			}

			list = sets.list;
			if (!list || !list.length)
				list = [];
			itemRender = sets.itemRender || cache.itemRender;
			itemFilter = sets.itemFilter || cache.itemFilter;
			mode = sets.mode || cache.mode;
			storeData = !!sets.storeData;
		}

		var scope = itemRender || sets.renderScope || window,
			html = [], i = 0, nb = 0, rowObject,
			useFilter = (typeof(itemFilter) === 'function');

		if (storeData) storeArray = [];

		for (; rowObject = list[i];) {
			//过滤data
			if (useFilter) rowObject = itemFilter(rowObject, i);

			//如果data没有被itemFilter过滤掉
			if (rowObject) {
				//行号
				rowObject[":rowNum"] = ++nb;
				//renderer
				html[i] = cache["render"](rowObject, i, scope);
				//如果要保存过滤后的对象数组
				if (storeData) storeArray.push(rowObject);
			}
			++i;
		}
		switch (mode) {
			case 'append' :
				this.append(html.join(cache["joiner"]));
				break;
			case 'prepend' :
				this.prepend(html.join(cache["joiner"]));
				break;
			case 'after' :
				this.after(html.join(cache["joiner"]));
				break;
			case 'before' :
				this.before(html.join(cache["joiner"]));
				break;
			default :
				if (document.all) this.html(html.join(cache["joiner"])); //IE 对TABLE/TBODY/TR 的innerHTML无法操作
				else  _this_.innerHTML = html.join(cache["joiner"]);
		}
		if (typeof(cache.onBound) === 'function') {
			cache.onBound.call(this, list, sets);
		}

		if (storeData) this.data('bound-array', storeArray);
		return this;
	};



	//https://github.com/gbirke/jquery_pagination
	/**
	 * @class Class for calculating pagination values
	 */
	$.PaginationCalculator = function (maxentries, opts) {
		this.maxentries = maxentries;
		this.opts = opts;
	};

	$.extend($.PaginationCalculator.prototype, {
		/**
		 * Calculate the maximum number of pages
		 * @method
		 * @returns {Number}
		 */
		numPages: function () {
			return Math.ceil(this.maxentries / this.opts.items_per_page);
		},
		/**
		 * Calculate start and end point of pagination links depending on
		 * current_page and num_display_entries.
		 * @returns {Array}
		 */
		getInterval: function (current_page) {
			var ne_half = Math.floor(this.opts.num_display_entries / 2);
			var np = this.numPages();
			var upper_limit = np - this.opts.num_display_entries;
			var start = current_page > ne_half ? Math.max(Math.min(current_page - ne_half, upper_limit), 0) : 0;
			var end = current_page > ne_half ? Math.min(current_page + ne_half + (this.opts.num_display_entries % 2), np) : Math.min(this.opts.num_display_entries, np);
			return {start: start, end: end};
		}
	});

	// Initialize jQuery object container for pagination renderers
	$.PaginationRenderers = {};

	/**
	 * @class Default renderer for rendering pagination links
	 */
	$.PaginationRenderers.defaultRenderer = function (maxentries, opts) {
		this.maxentries = maxentries;
		this.opts = opts;
		this.pc = new $.PaginationCalculator(maxentries, opts);
	};
	$.extend($.PaginationRenderers.defaultRenderer.prototype, {
		/**
		 * Helper function for generating a single link (or a span tag if it's the current page)
		 * @param {Number} page_id The page id for the new item
		 * @param {Number} current_page
		 * @param {Object} appendopts Options for the new item: text and classes
		 * @returns {jQuery} jQuery object containing the link
		 */
		createLink: function (page_id, current_page, appendopts) {
			var lnk, np = this.pc.numPages();
			page_id = page_id < 0 ? 0 : (page_id < np ? page_id : np - 1); // Normalize page id to sane value
			appendopts = $.extend({text: page_id + 1, classes: ""}, appendopts || {});
			if (page_id == current_page) {
				lnk = $("<span class='current'>" + appendopts.text + "</span>");
			}
			else {
				lnk = $("<a>" + appendopts.text + "</a>")
					.attr('href', this.opts.link_to.replace(/__id__/, page_id));
			}
			if (appendopts.classes) {
				lnk.addClass(appendopts.classes);
			}
			if (appendopts.rel) {
				lnk.attr('rel', appendopts.rel);
			}
			lnk.data('page_id', page_id);
			return lnk;
		},
		// Generate a range of numeric links
		appendRange: function (container, current_page, start, end, opts) {
			var i;
			for (i = start; i < end; i++) {
				this.createLink(i, current_page, opts).appendTo(container);
			}
		},
		getLinks: function (current_page, eventHandler) {
			var begin, end,
				interval = this.pc.getInterval(current_page),
				np = this.pc.numPages(),
				fragment = $("<div class='pagination'></div>");

			// Generate "Previous"-Link
			if (this.opts.prev_text && (current_page > 0 || this.opts.prev_show_always)) {
				fragment.append(this.createLink(current_page - 1, current_page, {
					text: this.opts.prev_text,
					classes: "prev",
					rel: "prev"
				}));
			}
			// Generate starting points
			if (interval.start > 0 && this.opts.num_edge_entries > 0) {
				end = Math.min(this.opts.num_edge_entries, interval.start);
				this.appendRange(fragment, current_page, 0, end, {classes: 'sp'});
				if (this.opts.num_edge_entries < interval.start && this.opts.ellipse_text) {
					$("<span>" + this.opts.ellipse_text + "</span>").appendTo(fragment);
				}
			}
			// Generate interval links
			this.appendRange(fragment, current_page, interval.start, interval.end);
			// Generate ending points
			if (interval.end < np && this.opts.num_edge_entries > 0) {
				if (np - this.opts.num_edge_entries > interval.end && this.opts.ellipse_text) {
					$("<span>" + this.opts.ellipse_text + "</span>").appendTo(fragment);
				}
				begin = Math.max(np - this.opts.num_edge_entries, interval.end);
				this.appendRange(fragment, current_page, begin, np, {classes: 'ep'});

			}
			// Generate "Next"-Link
			if (this.opts.next_text && (current_page < np - 1 || this.opts.next_show_always)) {
				fragment.append(this.createLink(current_page + 1, current_page, {
					text: this.opts.next_text,
					classes: "next",
					rel: "next"
				}));
			}
			$('a', fragment).click(eventHandler);
			return fragment;
		}
	});

	// Extend jQuery
	$.fn.pagination = function (maxentries, opts) {

		// Initialize options with default values
		opts = $.extend({
			items_per_page: 10,
			num_display_entries: 11,
			current_page: 0,
			num_edge_entries: 0,
			link_to: "#",
			prev_text: "Prev",
			next_text: "Next",
			ellipse_text: "...",
			prev_show_always: true,
			next_show_always: true,
			renderer: "defaultRenderer",
			show_if_single_page: false,
			load_first_page: true,
			callback: function () {
				return false;
			}
		}, opts || {});

		var containers = this,
			renderer, links, current_page;

		/**
		 * This is the event handling function for the pagination links.
		 * @param {int} page_id The new page number
		 */
		function paginationClickHandler(evt) {
			var links,
				new_current_page = $(evt.target).data('page_id'),
				continuePropagation = selectPage(new_current_page);
			if (!continuePropagation) {
				evt.stopPropagation();
			}
			return continuePropagation;
		}

		/**
		 * This is a utility function for the internal event handlers.
		 * It sets the new current page on the pagination container objects,
		 * generates a new HTMl fragment for the pagination links and calls
		 * the callback function.
		 */
		function selectPage(new_current_page) {
			// update the link display of a all containers
			containers.data('current_page', new_current_page);
			links = renderer.getLinks(new_current_page, paginationClickHandler);
			containers.empty();
			links.appendTo(containers);
			// call the callback and propagate the event if it does not return false
			var continuePropagation = opts.callback(new_current_page, containers);
			return continuePropagation;
		}

		// -----------------------------------
		// Initialize containers
		// -----------------------------------
		current_page = parseInt(opts.current_page, 10);
		containers.data('current_page', current_page);
		// Create a sane value for maxentries and items_per_page
		maxentries = (!maxentries || maxentries < 0) ? 1 : maxentries;
		opts.items_per_page = (!opts.items_per_page || opts.items_per_page < 0) ? 1 : opts.items_per_page;

		if (!$.PaginationRenderers[opts.renderer]) {
			throw new ReferenceError("Pagination renderer '" + opts.renderer + "' was not found in jQuery.PaginationRenderers object.");
		}
		renderer = new $.PaginationRenderers[opts.renderer](maxentries, opts);

		// Attach control events to the DOM elements
		var pc = new $.PaginationCalculator(maxentries, opts);
		var np = pc.numPages();
		containers.off('setPage').on('setPage', {numPages: np}, function (evt, page_id) {
			if (page_id >= 0 && page_id < evt.data.numPages) {
				selectPage(page_id);
				return false;
			}
		});
		containers.off('prevPage').on('prevPage', function (evt) {
			var current_page = $(this).data('current_page');
			if (current_page > 0) {
				selectPage(current_page - 1);
			}
			return false;
		});
		containers.off('nextPage').on('nextPage', {numPages: np}, function (evt) {
			var current_page = $(this).data('current_page');
			if (current_page < evt.data.numPages - 1) {
				selectPage(current_page + 1);
			}
			return false;
		});
		containers.off('currentPage').on('currentPage', function () {
			var current_page = $(this).data('current_page');
			selectPage(current_page);
			return false;
		});

		// When all initialisation is done, draw the links
		links = renderer.getLinks(current_page, paginationClickHandler);
		containers.empty();
		if (np > 1 || opts.show_if_single_page) {
			links.appendTo(containers);
		}
		// call callback function
		if (opts.load_first_page) {
			opts.callback(current_page, containers);
		}
	}; // End of $.fn.pagination block




})($);





/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Sat May 16 2015 19:03:57 GMT+0100 (BST)
 * @version v0.1.0
 * @link http://dobtco.github.io/jquery-resizable-columns/
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _class = require('./class');

	var _class2 = _interopRequireDefault(_class);

	var _constants = require('./constants');

	$.fn.resizableColumns = function (optionsOrMethod) {
		for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			args[_key - 1] = arguments[_key];
		}

		return this.each(function () {
			var $table = $(this);

			var api = $table.data(_constants.DATA_API);
			if (!api) {
				api = new _class2['default']($table, optionsOrMethod);
				$table.data(_constants.DATA_API, api);
			} else if (typeof optionsOrMethod === 'string') {
				return api[optionsOrMethod].apply(api, args);
			}
		});
	};

	$.resizableColumns = _class2['default'];

},{"./class":2,"./constants":3}],2:[function(require,module,exports){
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _constants = require('./constants');

	/**
	 Takes a <table /> element and makes it's columns resizable across both
	 mobile and desktop clients.
	 @class ResizableColumns
	 @param $table {jQuery} jQuery-wrapped <table> element to make resizable
	 @param options {Object} Configuration object
	 **/

	var ResizableColumns = (function () {
		function ResizableColumns($table, options) {
			_classCallCheck(this, ResizableColumns);

			this.ns = '.rc' + this.count++;

			this.options = $.extend({}, ResizableColumns.defaults, options);

			this.$window = $(window);
			this.$ownerDocument = $($table[0].ownerDocument);
			this.$table = $table;

			this.refreshHeaders();
			this.restoreColumnWidths();
			this.syncHandleWidths();

			this.bindEvents(this.$window, 'resize', this.syncHandleWidths.bind(this));

			if (this.options.start) {
				this.bindEvents(this.$table, _constants.EVENT_RESIZE_START, this.options.start);
			}
			if (this.options.resize) {
				this.bindEvents(this.$table, _constants.EVENT_RESIZE, this.options.resize);
			}
			if (this.options.stop) {
				this.bindEvents(this.$table, _constants.EVENT_RESIZE_STOP, this.options.stop);
			}
		}

		_createClass(ResizableColumns, [{
			key: 'refreshHeaders',

			/**
			 Refreshes the headers associated with this instances <table/> element and
			 generates handles for them. Also assigns percentage widths.
			 @method refreshHeaders
			 **/
			value: function refreshHeaders() {
				// Allow the selector to be both a regular selctor string as well as
				// a dynamic callback
				var selector = this.options.selector;
				if (typeof selector === 'function') {
					selector = selector.call(this, this.$table);
				}

				// Select all table headers
				this.$tableHeaders = this.$table.find(selector);

				// Assign percentage widths first, then create drag handles
				this.assignPercentageWidths();
				this.createHandles();
			}
		}, {
			key: 'createHandles',

			/**
			 Creates dummy handle elements for all table header columns
			 @method createHandles
			 **/
			value: function createHandles() {
				var _this = this;

				var ref = this.$handleContainer;
				if (ref != null) {
					ref.remove();
				}

				this.$handleContainer = $('<div class=\'' + _constants.CLASS_HANDLE_CONTAINER + '\' />');
				this.$table.before(this.$handleContainer);

				this.$tableHeaders.each(function (i, el) {
					var $current = _this.$tableHeaders.eq(i);
					var $next = _this.$tableHeaders.eq(i + 1);

					if ($next.length === 0 || $current.is(_constants.SELECTOR_UNRESIZABLE) || $next.is(_constants.SELECTOR_UNRESIZABLE)) {
						return;
					}

					var $handle = $('<div class=\'' + _constants.CLASS_HANDLE + '\' />').data(_constants.DATA_TH, $(el)).appendTo(_this.$handleContainer);
				});

				this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.' + _constants.CLASS_HANDLE, this.onPointerDown.bind(this));
			}
		}, {
			key: 'assignPercentageWidths',

			/**
			 Assigns a percentage width to all columns based on their current pixel width(s)
			 @method assignPercentageWidths
			 **/
			value: function assignPercentageWidths() {
				var _this2 = this;

				this.$tableHeaders.each(function (_, el) {
					var $el = $(el);
					_this2.setWidth($el[0], $el.outerWidth() / _this2.$table.width() * 100);
				});
			}
		}, {
			key: 'syncHandleWidths',

			/**

			 @method syncHandleWidths
			 **/
			value: function syncHandleWidths() {
				var _this3 = this;

				var $container = this.$handleContainer;

				$container.width(this.$table.width());

				$container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
					var $el = $(el);

					var height = _this3.options.resizeFromBody ? _this3.$table.height() : _this3.$table.find('thead').height();
					height -= _this3.$table.find('tfoot').height();

					var left = $el.data(_constants.DATA_TH).outerWidth() + ($el.data(_constants.DATA_TH).offset().left - _this3.$handleContainer.offset().left);

					$el.css({ left: left, height: height });
				});
			}
		}, {
			key: 'saveColumnWidths',

			/**
			 Persists the column widths in localStorage
			 @method saveColumnWidths
			 **/
			value: function saveColumnWidths() {
				var _this4 = this;

				this.$tableHeaders.each(function (_, el) {
					var $el = $(el);

					if (_this4.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
						_this4.options.store.set(_this4.generateColumnId($el), _this4.parseWidth(el));
					}
				});
			}
		}, {
			key: 'restoreColumnWidths',

			/**
			 Retrieves and sets the column widths from localStorage
			 @method restoreColumnWidths
			 **/
			value: function restoreColumnWidths() {
				var _this5 = this;

				this.$tableHeaders.each(function (_, el) {
					var $el = $(el);

					if (_this5.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
						var width = _this5.options.store.get(_this5.generateColumnId($el));

						if (width != null) {
							_this5.setWidth(el, width);
						}
					}
				});
			}
		}, {
			key: 'onPointerDown',

			/**
			 Pointer/mouse down handler
			 @method onPointerDown
			 @param event {Object} Event object associated with the interaction
			 **/
			value: function onPointerDown(event) {
				// Only applies to left-click dragging
				if (event.which !== 1) {
					return;
				}

				// If a previous operation is defined, we missed the last mouseup.
				// Probably gobbled up by user mousing out the window then releasing.
				// We'll simulate a pointerup here prior to it
				if (this.operation) {
					this.onPointerUp(event);
				}

				// Ignore non-resizable columns
				var $currentGrip = $(event.currentTarget);
				if ($currentGrip.is(_constants.SELECTOR_UNRESIZABLE)) {
					return;
				}

				var gripIndex = $currentGrip.index();
				var $leftColumn = this.$tableHeaders.eq(gripIndex).not(_constants.SELECTOR_UNRESIZABLE);
				var $rightColumn = this.$tableHeaders.eq(gripIndex + 1).not(_constants.SELECTOR_UNRESIZABLE);

				var leftWidth = this.parseWidth($leftColumn[0]);
				var rightWidth = this.parseWidth($rightColumn[0]);

				this.operation = {
					$leftColumn: $leftColumn, $rightColumn: $rightColumn, $currentGrip: $currentGrip,

					startX: this.getPointerX(event),

					widths: {
						left: leftWidth,
						right: rightWidth
					},
					newWidths: {
						left: leftWidth,
						right: rightWidth
					}
				};

				this.bindEvents(this.$ownerDocument, ['mousemove', 'touchmove'], this.onPointerMove.bind(this));
				this.bindEvents(this.$ownerDocument, ['mouseup', 'touchend'], this.onPointerUp.bind(this));

				this.$handleContainer.add(this.$table).addClass(_constants.CLASS_TABLE_RESIZING);

				$leftColumn.add($rightColumn).add($currentGrip).addClass(_constants.CLASS_COLUMN_RESIZING);

				this.triggerEvent(_constants.EVENT_RESIZE_START, [$leftColumn, $rightColumn, leftWidth, rightWidth], event);

				event.preventDefault();
			}
		}, {
			key: 'onPointerMove',

			/**
			 Pointer/mouse movement handler
			 @method onPointerMove
			 @param event {Object} Event object associated with the interaction
			 **/
			value: function onPointerMove(event) {
				var op = this.operation;
				if (!this.operation) {
					return;
				}

				// Determine the delta change between start and new mouse position, as a percentage of the table width
				var difference = (this.getPointerX(event) - op.startX) / this.$table.width() * 100;
				if (difference === 0) {
					return;
				}

				var leftColumn = op.$leftColumn[0];
				var rightColumn = op.$rightColumn[0];
				var widthLeft = undefined,
					widthRight = undefined;

				if (difference > 0) {
					widthLeft = this.constrainWidth(op.widths.left + (op.widths.right - op.newWidths.right));
					widthRight = this.constrainWidth(op.widths.right - difference);
				} else if (difference < 0) {
					widthLeft = this.constrainWidth(op.widths.left + difference);
					widthRight = this.constrainWidth(op.widths.right + (op.widths.left - op.newWidths.left));
				}

				if (leftColumn) {
					this.setWidth(leftColumn, widthLeft);
				}
				if (rightColumn) {
					this.setWidth(rightColumn, widthRight);
				}

				op.newWidths.left = widthLeft;
				op.newWidths.right = widthRight;

				return this.triggerEvent(_constants.EVENT_RESIZE, [op.$leftColumn, op.$rightColumn, widthLeft, widthRight], event);
			}
		}, {
			key: 'onPointerUp',

			/**
			 Pointer/mouse release handler
			 @method onPointerUp
			 @param event {Object} Event object associated with the interaction
			 **/
			value: function onPointerUp(event) {
				var op = this.operation;
				if (!this.operation) {
					return;
				}

				this.unbindEvents(this.$ownerDocument, ['mouseup', 'touchend', 'mousemove', 'touchmove']);

				this.$handleContainer.add(this.$table).removeClass(_constants.CLASS_TABLE_RESIZING);

				op.$leftColumn.add(op.$rightColumn).add(op.$currentGrip).removeClass(_constants.CLASS_COLUMN_RESIZING);

				this.syncHandleWidths();
				this.saveColumnWidths();

				this.operation = null;

				return this.triggerEvent(_constants.EVENT_RESIZE_STOP, [op.$leftColumn, op.$rightColumn, op.newWidths.left, op.newWidths.right], event);
			}
		}, {
			key: 'destroy',

			/**
			 Removes all event listeners, data, and added DOM elements. Takes
			 the <table/> element back to how it was, and returns it
			 @method destroy
			 @return {jQuery} Original jQuery-wrapped <table> element
			 **/
			value: function destroy() {
				var $table = this.$table;
				var $handles = this.$handleContainer.find('.' + _constants.CLASS_HANDLE);

				this.unbindEvents(this.$window.add(this.$ownerDocument).add(this.$table).add($handles));

				$handles.removeData(_constants.DATA_TH);
				$table.removeData(_constants.DATA_API);

				this.$handleContainer.remove();
				this.$handleContainer = null;
				this.$tableHeaders = null;
				this.$table = null;

				return $table;
			}
		}, {
			key: 'bindEvents',

			/**
			 Binds given events for this instance to the given target DOMElement
			 @private
			 @method bindEvents
			 @param target {jQuery} jQuery-wrapped DOMElement to bind events to
			 @param events {String|Array} Event name (or array of) to bind
			 @param selectorOrCallback {String|Function} Selector string or callback
			 @param [callback] {Function} Callback method
			 **/
			value: function bindEvents($target, events, selectorOrCallback, callback) {
				if (typeof events === 'string') {
					events = events + this.ns;
				} else {
					events = events.join(this.ns + ' ') + this.ns;
				}

				if (arguments.length > 3) {
					$target.on(events, selectorOrCallback, callback);
				} else {
					$target.on(events, selectorOrCallback);
				}
			}
		}, {
			key: 'unbindEvents',

			/**
			 Unbinds events specific to this instance from the given target DOMElement
			 @private
			 @method unbindEvents
			 @param target {jQuery} jQuery-wrapped DOMElement to unbind events from
			 @param events {String|Array} Event name (or array of) to unbind
			 **/
			value: function unbindEvents($target, events) {
				if (typeof events === 'string') {
					events = events + this.ns;
				} else if (events != null) {
					events = events.join(this.ns + ' ') + this.ns;
				} else {
					events = this.ns;
				}

				$target.off(events);
			}
		}, {
			key: 'triggerEvent',

			/**
			 Triggers an event on the <table/> element for a given type with given
			 arguments, also setting and allowing access to the originalEvent if
			 given. Returns the result of the triggered event.
			 @private
			 @method triggerEvent
			 @param type {String} Event name
			 @param args {Array} Array of arguments to pass through
			 @param [originalEvent] If given, is set on the event object
			 @return {Mixed} Result of the event trigger action
			 **/
			value: function triggerEvent(type, args, originalEvent) {
				var event = $.Event(type);
				if (event.originalEvent) {
					event.originalEvent = $.extend({}, originalEvent);
				}

				return this.$table.trigger(event, [this].concat(args || []));
			}
		}, {
			key: 'generateColumnId',

			/**
			 Calculates a unique column ID for a given column DOMElement
			 @private
			 @method generateColumnId
			 @param $el {jQuery} jQuery-wrapped column element
			 @return {String} Column ID
			 **/
			value: function generateColumnId($el) {
				return this.$table.data(_constants.DATA_COLUMNS_ID) + '-' + $el.data(_constants.DATA_COLUMN_ID);
			}
		}, {
			key: 'parseWidth',

			/**
			 Parses a given DOMElement's width into a float
			 @private
			 @method parseWidth
			 @param element {DOMElement} Element to get width of
			 @return {Number} Element's width as a float
			 **/
			value: function parseWidth(element) {
				return element ? parseFloat(element.style.width.replace('%', '')) : 0;
			}
		}, {
			key: 'setWidth',

			/**
			 Sets the percentage width of a given DOMElement
			 @private
			 @method setWidth
			 @param element {DOMElement} Element to set width on
			 @param width {Number} Width, as a percentage, to set
			 **/
			value: function setWidth(element, width) {
				width = width.toFixed(5);
				width = width > 0 ? width : 0;
				element.style.width = width + '%';
			}
		}, {
			key: 'constrainWidth',

			/**
			 Constrains a given width to the minimum and maximum ranges defined in
			 the `minWidth` and `maxWidth` configuration options, respectively.
			 @private
			 @method constrainWidth
			 @param width {Number} Width to constrain
			 @return {Number} Constrained width
			 **/
			value: function constrainWidth(width) {
				if (this.options.minWidth != undefined) {
					width = Math.max(this.options.minWidth, width);
				}

				if (this.options.maxWidth != undefined) {
					width = Math.min(this.options.maxWidth, width);
				}

				return width;
			}
		}, {
			key: 'getPointerX',

			/**
			 Given a particular Event object, retrieves the current pointer offset along
			 the horizontal direction. Accounts for both regular mouse clicks as well as
			 pointer-like systems (mobiles, tablets etc.)
			 @private
			 @method getPointerX
			 @param event {Object} Event object associated with the interaction
			 @return {Number} Horizontal pointer offset
			 **/
			value: function getPointerX(event) {
				if (event.type.indexOf('touch') === 0) {
					return (event.originalEvent.touches[0] || event.originalEvent.changedTouches[0]).pageX;
				}
				return event.pageX;
			}
		}]);

		return ResizableColumns;
	})();

	exports['default'] = ResizableColumns;

	ResizableColumns.defaults = {
		selector: function selector($table) {
			if ($table.find('thead').length) {
				return _constants.SELECTOR_TH;
			}

			return _constants.SELECTOR_TD;
		},
		store: window.store,
		syncHandlers: true,
		resizeFromBody: true,
		maxWidth: null,
		minWidth: 0.01
	};

	ResizableColumns.count = 0;
	module.exports = exports['default'];

},{"./constants":3}],3:[function(require,module,exports){
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	var DATA_API = 'resizableColumns';
	exports.DATA_API = DATA_API;
	var DATA_COLUMNS_ID = 'resizable-columns-id';
	exports.DATA_COLUMNS_ID = DATA_COLUMNS_ID;
	var DATA_COLUMN_ID = 'resizable-column-id';
	exports.DATA_COLUMN_ID = DATA_COLUMN_ID;
	var DATA_TH = 'th';

	exports.DATA_TH = DATA_TH;
	var CLASS_TABLE_RESIZING = 'rc-table-resizing';
	exports.CLASS_TABLE_RESIZING = CLASS_TABLE_RESIZING;
	var CLASS_COLUMN_RESIZING = 'rc-column-resizing';
	exports.CLASS_COLUMN_RESIZING = CLASS_COLUMN_RESIZING;
	var CLASS_HANDLE = 'rc-handle';
	exports.CLASS_HANDLE = CLASS_HANDLE;
	var CLASS_HANDLE_CONTAINER = 'rc-handle-container';

	exports.CLASS_HANDLE_CONTAINER = CLASS_HANDLE_CONTAINER;
	var EVENT_RESIZE_START = 'column:resize:start';
	exports.EVENT_RESIZE_START = EVENT_RESIZE_START;
	var EVENT_RESIZE = 'column:resize';
	exports.EVENT_RESIZE = EVENT_RESIZE;
	var EVENT_RESIZE_STOP = 'column:resize:stop';

	exports.EVENT_RESIZE_STOP = EVENT_RESIZE_STOP;
	var SELECTOR_TH = 'tr:first > th:visible';
	exports.SELECTOR_TH = SELECTOR_TH;
	var SELECTOR_TD = 'tr:first > td:visible';
	exports.SELECTOR_TD = SELECTOR_TD;
	var SELECTOR_UNRESIZABLE = '[data-noresize]';
	exports.SELECTOR_UNRESIZABLE = SELECTOR_UNRESIZABLE;

},{}],4:[function(require,module,exports){
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _class = require('./class');

	var _class2 = _interopRequireDefault(_class);

	var _adapter = require('./adapter');

	var _adapter2 = _interopRequireDefault(_adapter);

	exports['default'] = _class2['default'];
	module.exports = exports['default'];

},{"./adapter":1,"./class":2}]},{},[4]);



export {$};