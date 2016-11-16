import {AjaxDisplayObject, DisplayObject} from './DisplayOject';

interface IFormControls {
	elementName: string;
	getValue(): any;
	getText(): any;
}

class ListBox extends AjaxDisplayObject implements IFormControls {

	elementName: string;


	constructor(jq: JQuery, cfg: any) {

		cfg = $.extend({
			autoPrependBlank: true,
			bindOptions: {
				mode: 'append',
				template: '<option value="${' + (cfg.value || 'id') + '}">${' + (cfg.text || 'name') + '}</option>'
			}
		}, cfg);

		cfg.name = cfg.name || ( 'opsElem_' + DisplayObject.guid() );

		//如果是从空容器创建的，将jq对象指定到select控件上
		if (jq[0].tagName !== 'SELECT') {
			jq = $('<select name="' + cfg.name + '"></select>').appendTo(jq);
		}


		if (cfg.autoPrependBlank) {
			let txt = (typeof cfg.autoPrependBlank === 'string') ? cfg.autoPrependBlank : '请选择';
			jq.prepend(`<option value="">${txt}</option>`);
		}

		super(jq, cfg);

	}

	init(jq: JQuery, cfg: any) {

		super.init(jq, cfg);

		this._initSelectedIndex = cfg.selectedIndex || 0;
		this.elementName = cfg.name;

		//add event listener
		jq.on("change.ops", (evt) => {
			this.selectedIndex = evt.target.selectedIndex;
		});
	}

	bindHandler(json) {
		this._items = this.jq.find("option");

		let i = (this._items.length > this._initSelectedIndex) ? this._initSelectedIndex : (this._items.length ? 0 : -1);

		if (typeof this.onBind === 'function') this.onBind(json);

		if (i > -1) {
			this.selectedIndex = <number> i;
		}
	}

	public set selectedIndex(i: number) {
		this._prevIndex = this._selectedIndex;

		//(this.jq[0] as HTMLSelectElement).selectedIndex = i;
		$(this._items).removeAttr('selected').eq(i).attr('selected' , 'selected');

		this._selectedIndex = i;

		let evt: Event = {target: this._items[i]} as Event;
		this.selectHandler(evt);

	}

	getValue(): string|number {
		return this.jq.val();
	}

	getText(): string {
		let selectElem: HTMLSelectElement = this.jq[0] as HTMLSelectElement;

		if (selectElem.options.length) {
			return (selectElem.options[selectElem.selectedIndex] as HTMLOptionElement).text;
		}

		return null;
	}
}


class CheckBox extends AjaxDisplayObject implements IFormControls {
	elementName: string;


	constructor(jq: JQuery, cfg: any) {

		cfg.name = cfg.name || ( 'opsElem_' + DisplayObject.guid() );

		cfg = $.extend({
			bindOptions: {
				template: '<label class="lbAutoWidth"><input name="' + cfg.name
				+ '" type="checkbox" value="${' + (cfg.value || 'id') + '}">${' + (cfg.text || 'name') + '}</label>'
				+ (cfg.joiner === undefined ? ' ' : cfg.joiner)
			}
		}, cfg);


		super(jq, cfg);

	}

	init(jq: JQuery, cfg: any) {

		super.init(jq, cfg);

		this.elementName = cfg.name;

		this._initSelectedIndex = cfg.selectedIndex || [];
		this._prevIndex = [];
		this._selectedIndex = [];

		//add event listener
		jq.on("change.ops", ':checkbox', (evt)=> {
			this.selectHandler(evt);
		});
	}

	bindHandler(json) {
		this._items = this.jq.find("input[name='" + this.elementName + "']:checkbox");
		if (typeof this.onBind === 'function') this.onBind(json);

		let iSel = <number[]> this._initSelectedIndex;
		if (iSel.length) {
			this.selectedIndex = iSel;
		}

	}

	public set selectedIndex(arr: number[]) {

		let chkIdx = [], chkItem = [];
		for (let i = 0, l = arr.length; i < l; i++) {
			let ix = arr[i];
			let item = this._items.eq(ix);
			if (item.length) {
				chkIdx.push(ix);

				if (!item.prop('checked')) {
					chkItem.push(item.prop('checked', true));
				}

			}

		}

		if (chkItem.length) {
			this._prevIndex = this.selectedIndex;
			this.selectedIndex = chkIdx;
			let evt: Event = {target: $(chkItem)} as Event;
			this.selectHandler(evt);
		}

	}

	get selectedItem(): JQuery {
		return this._items.filter(':checked');
	}

	get selectedData(): Array {
		let s = this.selectedItem,
			arr = [],
			that = this;

		s.each((i, opt)=> {
			let src = that.data[that._items.index(opt)],
				tar = {};
			for (let key: string in src)
				if (src.hasOwnProperty(key) && key.indexOf(":") === -1)
					tar[key] = src[key];

			arr.push(tar);
		});
		return arr;
	}

	getValue(): any {
		let s: JQuery = this.selectedItem;
		if (s.length) {
			let arr = [];
			s.each(function (i, o: HTMLInputElement) {
				arr.push(o.value);
			});
			return arr;
		}
		return null;
	}

	getText(): any {
		let s: JQuery = this.selectedItem;
		if (s.length) {
			let arr = [];
			s.each(function (i, o: HTMLInputElement) {
				arr.push($(o.parentNode).text());
			});
			return arr;
		}
		return null;
	}
}

class RadioBox extends AjaxDisplayObject implements IFormControls {

	elementName: string;

	constructor(jq: JQuery, cfg: any) {

		cfg.name = cfg.name || ( 'opsElem_' + DisplayObject.guid() );

		cfg = $.extend({
			bindOptions: {
				template: '<label class="lbAutoWidth"><input name="' + cfg.name
				+ '" type="radio" value="${' + (cfg.value || 'id') + '}">${' + (cfg.text || 'name') + '}</label>'
				+ (cfg.joiner === undefined ? ' ' : cfg.joiner)
			}
		}, cfg);


		super(jq, cfg);

	}

	init(jq: JQuery, cfg: any) {
		super.init(jq, cfg);

		this.elementName = cfg.name;
		this._initSelectedIndex = ~~cfg.selectedIndex;

		//add event listener
		jq.on("change.ops", (evt) => {
			this.selectedIndex = this._items.index(evt.target);
		});
	}

	bindHandler(json) {
		this._items = this.jq.find("input[name='" + this.elementName + "']:radio");

		let i = (this._items.length > this._initSelectedIndex) ? this._initSelectedIndex : (this._items.length ? 0 : -1);

		if (typeof this.onBind === 'function') this.onBind(json);

		if (i > -1) {

			this._items.eq(i as number).prop('checked', true);

			this.selectedIndex = i;
		}

	}

	get selectedItem(): JQuery {
		return this._items.filter(':checked');
	}

	getValue(): string {
		return this.selectedItem.val();
	}

	getText(): string {
		let s = this.selectedItem;
		if (s.length) {
			return s.parent().text();
		}
		return null;
	}

}
export {ListBox, CheckBox, RadioBox};