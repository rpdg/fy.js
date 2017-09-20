/**
 * plugins
 * Created by bestv on 2016/9/13.
 */

;
(function ($) {

	var validate = {};
	validate.isset = function (string) {
		return !!string;
	};
	validate.empty = function (string) {
		if (!string) return true;
		return String(string).replace(/\s+/g, '').length == 0;
	};
	validate.require = function (str) {
		if (!str) return false;
		return !validate.empty(str);
	};
	validate.email = function (string) {
		return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i.test(string);
	};
	validate.url = function (string) {
		return /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/i.test(string);
	};
	validate.date = function (string, preutc) {
		string = string.replace(/-/g, '/'); //for IE
		var date = Date.parse(string);
		if (isFinite(date)) {
			return true;
		}
		if (preutc) {
			var now = new Date();
			string = string.replace(/\d{4}/, now.getFullYear());
			date = Date.parse(string);
			return isFinite(date);
		}
		return false;
	};
	validate.time = function (string) {
		var checkValue = new RegExp("^/[0-2]{1}/[0-6]{1}:/[0-5]{1}/[0-9]{1}:/[0-5]{1}/[0-9]{1}");
		return checkValue.test(string);
	};
	validate.time12 = function (str) {
		return /^(1[0-2]|0?[1-9]):([0-5]?[0-9]):([0-5]?[0-9])$/.test(str);
	};
	validate.time24 = function (str) {
		return /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/.test(str);
	};
	validate.zip = function (string, plus4) {
		var pattern = plus4 ? /^\d{5}-\d{4}$/ : /^\d{5}$/;
		return pattern.test(string);
	};
	validate.phone = function (string) {
		return /^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/.test(string);
	};
	validate.integer = function (string) {
		return /^\-?\d+$/.test(string);
	};
	validate.numeric = function (string) {
		return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(string);
	};
	validate.ip = function (string) {
		return /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/.test(string);
	};
	validate.alpha = function (string) {
		return /^[a-z]$/i.test(string);
	};
	validate.alphaNumeric = function (string) {
		return /^[a-z0-9]$/i.test(string);
	};
	validate.lowercase = function (string) {
		return string.toLowerCase() == string;
	};
	validate.uppercase = function (string) {
		return string.toUpperCase() == string;
	};
	validate.minlength = function (string, length) {
		return string.length >= length;
	};
	validate.maxlength = function (string, length) {
		return string.length <= length;
	};
	validate.between = function (string, min, max) {
		return string.length >= min && string.length <= max;
	};
	validate.ns = function (str) {
		return (/[`~!@#$%\^&\*\+=\{\};"'<>\?,\.]/gim).test(str);
	};
	validate.password = function (str) {
		var res = '';
		if (str.length < 8 || str.length > 15) {
			res = '密码长度需要8～15位';
		}
		else if (!(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/).test(str)) {
			res = '密码需要由大小写字母与数字混合';
		}

		return res;
	};

	//复选框组作全选全非选的同步checkBox
	$.fn.syncCheckBoxGroup = function (expr, context) {
		var $t = this, $cxt = $(context || document);
		$cxt.on('change', expr, function () {
			var $chks = $(expr, $cxt);
			//console.log($chks, $chks.length, $chks.filter(':checked').length);
			$t.prop("checked", $chks.filter(':checked').length === $chks.length);
		});
		$t.on('change', function () {
			$(expr, $cxt).prop("checked", this.checked);
		});
		return this;
	};

	//复选框组作全选全非选的同步checkBox, 单向
	$.fn.checkBoxAll = function (expr, context) {
		var $t = this, $cxt = $(context || document);
		$cxt.on('change', expr, function () {
			if ($t.prop('checked')) {
				var $chks = $(expr, $cxt);
				//console.log($chks, $chks.length, $chks.filter(':checked').length);
				$t.prop("checked", $chks.filter(':checked').length === $chks.length);
			}
		});
		$t.on('change', function () {
			$(expr, $cxt).prop("checked", this.checked);
		});
		return this;
	};

	$.fn.iptError = function (sets) {
		var self = this, fn = sets;
		this.addClass('error').one('focus', function () {
			self.removeClass('error');
		});

		if (typeof sets === 'string') {
			fn = function (ipt) {
				opg.warn(sets, function () {
					ipt.focus()
				});
			}
		}

		if (typeof fn === 'function') {
			fn.call(this, this);
		}


		return this;
	};

	$.fn.fieldsToJson = function (rules) {
		var objResult = {}, a, form;

		if (this[0].tagName !== "FORM") {
			form = $(':input', this);
		}
		else {
			form = this;
		}
		//a = this.serializeArray() ;
		a = form.serializeArray();

		$.each(a, function () {
			var i = this.name.indexOf("[]"),
				isArr = !(i === -1),
				prop = isArr ? this.name.substr(0, i) : this.name,
				val = $.trim(this.value + "") || '';

			if (form.find('[name="' + this.name + '"]').eq(0).attr('type') === 'number') {
				val = +(val);
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

		//validate
		if (rules) {
			for (var ruleName in rules) {
				if (rules.hasOwnProperty(ruleName)) {
					var rule = rules[ruleName];

					if (rule.maxLength && !validate.maxlength(objResult[ruleName], rule.maxLength)) {
						$('[name=' + ruleName + ']', this).iptError(rule.name + '长度不可超过' + rule.maxLength + '字');
						return;
					}

					if (rule.minLength && !validate.minlength(objResult[ruleName], rule.minLength)) {
						$('[name=' + ruleName + ']', this).iptError(rule.name + '长度不可少于' + rule.maxLength + '字');
						return;
					}

					if (rule.require && validate.empty(objResult[ruleName])) {
						$('[name=' + ruleName + ']', this).iptError(rule.name + '不可为空');
						return;
					}

					if (rule.type === 'ns' && validate.ns(objResult[ruleName])) {
						$('[name=' + ruleName + ']', this).iptError(rule.name + '不可含特殊字符');
						return;
					}

					if (rule.type === 'password') {
						var rs = validate.password(objResult[ruleName]);
						if (rs) {
							$('[name=' + ruleName + ']', this).iptError(rs);
							return;
						}
					}
					else if (rule.type === 'int') {
						if (objResult[ruleName]) {
							if (!validate.integer(objResult[ruleName])) {
								$('[name=' + ruleName + ']', this).iptError(rule.name + '应该是整数');
								return;
							}
							objResult[ruleName] = +objResult[ruleName];
						}
					}
					else if (rule.type === 'number') {
						if (objResult[ruleName]) {
							if (!validate.numeric(objResult[ruleName])) {
								$('[name=' + ruleName + ']', this).iptError(rule.name + '应该是数字');
								return;
							}
							objResult[ruleName] = +objResult[ruleName];
						}
					}
					else if (rule.type === 'number[]') {
						if (objResult[ruleName] && objResult[ruleName].length && objResult[ruleName].push) {
							var nArr = objResult[ruleName], l = nArr.length;
							while (l--) {
								nArr[l] = +nArr[l];
							}
						}
					}
					else if (rule.type === 'date') {
						if (objResult[ruleName]) {
							if (!validate.date(objResult[ruleName])) {
								$('[name=' + ruleName + ']', this).iptError(rule.name + '不是合法的日期格式');
								return;
							}
						}
					}
					else if (rule.type === 'time') {
						if (objResult[ruleName]) {
							if (!validate.time24(objResult[ruleName])) {
								$('[name=' + ruleName + ']', this).iptError(rule.name + '不是合法的时间格式');
								return;
							}
						}
					}


				}
			}
		}
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

		var elem, val, b;

		loopElement :
			for (var i = 0, l = element.length; i < l; i++) {
				elem = element[i];
				b = false;
				val = elem.value;

				searchArray :
					for (var j = 0, f = a.length; j < f; j++) {
						if (val == a[j]) {
							if (isSingleSelector) {
								isDroplist ? (elem.selected = true) : (elem.checked = true);
								break loopElement;
							}
							else {
								b = true;
								break searchArray;
							}
						}
					}
				// 用于设定新的选中状态，以及清除原来的选中状态
				isDroplist ? (elem.selected = b) : (elem.checked = b);
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
				$(elem).recheckElement(val + '');
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
			//throw 'decimalMask: you must set the mask string.';
			mask = '9999999999';
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
		this[mode || 'html'](html.join(cache["joiner"]));
		if (typeof(cache.onBound) === 'function') {
			cache.onBound.call(this, list, sets);
		}

		if (storeData) this.data('bound-array', storeArray);
		return this;
	};

	//a static function to detect ie browser
	//returns : not ie => 0 , ie => 6~11 , edge => 12+
	$.detectIE = function () {
		var ua = window.navigator.userAgent;

		var msie = ua.indexOf('MSIE ');
		if (msie > 0) {
			// IE 10 or older => return version number
			return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		}

		var trident = ua.indexOf('Trident/');
		if (trident > 0) {
			// IE 11 => return version number
			var rv = ua.indexOf('rv:');
			return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
		}

		var edge = ua.indexOf('Edge/');
		if (edge > 0) {
			// Edge (IE 12+) => return version number
			return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
		}

		// other browser
		return 0;
	};

})(jQuery);


