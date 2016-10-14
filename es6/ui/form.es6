import {AjaxDisplayObject} from 'base';
import {$} from '/es6/util/jquery.plugins';
import {guid} from '/es6/util/uuid' ;


class ListBox extends AjaxDisplayObject {

	constructor(jq, cfg) {

		cfg = $.extend({
			bindOptions: {
				template: '<option value="${' + (cfg.value || 'id') + '}">${' + (cfg.text || 'name') + '}</option>'
			}
		}, cfg);


		cfg.name = cfg.name || ( 'opsElem_' + guid() );

		//如果是从空容器创建的，将jq对象指定到select控件上
		if (jq[0].tagName !== 'SELECT') {
			jq = $('<select name="' + cfg.name + '"></select>').appendTo(jq);
		}

		//add event listener
		jq.on("change.ops", (evt) => {
			this.selectHandler(evt);
		});


		super(jq, cfg);

	}

	init(jq, cfg) {
		this.initSelectedIndex = cfg.selectedIndex || 0;
		this.elementName = cfg.name;
	}

	bindHandler(json) {
		this.items = this.jq.find("option");

		let i = (this.items.length > this.initSelectedIndex) ? this.initSelectedIndex : (this.items.length ? 0 : -1);

		if (typeof this.onBind === 'function') this.onBind(json);

		if (i > -1) {
			//var that = this;
			//setTimeout(function () {
			//if (that.selectedIndex > 0) that.setSelectedIndex(that.selectedIndex);
			//if (that.autoFire) that.jq.trigger("change.ops");
			//}, 0);

			this.jq[0].selectedIndex = i;
			this.setSelectedIndex(i);
		}
	}


	getValue() {
		return this.jq.val();
	}

	getText() {
		var jp = this.jq[0];
		if (jp.options.length) return jp.options[jp.selectedIndex].text;
		return null;
	}
}


class CheckBox extends AjaxDisplayObject {
	constructor(jq, cfg) {

		cfg.name = cfg.name || ( 'opsElem_' + guid() );

		cfg = $.extend({
			bindOptions: {
				template: '<label><input name="' + cfg.name
				+ '" type="checkbox" value="${' + (cfg.value || 'id') + '}">${' + (cfg.text || 'name') + '}</label>'
				+ (cfg.joiner === undefined ? ' ' : cfg.joiner)
			}
		}, cfg);


		//add event listener
		jq.on("change.ops", ':checkbox', (evt)=> {
			this.selectHandler(evt);
		});

		super(jq, cfg);

	}

	init(jq, cfg) {
		this.elementName = cfg.name;
		this.initSelectedIndex = cfg.selectedIndex;
		this.prevIndex = [];
		this.selectedIndex = [];
	}

	bindHandler(json) {
		this.items = this.jq.find("input[name='" + this.elementName + "']:checkbox");

		if (typeof this.onBind === 'function') this.onBind(json);

		if (this.initSelectedIndex.length) {
			//var that = this;
			//setTimeout(() => that.setSelectedIndex(that.initSelectedIndex), 0);
			this.setSelectedIndex(this.initSelectedIndex);
		}


	}

	setSelectedIndex(arr) {
		var chkIdx = [], chkItem = [];
		for (var i = 0, l = arr.length; i < l; i++) {
			let ix = ~~arr[i];
			let item = this.items.eq(ix);
			if (item.length) {
				chkIdx.push(ix);

				if (!item.prop('checked')) {
					chkItem.push(item.prop('checked', true));
				}

			}

		}

		if (chkItem.length) {
			this.prevIndex = this.selectedIndex;
			this.selectedIndex = chkIdx;
			var evt = {target: $(chkItem)};
			this.selectHandler(evt);
		}

		return this;
	}

	getSelectedItem() {
		return this.items.filter(':checked');
	}

	getSelectedData() {
		var s = this.items.filter(':checked'),
			arr = [],
			that = this;
		s.each((i, opt)=> {
			let src = that.data[that.items.index(opt)], tar = {}, key;
			for (key in src) if (key.indexOf(":") === -1) tar[key] = src[key];
			arr.push(tar);
		});
		return arr;
	}

	getValue() {
		var s = this.items.filter(':checked');
		if (s.length) {
			var arr = [];
			s.each(function (i, o) {
				arr.push(o.value);
			});
			return arr;
		}
		return null;
	}

	getText() {
		var s = this.items.filter(':checked');
		if (s.length) {
			var arr = [];
			s.each(function (i, o) {
				arr.push($(o.parentNode).text());
			});
			return arr;
		}
		return null;
	}
}


class RadioBox extends AjaxDisplayObject {
	constructor(jq, cfg) {

		cfg.name = cfg.name || ( 'opsElem_' + guid() );

		cfg = $.extend({
			bindOptions: {
				template: '<label><input name="' + cfg.name
				+ '" type="radio" value="${' + (cfg.value || 'id') + '}">${' + (cfg.text || 'name') + '}</label>'
				+ (cfg.joiner === undefined ? ' ' : cfg.joiner)
			}
		}, cfg);


		//add event listener
		jq.on("change.ops", (evt) => {
			this.setSelectedIndex(this.items.index(evt.target));
		});

		super(jq, cfg);

	}

	init(jq, cfg) {
		this.elementName = cfg.name;
		this.initSelectedIndex = cfg.selectedIndex;
	}

	bindHandler(json) {
		this.items = this.jq.find("input[name='" + this.elementName + "']:radio");

		let i = (this.items.length > this.initSelectedIndex) ? this.initSelectedIndex : (this.items.length ? 0 : -1);

		if (typeof this.onBind === 'function') this.onBind(json);

		if (i > -1) {
			/*var that = this;

			 this.items.eq(this.selectedIndex).prop('checked', true);

			 setTimeout(function () {
			 if (that.selectedIndex > 0) that.setSelectedIndex(that.selectedIndex);
			 }, 0);*/

			this.items.eq(i).prop('checked', true);

			this.setSelectedIndex(i);
		}

	}

	getValue() {
		return this.items.filter(':checked').val();
	}

	getText() {
		var s = this.items.filter(':checked');
		if (s.length) {
			return s.parent().text();
		}
		return null;
	}
}


export {ListBox, CheckBox, RadioBox};