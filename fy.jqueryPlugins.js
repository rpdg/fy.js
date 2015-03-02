// Textarea and select clone() bug workaround | Spencer Tipping
// Licensed under the terms of the MIT source code license

// Motivation.
// jQuery's clone() method works in most cases, but it fails to copy the value of textareas and select elements. This patch replaces jQuery's clone() method with a wrapper that fills in the
// values after the fact.

// An interesting error case submitted by Piotr Przybył: If two <select> options had the same value, the clone() method would select the wrong one in the cloned box. The fix, suggested by Piotr
// and implemented here, is to use the selectedIndex property on the <select> box itself rather than relying on jQuery's value-based val().

(function (original) {
	jQuery.fn.clone = function () {
			var result          = original.apply(this, arguments),
				my_textareas    = this.find('textarea').add(this.filter('textarea')),
				result_textareas= result.find('textarea').add(result.filter('textarea')),
				my_selects      = this.find('select').add(this.filter('select')),
				result_selects  = result.find('select').add(result.filter('select'));

		for (var i = 0, l = my_textareas.length; i < l; ++i) $(result_textareas[i]).val($(my_textareas[i]).val());
		for (var i = 0, l = my_selects.length;   i < l; ++i) result_selects[i].selectedIndex = my_selects[i].selectedIndex;

		return result;
	};
})(jQuery.fn.clone);

/*
 * FormController - jQuery plugin to access HTML form controllers
 *
 *
 * Copyright (c) 2011 Lyu Pengfei, lyu1975@gmail.com
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Tested passed under jQuery v1.6+
 * to use under v1.6 , simply replace all prop(...) with attr(...)
 */

;
(function (jQuery) {
	jQuery.fn.extend({
		//复选框组作全选全非选的同步checkBox
		syncCheckBoxGroup:function (expr , conext) {
			var $t = $(this) ;
			jQuery(conext||document).on("change", expr, function () {
				//关联的checkbox可能是在绑定后再动态生成，
				//所以每次都重新选择一次 $chks
				var $chks = jQuery(expr , conext||document) , size = $chks.length ;
				$t.prop("checked", $chks.filter(':checked').length === size );
			});
			$t.change(function () {
				jQuery(expr , conext||document).prop("checked", this.checked);
			});
			return this;
		},

		//input框的默认提示
		labelledInput:function (settings) {
			var settings = jQuery.extend({
				text:"key words",
				labelledClass:"fLightgray"
			}, settings);
			return this.each(function () {
				jQuery(this).val(settings.text).addClass(settings.labelledClass)
					.focus(function () {
						if (jQuery(this).val() == settings.text) {
							jQuery(this).val("").removeClass(settings.labelledClass);
						}
					})
					.blur(function () {
						if (jQuery.trim(jQuery(this).val()) == "") {
							jQuery(this).val(settings.text).addClass(settings.labelledClass);
						}
					});
			});
		},
		//
		fieldsToJson:function() {
			var o = {} , a, form ;

			if (this[0].tagName !== "FORM") {
				var tmp = $('<form/>').append(this.clone());
				form = tmp ;
				a = tmp.serializeArray();
				tmp = null ;
			}
			else {
				form = this ;
				a = this.serializeArray();
			}
			//a = this.serializeArray() ;

			jQuery.each(a, function() {
				var i = this.name.indexOf("[]") ,
					isArr = !(i===-1) ,
					prop = isArr? this.name.substr(0,i) : this.name ,
					val = jQuery.trim(this.value + "") || '' ;

				if(form.find('[name="'+this.name+'"]').eq(0).attr('type')==='number'){
					val = parseFloat(val , 10) ;
				}

				if (o[prop]) {
					if (!o[prop].push) o[prop] = [o[prop]];
					o[prop].push(val);
				}
				else {
					if(isArr) {
						o[prop] = [] ;
						o[prop][0] = val ;
					}
					else o[prop] = val ;
				}
			});

			form = null;
			return o;
		},
		jsonToFields:function (jsonObject) {
			this.find("input,select,textarea").each(function () {
				if (!this.name) {
					if(this.id) this.name = this.id ;
					else return; //Skip no name no id element
				}

				var elName = this.name.split('[]')[0] ;

				var val = jsonObject[elName];

				if (this.type == "checkbox" || this.type == "radio") {
					var a = jQuery.isArray(val) ? val : [val];
					var v = jQuery.isNumeric(this.value) ? parseInt(this.value, 10) : this.value;
					for (var i = 0; i < a.length; i++) {
						if (a[i] == v) {
							this.checked = true;
							break;
						}
					}
				}
				else if (this.type.indexOf("select-") != -1) {
					jQuery(this).recheckElement(val);
				}
				else if (this.tagName.toLowerCase() == "textarea") {
					$(this).val(val);
				}
				else {
					if (val === undefined || val===null) val = "";
					this.value = val;
				}
			});
			return this;
		},
		//用jQuery 重设 select / checkbox / radio
		//貌似有些bug，暂时用下面 recheckElement
		recheck:function (_val) {
			var a = jQuery.isArray(_val) ? _val : [_val];
			var attribute = this[0].options ? "selected" : "checked";
			var ele = attribute == "selected" ? this[0].options : this;

			return $(ele).prop(attribute, false).filter(function () {
				return (jQuery.inArray(this.value, a) != -1);
			}).prop(attribute, true).end();
		},
		//用DOM 重设 select / checkbox / radio
		recheckElement:function (_value) {
			var a = jQuery.isArray(_value) ? _value : [_value];
			var element , isSingleSelector  , isDroplist;

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

			var e , v , b;

			loopElement :
				for (var i = 0 , l = element.length; i < l; i++) {
					e = element[i];
					b = false;
					v = e.value;

					searchArray :
						for (var j = 0 , f = a.length; j < f; j++) {
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
		}

	});

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
	$.fn.decimalMask = function (mask){

		if (!mask || !mask.match){
			throw 'decimalMask: you must set the mask string.';
		}

		var
			v,
			neg = /^-/.test(mask) ? '(-)?' : '',
			is = (function(){v = mask.match(/[0-9]{1,}/); return v !== null ? v[0].length : 0})(),
			ds = (function(){v = mask.match(/[0-9]{1,}$/); return v !== null ? v[0].length : 0})(),
			sep = (function(){v = mask.match(/,|\./); return v !== null ? v[0] : null})(),
			events = /.*MSIE 8.*|.*MSIE 7.*|.*MSIE 6.*|.*MSIE 5.*/.test(navigator.userAgent) ? 'keyup propertychange paste' : 'input paste',
			tester = (sep === null)
				? new RegExp('^'+neg+'[0-9]{0,'+is+'}$')
				: new RegExp('^'+neg+'[0-9]{0,'+is+'}'+(sep === '.' ? '\\.' : ',')+'[0-9]{0,'+ds+'}$|^'+neg+'[0-9]{0,'+is+'}'+(sep === '.' ? '\\.' : ',')+'$|^'+neg+'[0-9]{0,'+is+'}$');

		function handler(e){
			var self = $(e.currentTarget);
			if (self.val() !== e.data.ov){
				if (!tester.test(self.val())){
					self.val(e.data.ov);
				}
				e.data.ov = self.val();
			}
		}

		return this.each(function (){
			$(this)
				.attr('maxlength', is + ds + (sep === null ? 0 : 1) + (neg === '' ? 0 : 1 ))
				.val($(this).val() ? $(this).val().replace('.',sep) : $(this).val())
				.on(events,{ov:$(this).val()},handler);
		});
	}

})(jQuery);



/*
 Masked Input plugin for jQuery
 Copyright (c) 2007-2013 Josh Bush (digitalbush.com)
 Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
 Version: 1.3.1
 */
(function($) {
	function getPasteEvent() {
		var el = document.createElement('input'),
			name = 'onpaste';
		el.setAttribute(name, '');
		return (typeof el[name] === 'function')?'paste':'input';
	}

	var pasteEventName = getPasteEvent() + ".mask",
		ua = navigator.userAgent,
		iPhone = /iphone/i.test(ua),
		android=/android/i.test(ua),
		caretTimeoutId;

	$.mask = {
		//Predefined character definitions
		definitions: {
			'9': "[0-9]",
			'a': "[A-Za-z]",
			'*': "[A-Za-z0-9]"
		},
		dataName: "rawMaskFn",
		placeholder: '_'
	};

	$.fn.extend({
		//Helper Function for Caret positioning
		caret: function(begin, end) {
			var range;

			if (this.length === 0 || this.is(":hidden")) {
				return;
			}

			if (typeof begin == 'number') {
				end = (typeof end === 'number') ? end : begin;
				return this.each(function() {
					if (this.setSelectionRange) {
						this.setSelectionRange(begin, end);
					} else if (this.createTextRange) {
						range = this.createTextRange();
						range.collapse(true);
						range.moveEnd('character', end);
						range.moveStart('character', begin);
						range.select();
					}
				});
			} else {
				if (this[0].setSelectionRange) {
					begin = this[0].selectionStart;
					end = this[0].selectionEnd;
				} else if (document.selection && document.selection.createRange) {
					range = document.selection.createRange();
					begin = 0 - range.duplicate().moveStart('character', -100000);
					end = begin + range.text.length;
				}
				return { begin: begin, end: end };
			}
		},
		unmask: function() {
			return this.trigger("unmask");
		},
		mask: function(mask, settings) {
			var input,
				defs,
				tests,
				partialPosition,
				firstNonMaskPos,
				len;

			if (!mask && this.length > 0) {
				input = $(this[0]);
				return input.data($.mask.dataName)();
			}
			settings = $.extend({
				placeholder: $.mask.placeholder, // Load default placeholder
				completed: null
			}, settings);


			defs = $.mask.definitions;
			tests = [];
			partialPosition = len = mask.length;
			firstNonMaskPos = null;

			$.each(mask.split(""), function(i, c) {
				if (c == '?') {
					len--;
					partialPosition = i;
				} else if (defs[c]) {
					tests.push(new RegExp(defs[c]));
					if (firstNonMaskPos === null) {
						firstNonMaskPos = tests.length - 1;
					}
				} else {
					tests.push(null);
				}
			});

			return this.trigger("unmask").each(function() {
				var input = $(this),
					buffer = $.map(
						mask.split(""),
						function(c, i) {
							if (c != '?') {
								return defs[c] ? settings.placeholder : c;
							}
						}),
					focusText = input.val();

				function seekNext(pos) {
					while (++pos < len && !tests[pos]);
					return pos;
				}

				function seekPrev(pos) {
					while (--pos >= 0 && !tests[pos]);
					return pos;
				}

				function shiftL(begin,end) {
					var i,
						j;

					if (begin<0) {
						return;
					}

					for (i = begin, j = seekNext(end); i < len; i++) {
						if (tests[i]) {
							if (j < len && tests[i].test(buffer[j])) {
								buffer[i] = buffer[j];
								buffer[j] = settings.placeholder;
							} else {
								break;
							}

							j = seekNext(j);
						}
					}
					writeBuffer();
					input.caret(Math.max(firstNonMaskPos, begin));
				}

				function shiftR(pos) {
					var i,
						c,
						j,
						t;

					for (i = pos, c = settings.placeholder; i < len; i++) {
						if (tests[i]) {
							j = seekNext(i);
							t = buffer[i];
							buffer[i] = c;
							if (j < len && tests[j].test(t)) {
								c = t;
							} else {
								break;
							}
						}
					}
				}

				function keydownEvent(e) {
					var k = e.which,
						pos,
						begin,
						end;

					//backspace, delete, and escape get special treatment
					if (k === 8 || k === 46 || (iPhone && k === 127)) {
						pos = input.caret();
						begin = pos.begin;
						end = pos.end;

						if (end - begin === 0) {
							begin=k!==46?seekPrev(begin):(end=seekNext(begin-1));
							end=k===46?seekNext(end):end;
						}
						clearBuffer(begin, end);
						shiftL(begin, end - 1);

						e.preventDefault();
					} else if (k == 27) {//escape
						input.val(focusText);
						input.caret(0, checkVal());
						e.preventDefault();
					}
				}

				function keypressEvent(e) {
					var k = e.which,
						pos = input.caret(),
						p,
						c,
						next;

					if (e.ctrlKey || e.altKey || e.metaKey || k < 32) {//Ignore
						return;
					} else if (k) {
						if (pos.end - pos.begin !== 0){
							clearBuffer(pos.begin, pos.end);
							shiftL(pos.begin, pos.end-1);
						}

						p = seekNext(pos.begin - 1);
						if (p < len) {
							c = String.fromCharCode(k);
							if (tests[p].test(c)) {
								shiftR(p);

								buffer[p] = c;
								writeBuffer();
								next = seekNext(p);

								if(android){
									setTimeout($.proxy($.fn.caret,input,next),0);
								}else{
									input.caret(next);
								}

								if (settings.completed && next >= len) {
									settings.completed.call(input);
								}
							}
						}
						e.preventDefault();
					}
				}

				function clearBuffer(start, end) {
					var i;
					for (i = start; i < end && i < len; i++) {
						if (tests[i]) {
							buffer[i] = settings.placeholder;
						}
					}
				}

				function writeBuffer() { input.val(buffer.join('')); }

				function checkVal(allow) {
					//try to place characters where they belong
					var test = input.val(),
						lastMatch = -1,
						i,
						c;

					for (i = 0, pos = 0; i < len; i++) {
						if (tests[i]) {
							buffer[i] = settings.placeholder;
							while (pos++ < test.length) {
								c = test.charAt(pos - 1);
								if (tests[i].test(c)) {
									buffer[i] = c;
									lastMatch = i;
									break;
								}
							}
							if (pos > test.length) {
								break;
							}
						} else if (buffer[i] === test.charAt(pos) && i !== partialPosition) {
							pos++;
							lastMatch = i;
						}
					}
					if (allow) {
						writeBuffer();
					} else if (lastMatch + 1 < partialPosition) {
						input.val("");
						clearBuffer(0, len);
					} else {
						writeBuffer();
						input.val(input.val().substring(0, lastMatch + 1));
					}
					return (partialPosition ? i : firstNonMaskPos);
				}

				input.data($.mask.dataName,function(){
					return $.map(buffer, function(c, i) {
						return tests[i]&&c!=settings.placeholder ? c : null;
					}).join('');
				});

				if (!input.attr("readonly"))
					input
						.one("unmask", function() {
							input
								.unbind(".mask")
								.removeData($.mask.dataName);
						})
						.bind("focus.mask", function() {
							clearTimeout(caretTimeoutId);
							var pos,
								moveCaret;

							focusText = input.val();
							pos = checkVal();

							caretTimeoutId = setTimeout(function(){
								writeBuffer();
								if (pos == mask.length) {
									input.caret(0, pos);
								} else {
									input.caret(pos);
								}
							}, 10);
						})
						.bind("blur.mask", function() {
							checkVal();
							if (input.val() != focusText)
								input.change();
						})
						.bind("keydown.mask", keydownEvent)
						.bind("keypress.mask", keypressEvent)
						.bind(pasteEventName, function() {
							setTimeout(function() {
								var pos=checkVal(true);
								input.caret(pos);
								if (settings.completed && pos == input.val().length)
									settings.completed.call(input);
							}, 0);
						});
				checkVal(); //Perform initial check for existing values
			});
		}
	});


})(jQuery);



/**
 * bindList - jQuery plugin to bind JSON Array to HTML container
 *
 *
 * Copyright (c) 2013 Lyu Pengfei, lyu1975@gmail.com
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 *
 */
(function(jQuery)
{
	// the setting cache for bindUrl and bindList use
	var boundCache = {
		m_Count:0,
		make:function (sets) {
			//alert('boundCache.make.caller');

			var template = sets.template , cache = { name:template } ,
				nullShown = sets['nullShown'] || '' ;
				pnter = /{\w+(:=)+\w+}/g ,
				rnderFns = template.match(pnter),
				renderEvalStr = 'row[":index"]=i;';

			if (rnderFns) {
				var _attr , _ndex  , keyName ;
				for (var fs = 0; fs < rnderFns.length; fs++) {
					_attr = rnderFns[fs].substr(1 , rnderFns[fs].length-2);
					_ndex = _attr.indexOf(":=");
					keyName = _attr.substr(0, _ndex) ;
					renderEvalStr += "row['" + _attr + "']=scope['" + _attr.substr(_ndex + 2) + "'](row['" + keyName + "'] , i , row ,'"+keyName+"') ;";
				}
			}

			var pattern = /\{(\w*[:]*[=]*\w+)\}(?!})/g ,
				//ods = template.match(pattern) ,
				str = template.replace(pattern, function (match, key, i) {
					return '\'+((row[\'' + key + '\']===null||row[\'' + key + '\']===undefined)?\''+nullShown+'\':row[\'' + key + '\'])+\'' ;
				});

			renderEvalStr += 'var out=\'' + str + '\';return out;';

			//console.warn(renderEvalStr);

			cache["render"] = new Function("row", "i", "scope", renderEvalStr);

			if (sets.mode) cache.mode = sets.mode;
			if (sets.itemRender) cache.itemRender = sets.itemRender;
			if (sets.itemFilter) cache.itemFilter = sets.itemFilter;
			if (sets.onBound) cache.onBound = sets.onBound;
			cache.joiner = sets.joiner || '';
			cache.storeData = !!sets.storeData ;
			//cache.nullShown = nullShown ;

			return cache;
		},
		newId:function () {
			return "_Object__id" + this.m_Count++;
		},
		remove:function (id) {
			delete this[id];
		}
	};

	// bindUrl : depend on jQuery.pagination v2.2+ (if use data-page) & jQuery.bindList
	// url : server address which returns a JSON node list
	// search : the search conditions
	// loader : the loading-animate-jqObj
	// stepRun : boolean value, whether the jq auto fetch the first-page or not
	// pagination : pagination-settings , the page-info placement (jq-obj)  attached
	// renderer : {render.template , render.itemRender , render.itemFilter }  in accord with the bindList-plugin
	// has 4 events:  onInit(jq) / onStart(jq , pageIndex) / onNoRecord(jq , pageIndex) / onComplete(jq , pageIndex)
	// Server returned dataList structure: { data:[...JSON list] , page:{rowCount:int , pageCount , pageSize , pageIndex} }
	var fns = {
		setup: function (sets, jq, cacheId) {
			var cache = boundCache.make(sets.renderer);
			jQuery.extend(sets, cache);

			if (sets.pagination) {
				sets.isRst = true;
				if (!cache.pagination || !set.pagination.callback) {
					sets.pagination.callback = function (__pageIndex, __paginationContainer) {
						var __cache = boundCache[cacheId];
						if (__cache.isRst) __cache.isRst = false;
						else fns.fetchPage(__pageIndex, jq, __cache);
						return false;
					}
				}
			}

			boundCache[cacheId] = sets;

			// run onInit Event function
			if (typeof(sets.onInit) === 'function') {
				sets.onInit.call(jq);
			}

			return !sets.stepRun;
		},

		fetchPage: function (pageIndex, jq, cacheHandler) {
			var cache = (typeof(cacheHandler) === 'string' ? boundCache[cacheHandler] : cacheHandler);
			//alert('cache:====>'+JSON.stringify(cache));

			var loader = cache.loader,
				pagination = cache.pagination,
				search = cache.search || {};

			//prepare a new search
			search.pageIndex = pageIndex || 0;
			//search._r_ = (new Date).getTime() ; // eques to: $.ajaxSetup({ cache : false } );

			if (typeof(cache.onStart) === 'function') {
				cache.onStart.call(jq, search);
			}

			//jq.empty() ;

			if (loader)  loader.show();

			jQuery.getJSON(cache.url, search, function (objs) {
				if (loader) loader.hide();

				var list = objs.data ? objs.data : objs, pageInfo = objs.page;
				if (list.length == 0) {
					if (typeof(cache.onNoRecord) === 'function') {
						cache.onNoRecord.call(jq, search);
					}
					else {
						if (pagination) {
							pagination.placement.text("无符合条件的记录");
						}
					}
				}
				else {
					//var render = cache.renderer;
					//render.list = list ;
					jq.bindList(list);
					//init pagination
					if (pagination && cache.isRst) {
						pagination.placement.pagination(pageInfo.rowCount, pagination);
					}
				}
				//run onComplete-function
				if (typeof(cache.onComplete) === 'function') {
					cache.onComplete.call(jq , objs.data , pageInfo);
				}
			});

			return false;
		},

		reset: function (_, jq, cache) {
			cache.isRst = true;
			return !cache.stepRun;
		},

		setValue: function (vals, jq, cache) {
			jQuery.extend(cache, vals);
			cache.isRst = true;
			return !cache.stepRun;
		}
	};
	jQuery.fn.bindUrl = function (todo, sets) {
		var _fns = fns;
		var fitThis = this[0],
			fitId = fitThis.id || fitThis.uniqueID,
			fitCache;
		if (todo != "setup") {
			fitCache = boundCache[fitId];
		}
		else {
			if (!fitId) {
				fitId = fitThis.id = boundCache.newId();
			}
			fitCache = fitId;
		}
		var _run = _fns[todo] || _fns['fetchPage'];
		if (_run(sets, this, fitCache)) {
			_fns.fetchPage(0, this, fitCache);
		}
		return this;
	};


	// bindList :
	// 转义用： {{property}}
	// 模板特定内置值  : {:index} 代入当前的nodeIndex，不受filter影响;  {:rowNum} 当前的行序号（此指受filter影响, 运行时产生，未必等于{:index}+1）
	// sets.itemRender : 在每个function可依次传入3个参数： 属性值/当前索引值/当前整个listNode[i]的obj对象，必须返回string
	// sets.itemFilter ：可在每行操作前，先对该 Node 对象做一些预先加工操作, 可接收2个参数 node/index ， 返回node
	//                   也可以用这个对nodeList进行过滤，将满足过滤条件的node，返回false即可，
	//					 后续的node 的{:index}不受过滤影响
	// sets.mode     : append / prepend /after / before / and anyOther or undefined (default) is use html-replace
	// sets.onBound  : [event]
	// sets.joiner : 各个结果的连接字符，默认空
	// sets.storeData : 是否将过滤后的绑定数组保存于jq对象的data("bound-array")当中
	// set.nullShown : 将值为null的属性作何种显示，默认显示为empty string
	jQuery.fn.bindList = function (sets) {
		var _this_ = this[0] , cacheId = _this_.id || _this_.uniqueID || (function () {
			_this_.id = boundCache.newId();
			return _this_.id;
		})();

		var cache = boundCache[cacheId] || {} ,
			template , list , itemRender , itemFilter , mode , storeData , storeArray ;

		if (sets.push && sets.slice) {
			// 当先前已经设定过template的时候，
			// 可以只传入一个JSON list作参数以精简代码，
			// 而且render/filter/mode/event 均依照最近一次设定
			list = sets;
			itemRender = cache.itemRender;
			itemFilter = cache.itemFilter;
			mode = cache.mode;
			storeData = cache.storeData ;
		}
		else {
			template = sets.template;

			if(template !== undefined && cache["name"] != template){
				cache = boundCache.make(sets);
				boundCache[cacheId] = cache;
			}

			list = sets.list;
			itemRender = sets.itemRender || cache.itemRender ;
			itemFilter = sets.itemFilter || cache.itemFilter ;
			mode = sets.mode || cache.mode ;
			storeData = !!sets.storeData ;
		}

		var scope = itemRender || window ,
			html = [] , i = 0 , nb = 0 , rowObject ,
			useFilter = (typeof(itemFilter) === 'function')   ;

		if(storeData) storeArray = [] ;

		for (  ; rowObject = list[i] ; ){
			//过滤data
			if(useFilter) rowObject = itemFilter(rowObject , i) ;

			//如果data没有被itemFilter过滤掉
			if (rowObject) {
				//行号
				rowObject[":rowNum"] = ++nb;
				//renderer
				html[i] = cache["render"](rowObject , i , scope);
				//如果要保存过滤后的对象数组
				if(storeData) storeArray.push(rowObject) ;
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
			cache.onBound.call(this , list , sets);
		}

		if(storeData) this.data('bound-array' , storeArray) ;
		return this ;
	};
	//sets 与 bindList 类似
	//sets.lists 是需绑定的n个list的集合
	// [events] onAllComplete(jq)
	// mode: [get/set]Cache
	jQuery.fn.bindLists = function (sets) {
		var cache;
		if (sets.mode === "setCache") cache = sets.cache;
		else  cache = boundCache.make(sets);

		this.each(function (i, o) {
			var cacheId = o.id || o.uniqueID || (function () {
				o.id = boundCache.newId();
				return o.id;
			})();
			boundCache[cacheId] = cache;
		});

		if (jQuery.isArray(sets.lists)) {
			var len = Math.min(this.size(), sets.lists.length);
			for (var j = 0; j < len; j++) {
				sets.list = sets.lists[j];
				this.eq(j).bindList(sets);
			}

			//moved into here 2013-07-25
			if (typeof(sets.onAllComplete) === 'function') {
				sets.onAllComplete.call(this , sets.lists , sets);
			}
		}

		if (sets.mode === "getCache") {
			return cache;
		}
		return this;
	};

})(jQuery);







/**
 * This jQuery plugin displays pagination links inside the selected elements.
 *
 * This plugin needs at least jQuery 1.4.2
 *
 * @author Gabriel Birke (birke *at* d-scribe *dot* de)
 * @version 2.2
 * @param {int} maxentries Number of entries to paginate
 * @param {Object} opts Several options (see README for documentation)
 * @return {Object} jQuery Object
 */
(function($){
	/**
	 * @class Class for calculating pagination values
	 */
	$.PaginationCalculator = function(maxentries, opts) {
		this.maxentries = maxentries;
		this.opts = opts;
	};

	$.extend($.PaginationCalculator.prototype, {
		/**
		 * Calculate the maximum number of pages
		 * @method
		 * @returns {Number}
		 */
		numPages:function() {
			return Math.ceil(this.maxentries/this.opts.items_per_page);
		},
		/**
		 * Calculate start and end point of pagination links depending on
		 * current_page and num_display_entries.
		 * @returns {Array}
		 */
		getInterval:function(current_page)  {
			var ne_half = Math.floor(this.opts.num_display_entries/2);
			var np = this.numPages();
			var upper_limit = np - this.opts.num_display_entries;
			var start = current_page > ne_half ? Math.max( Math.min(current_page - ne_half, upper_limit), 0 ) : 0;
			var end = current_page > ne_half?Math.min(current_page+ne_half + (this.opts.num_display_entries % 2), np):Math.min(this.opts.num_display_entries, np);
			return {start:start, end:end};
		}
	});

	// Initialize jQuery object container for pagination renderers
	$.PaginationRenderers = {};

	/**
	 * @class Default renderer for rendering pagination links
	 */
	$.PaginationRenderers.defaultRenderer = function(maxentries, opts) {
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
		createLink:function(page_id, current_page, appendopts){
			var lnk, np = this.pc.numPages();
			page_id = page_id<0?0:(page_id<np?page_id:np-1); // Normalize page id to sane value
			appendopts = $.extend({text:page_id+1, classes:""}, appendopts||{});
			if(page_id == current_page){
				lnk = $("<span class='current'>" + appendopts.text + "</span>");
			}
			else
			{
				lnk = $("<a>" + appendopts.text + "</a>")
					.attr('href', this.opts.link_to.replace(/__id__/,page_id));
			}
			if(appendopts.classes){ lnk.addClass(appendopts.classes); }
			if(appendopts.rel){ lnk.attr('rel', appendopts.rel); }
			lnk.data('page_id', page_id);
			return lnk;
		},
		// Generate a range of numeric links
		appendRange:function(container, current_page, start, end, opts) {
			var i;
			for(i=start; i<end; i++) {
				this.createLink(i, current_page, opts).appendTo(container);
			}
		},
		getLinks:function(current_page, eventHandler) {
			var begin, end,
				interval = this.pc.getInterval(current_page),
				np = this.pc.numPages(),
				fragment = $("<div class='pagination'></div>");

			// Generate "Previous"-Link
			if(this.opts.prev_text && (current_page > 0 || this.opts.prev_show_always)){
				fragment.append(this.createLink(current_page-1, current_page, {text:this.opts.prev_text, classes:"prev",rel:"prev"}));
			}
			// Generate starting points
			if (interval.start > 0 && this.opts.num_edge_entries > 0)
			{
				end = Math.min(this.opts.num_edge_entries, interval.start);
				this.appendRange(fragment, current_page, 0, end, {classes:'sp'});
				if(this.opts.num_edge_entries < interval.start && this.opts.ellipse_text)
				{
					$("<span>"+this.opts.ellipse_text+"</span>").appendTo(fragment);
				}
			}
			// Generate interval links
			this.appendRange(fragment, current_page, interval.start, interval.end);
			// Generate ending points
			if (interval.end < np && this.opts.num_edge_entries > 0)
			{
				if(np-this.opts.num_edge_entries > interval.end && this.opts.ellipse_text)
				{
					$("<span>"+this.opts.ellipse_text+"</span>").appendTo(fragment);
				}
				begin = Math.max(np-this.opts.num_edge_entries, interval.end);
				this.appendRange(fragment, current_page, begin, np, {classes:'ep'});

			}
			// Generate "Next"-Link
			if(this.opts.next_text && (current_page < np-1 || this.opts.next_show_always)){
				fragment.append(this.createLink(current_page+1, current_page, {text:this.opts.next_text, classes:"next",rel:"next"}));
			}
			$('a', fragment).click(eventHandler);
			return fragment;
		}
	});

	// Extend jQuery
	$.fn.pagination = function(maxentries, opts){

		// Initialize options with default values
		opts = $.extend({
			items_per_page:10,
			num_display_entries:11,
			current_page:0,
			num_edge_entries:0,
			link_to:"#",
			prev_text:"Prev",
			next_text:"Next",
			ellipse_text:"...",
			prev_show_always:true,
			next_show_always:true,
			renderer:"defaultRenderer",
			show_if_single_page:false,
			load_first_page:true,
			callback:function(){return false;}
		},opts||{});

		var containers = this,
			renderer, links, current_page;

		/**
		 * This is the event handling function for the pagination links.
		 * @param {int} page_id The new page number
		 */
		function paginationClickHandler(evt){
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
		maxentries = (!maxentries || maxentries < 0)?1:maxentries;
		opts.items_per_page = (!opts.items_per_page || opts.items_per_page < 0)?1:opts.items_per_page;

		if(!$.PaginationRenderers[opts.renderer])
		{
			throw new ReferenceError("Pagination renderer '" + opts.renderer + "' was not found in jQuery.PaginationRenderers object.");
		}
		renderer = new $.PaginationRenderers[opts.renderer](maxentries, opts);

		// Attach control events to the DOM elements
		var pc = new $.PaginationCalculator(maxentries, opts);
		var np = pc.numPages();
		containers.off('setPage').on('setPage', {numPages:np}, function(evt, page_id) {
			if(page_id >= 0 && page_id < evt.data.numPages) {
				selectPage(page_id); return false;
			}
		});
		containers.off('prevPage').on('prevPage', function(evt){
			var current_page = $(this).data('current_page');
			if (current_page > 0) {
				selectPage(current_page - 1);
			}
			return false;
		});
		containers.off('nextPage').on('nextPage', {numPages:np}, function(evt){
			var current_page = $(this).data('current_page');
			if(current_page < evt.data.numPages - 1) {
				selectPage(current_page + 1);
			}
			return false;
		});
		containers.off('currentPage').on('currentPage', function(){
			var current_page = $(this).data('current_page');
			selectPage(current_page);
			return false;
		});

		// When all initialisation is done, draw the links
		links = renderer.getLinks(current_page, paginationClickHandler);
		containers.empty();
		if(np > 1 || opts.show_if_single_page) {
			links.appendTo(containers);
		}
		// call callback function
		if(opts.load_first_page) {
			opts.callback(current_page, containers);
		}
	}; // End of $.fn.pagination block

})(jQuery);




/*
 * Jeditable - jQuery in place edit plugin
 *
 * Copyright (c) 2006-2013 Mika Tuupola, Dylan Verheul
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/jeditable
 *
 * Based on editable by Dylan Verheul <dylan_at_dyve.net>:
 *    http://www.dyve.net/jquery/?editable
 *
 */

/**
 * Version 1.7.3
 *
 * ** means there is basic unit tests for this parameter.
 *
 * @name  Jeditable
 * @type  jQuery
 * @param String  target             (POST) URL or function to send edited content to **
 * @param Hash    options            additional options
 * @param String  options[method]    method to use to send edited content (POST or PUT) **
 * @param Function options[callback] Function to run after submitting edited content **
 * @param String  options[name]      POST parameter name of edited content
 * @param String  options[id]        POST parameter name of edited div id
 * @param Hash    options[submitdata] Extra parameters to send when submitting edited content.
 * @param String  options[type]      text, textarea or select (or any 3rd party input type) **
 * @param Integer options[rows]      number of rows if using textarea **
 * @param Integer options[cols]      number of columns if using textarea **
 * @param Mixed   options[height]    'auto', 'none' or height in pixels **
 * @param Mixed   options[width]     'auto', 'none' or width in pixels **
 * @param String  options[loadurl]   URL to fetch input content before editing **
 * @param String  options[loadtype]  Request type for load url. Should be GET or POST.
 * @param String  options[loadtext]  Text to display while loading external content.
 * @param Mixed   options[loaddata]  Extra parameters to pass when fetching content before editing.
 * @param Mixed   options[data]      Or content given as paramameter. String or function.**
 * @param String  options[indicator] indicator html to show when saving
 * @param String  options[tooltip]   optional tooltip text via title attribute **
 * @param String  options[event]     jQuery event such as 'click' of 'dblclick' **
 * @param String  options[submit]    submit button value, empty means no button **
 * @param String  options[cancel]    cancel button value, empty means no button **
 * @param String  options[cssclass]  CSS class to apply to input form. 'inherit' to copy from parent. **
 * @param String  options[style]     Style to apply to input form 'inherit' to copy from parent. **
 * @param String  options[select]    true or false, when true text is highlighted ??
 * @param String  options[placeholder] Placeholder text or html to insert when element is empty. **
 * @param String  options[onblur]    'cancel', 'submit', 'ignore' or function ??
 *
 * @param Function options[onsubmit] function(settings, original) { ... } called before submit
 * @param Function options[onreset]  function(settings, original) { ... } called before reset
 * @param Function options[onerror]  function(settings, original, xhr) { ... } called on error
 *
 * @param Hash    options[ajaxoptions]  jQuery Ajax options. See docs.jquery.com.
 *
 */
(function($) {

	$.fn.editable = function(target, options) {

		if ('disable' == target) {
			$(this).data('disabled.editable', true);
			return;
		}
		if ('enable' == target) {
			$(this).data('disabled.editable', false);
			return;
		}
		if ('destroy' == target) {
			$(this)
				.unbind($(this).data('event.editable'))
				.removeData('disabled.editable')
				.removeData('event.editable');
			return;
		}

		var settings = $.extend({}, $.fn.editable.defaults, {target:target}, options);

		/* setup some functions */
		var plugin   = $.editable.types[settings.type].plugin || $.noop;
		var submit   = $.editable.types[settings.type].submit || $.noop;
		var buttons  = $.editable.types[settings.type].buttons || $.editable.types['defaults'].buttons;
		var content  = $.editable.types[settings.type].content || $.editable.types['defaults'].content;
		var element  = $.editable.types[settings.type].element  || $.editable.types['defaults'].element;
		var reset    = $.editable.types[settings.type].reset || $.editable.types['defaults'].reset;
		var callback = settings.callback || $.noop;
		var onedit   = settings.onedit   || $.noop;
		var onsubmit = settings.onsubmit || $.noop;
		var onreset  = settings.onreset  || $.noop;
		var onerror  = settings.onerror  || reset;

		/* Show tooltip. */
		if (settings.tooltip) {
			$(this).attr('title', settings.tooltip);
		}

		settings.autowidth  = 'auto' == settings.width;
		settings.autoheight = 'auto' == settings.height;

		return this.each(function() {

			/* Save this to self because this changes when scope changes. */
			var self = this;

			/* Inlined block elements lose their width and height after first edit. */
			/* Save them for later use as workaround. */
			var savedwidth  = $(self).width();
			var savedheight = $(self).height();

			/* Save so it can be later used by $.editable('destroy') */
			$(this).data('event.editable', settings.event);

			/* If element is empty add something clickable (if requested) */
			if (!$.trim($(this).html())) {
				$(this).html(settings.placeholder);
			}

			$(this).bind(settings.event, function(e) {

				/* Abort if element is disabled. */
				if (true === $(this).data('disabled.editable')) {
					return;
				}

				/* Prevent throwing an exeption if edit field is clicked again. */
				if (self.editing) {
					return;
				}

				/* Abort if onedit hook returns false. */
				if (false === onedit.apply(this, [settings, self])) {
					return;
				}

				/* Prevent default action and bubbling. */
				e.preventDefault();
				e.stopPropagation();

				/* Remove tooltip. */
				if (settings.tooltip) {
					$(self).removeAttr('title');
				}

				/* Figure out how wide and tall we are, saved width and height. */
				/* Workaround for http://dev.jquery.com/ticket/2190 */
				if (0 == $(self).width()) {
					settings.width  = savedwidth;
					settings.height = savedheight;
				} else {
					if (settings.width != 'none') {
						settings.width =
							settings.autowidth ? $(self).width()  : settings.width;
					}
					if (settings.height != 'none') {
						settings.height =
							settings.autoheight ? $(self).height() : settings.height;
					}
				}

				/* Remove placeholder text, replace is here because of IE. */
				if ($(this).html().toLowerCase().replace(/(;|"|\/)/g, '') ==
					settings.placeholder.toLowerCase().replace(/(;|"|\/)/g, '')) {
					$(this).html('');
				}

				self.editing    = true;
				self.revert     = $(self).html();
				$(self).html('');

				/* Create the form object. */
				var form = $('<form class="editableForm" />');

				/* Apply css or style or both. */
				if (settings.cssclass) {
					if ('inherit' == settings.cssclass) {
						form.attr('class', $(self).attr('class'));
					} else {
						form.attr('class', settings.cssclass);
					}
				}

				if (settings.style) {
					if ('inherit' == settings.style) {
						form.attr('style', $(self).attr('style'));
						/* IE needs the second line or display wont be inherited. */
						form.css('display', $(self).css('display'));
					} else {
						form.attr('style', settings.style);
					}
				}

				/* Add main input element to form and store it in input. */
				var input = element.apply(form, [settings, self]);
				if(typeof settings.onKeydown === 'function') input.bind("keydown.fy" , settings.onKeydown) ;
				if(typeof settings.onKeyup === 'function') input.bind("keyup.fy" , settings.onKeyup) ;
				if(typeof settings.onKeypress === 'function') input.bind("keypress.fy" , settings.onKeypress) ;
				if(typeof settings.onBlur === 'function') input.bind("blur.fy" , settings.onBlur) ;
				if(typeof settings.onPaste === 'function') input.bind("paste.fy" , settings.onPaste) ;
				if(typeof settings.onFocus === 'function') input.bind("focus.fy" , settings.onFocus) ;
				if(typeof settings.onClick === 'function') input.bind("click.fy" , settings.onClick) ;

				/* Set input content via POST, GET, given data or existing value. */
				var input_content;

				if (settings.loadurl) {
					var t = setTimeout(function() {
						input.disabled = true;
						content.apply(form, [settings.loadtext, settings, self]);
					}, 100);

					var loaddata = {};
					loaddata[settings.id] = self.id;
					if ($.isFunction(settings.loaddata)) {
						$.extend(loaddata, settings.loaddata.apply(self, [self.revert, settings]));
					} else {
						$.extend(loaddata, settings.loaddata);
					}
					$.ajax({
						type : settings.loadtype,
						url  : settings.loadurl,
						data : loaddata,
						async : false,
						success: function(result) {
							window.clearTimeout(t);
							input_content = result;
							input.disabled = false;
						}
					});
				} else if (settings.data) {
					input_content = settings.data;
					if ($.isFunction(settings.data)) {
						input_content = settings.data.apply(self, [self.revert, settings]);
					}
				} else {
					input_content = self.revert;
				}
				content.apply(form, [input_content, settings, self]);

				input.attr('name', settings.name);

				/* Add buttons to the form. */
				buttons.apply(form, [settings, self]);

				/* Add created form to self. */
				$(self).append(form);

				/* Attach 3rd party plugin if requested. */
				plugin.apply(form, [settings, self]);

				/* Focus to first visible form element. */
				$(':input:visible:enabled:first', form).focus();

				/* Highlight input contents when requested. */
				if (settings.select) {
					input.select();
				}

				/* discard changes if pressing esc */
				input.keydown(function(e) {
					if (e.keyCode == 27) {
						e.preventDefault();
						reset.apply(form, [settings, self]);
					}
				});

				/* Discard, submit or nothing with changes when clicking outside. */
				/* Do nothing is usable when navigating with tab. */
				var t;
				if ('cancel' == settings.onblur) {
					input.blur(function(e) {
						/* Prevent canceling if submit was clicked. */
						t = setTimeout(function() {
							reset.apply(form, [settings, self]);
						}, 30);
					});
				} else if ('submit' == settings.onblur) {
					input.blur(function(e) {
						/* Prevent double submit if submit was clicked. */
						t = setTimeout(function() {
							form.submit();
						}, 20);
					});
				} else if ($.isFunction(settings.onblur)) {
					input.blur(function(e) {
						settings.onblur.apply(self, [input.val(), settings]);
					});
				} else {
					input.blur(function(e) {
						/* TODO: maybe something here */
					});
				}

				form.submit(function(e) {

					if (t) {
						clearTimeout(t);
					}

					/* Do no submit. */
					e.preventDefault();

					/* Call before submit hook. */
					/* If it returns false abort submitting. */
					if (false !== onsubmit.apply(form, [settings, self])) {
						/* Custom inputs call before submit hook. */
						/* If it returns false abort submitting. */
						if (false !== submit.apply(form, [settings, self])) {

							/* Check if given target is function */
							if ($.isFunction(settings.target)) {
								//alert(1 + ':' + input.length);
								var val ;
								if(settings.type === "checkBox") {
									var objs = $(self).find(":checkbox:checked") , arr = [] ;
									//alert("objs: " + objs.length) ;
									objs.each(function(i,o){
										arr[i] = o.value ;
									}) ;
									val = arr.join(";") ;
								}
								else{
									val = input.val() ;
								}
								var str = settings.target.apply(self, [val, settings]);
								$(self).html(str);
								self.editing = false;
								callback.apply(self, [self.innerHTML, settings]);
								/* TODO: this is not dry */
								if (!$.trim($(self).html())) {
									$(self).html(settings.placeholder);
								}
							} else {
								/* Add edited content and id of edited element to POST. */
								var submitdata = {};
								submitdata[settings.name] = input.val();
								submitdata[settings.id] = self.id;
								/* Add extra data to be POST:ed. */
								if ($.isFunction(settings.submitdata)) {
									$.extend(submitdata, settings.submitdata.apply(self, [self.revert, settings]));
								} else {
									$.extend(submitdata, settings.submitdata);
								}

								/* Quick and dirty PUT support. */
								if ('PUT' == settings.method) {
									submitdata['_method'] = 'put';
								}

								/* Show the saving indicator. */
								$(self).html(settings.indicator);

								/* Defaults for ajaxoptions. */
								var ajaxoptions = {
									type    : 'POST',
									data    : submitdata,
									dataType: 'html',
									url     : settings.target,
									success : function(result, status) {
										if (ajaxoptions.dataType == 'html') {
											$(self).html(result);
										}
										self.editing = false;
										callback.apply(self, [result, settings]);
										if (!$.trim($(self).html())) {
											$(self).html(settings.placeholder);
										}
									},
									error   : function(xhr, status, error) {
										onerror.apply(form, [settings, self, xhr]);
									}
								};

								/* Override with what is given in settings.ajaxoptions. */
								$.extend(ajaxoptions, settings.ajaxoptions);
								$.ajax(ajaxoptions);

							}
						}
					}

					/* Show tooltip again. */
					$(self).attr('title', settings.tooltip);

					return false;
				});
			});

			/* Privileged methods */
			this.reset = function(form) {
				/* Prevent calling reset twice when blurring. */
				if (this.editing) {
					/* Before reset hook, if it returns false abort reseting. */
					if (false !== onreset.apply(form, [settings, self])) {
						$(self).html(self.revert);
						self.editing   = false;
						if (!$.trim($(self).html())) {
							$(self).html(settings.placeholder);
						}
						/* Show tooltip again. */
						if (settings.tooltip) {
							$(self).attr('title', settings.tooltip);
						}
					}
				}
			};
		});

	};


	$.editable = {
		types: {
			defaults: {
				element : function(settings, original) {
					var input = $('<input type="hidden" />');
					$(this).append(input);
					return(input);
				},
				content : function(string, settings, original) {
					$(':input:first', this).val(string);
				},
				reset : function(settings, original) {
					original.reset(this);
				},
				buttons : function(settings, original) {
					var form = this ;
					if (settings.submit) {
						var submit ;
						/* If given html string use that. */
						if (settings.submit.match(/>$/)) {
							submit = $(settings.submit).click(function() {
								if (submit.attr("type") != "submit") {
									form.submit();
								}
							});
							/* Otherwise use button with given string as text. */
						} else {
							submit = $('<button type="submit" />');
							submit.html(settings.submit);
						}
						$(this).append(submit);
					}
					if (settings.cancel) {
						var cancel;
						/* If given html string use that. */
						if (settings.cancel.match(/>$/)) {
							cancel = $(settings.cancel);
							/* otherwise use button with given string as text */
						} else {
							cancel = $('<button type="cancel" />');
							cancel.html(settings.cancel);
						}
						$(this).append(cancel);

						$(cancel).click(function(event) {
							var reset ;
							if ($.isFunction($.editable.types[settings.type].reset)) {
								reset = $.editable.types[settings.type].reset;
							} else {
								reset = $.editable.types['defaults'].reset;
							}
							reset.apply(form, [settings, original]);
							return false;
						});
					}
				}
			},
			text: {
				element : function(settings, original) {
					var input = $('<input type="text" />');
					if (settings.width != 'none') {
						input.width(settings.width);
					}
					if (settings.height != 'none') {
						input.height(settings.height);
					}
					/* https://bugzilla.mozilla.org/show_bug.cgi?id=236791 */
					//input[0].setAttribute('autocomplete','off');
					input.attr('autocomplete','off');
					$(this).append(input);
					if(settings.mask) input.mask(settings.mask);
					else if(settings.numberic){
						if(typeof settings.numberic !== "string") settings.numberic = "9999" ;
						input.decimalMask(settings.numberic) ;
					}
					return(input);
				}
			},
			textarea: {
				element : function(settings, original) {
					var textarea = $('<textarea />');
					if (settings.rows) {
						textarea.attr('rows', settings.rows);
					} else if (settings.height != "none") {
						textarea.height(settings.height);
					}
					if (settings.cols) {
						textarea.attr('cols', settings.cols);
					} else if (settings.width != "none") {
						textarea.width(settings.width);
					}
					$(this).append(textarea);
					return(textarea);
				}
			},
			select: {
				element : function(settings, original) {
					var select = $('<select />');
					$(this).append(select);
					return(select);
				},
				content : function(data, settings, original) {
					/* If it is string assume it is json. */
					if (String == data.constructor) {
						eval ('var json = ' + data);
					} else {
						/* Otherwise assume it is a hash already. */
						var json = data;
					}
					for (var key in json) {
						if (!json.hasOwnProperty(key)) {
							continue;
						}
						if ('selected' == key) {
							continue;
						}
						var option = $('<option />').val(key).append(json[key]);
						$('select', this).append(option);
					}
					/* Loop option again to set selected. IE needed this... */
					$('select', this).children().each(function() {
						if ($(this).val() == json['selected'] ||
							$(this).text() == $.trim(original.revert)) {
							$(this).attr('selected', 'selected');
						}
					});
					/* Submit on change if no submit button defined. */
					if (!settings.submit) {
						var form = this;
						$('select', this).change(function() {
							form.submit();
						});
					}
				}
			},
			checkBox : {
				element: function (sets, original) {
					//log(1 , $(original).data("oldHTML")) ;
					var data = sets.data ;
					if(data) {
						var str = '' , id , name = "ckb_" + Math.random() ;
						for(var key in data) {
							id = Math.random();
							str += ('<input id="ckb_'+id+'" name="'+name+'" type="checkbox" value="'+ key +'"><label for="ckb_'+id+'">'+data[key]+';</label><br>') ;
						}
						return $(str).appendTo(this) ;
					}
					else return null;
				},
				content:function (data, sets, original) {
					//log("2" ,data, sets, original.revert , this);
					var cValues = original.revert.split(";") , l = cValues.length , cks = this.find(":checkbox") ;
					while(l--){
						//log(cValues[l] , "[value='"+ cValues[l] +"']" , this.find("[value='"+ cValues[l] +"']")) ;
						this.find("[value='"+ cValues[l] +"']").prop("checked" ,true) ;
					}
				}
			}
		},

		/* Add new input type */
		addInputType: function(name, input) {
			$.editable.types[name] = input;
		}
	};

	/* Publicly accessible defaults. */
	$.fn.editable.defaults = {
		name       : 'value',
		id         : 'id',
		type       : 'text',
		width      : 'auto',
		height     : 'auto',
		event      : 'click.editable',
		onblur     : 'cancel',
		loadtype   : 'GET',
		loadtext   : 'Loading...',
		placeholder: 'Click to edit',
		loaddata   : {},
		submitdata : {},
		ajaxoptions: {}
	};

})(jQuery);
