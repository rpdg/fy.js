import {AjaxMessage} from '../util/api'


interface UiObject {
	guid: JQuery,
	jq: JQuery,
	create: Function,
	created: boolean ,
	init: Function,
}

const blankArray: JQuery = $({});

export abstract class DisplayObject implements UiObject {

	public guid: number;
	public jq: JQuery;

	public onCreate?: Function;

	protected _created: boolean = false;
	protected _promise: JQueryDeferred ;

	constructor(jq: JQuery, cfg: any) {

		this.guid = DisplayObject.guid();
		this.jq = jq;

		this.onCreate = cfg.onCreate;

		this.init(jq, cfg);

		this.create(jq, cfg);
	}

	init(jq: JQuery, cfg: any) {

	}

	create(jq: JQuery, cfg: any): DisplayObject {
		return this;
	}

	createdHandler(data?: any) {
		this._created = true;

		if(this._promise){
			this._promise.resolve();
		}

		if (this.onCreate) this.onCreate(data);
	}

	static guid: Function = (() => {
		let seed = 0;

		return (): number=> {
			return ++seed;
		}
	})();

	promise() {
		this._promise = $.Deferred();
	}
}

interface IListBase {
	selectedIndex: number
}

export abstract class AjaxDisplayObject extends DisplayObject implements IListBase {

	protected _items?: JQuery;
	protected _data?: any;
	protected _json?: any;
	protected _api?: Function;
	protected _param?: any;

	protected _lazy: boolean = false;

	protected _bindOption?: BindOption;
	protected _defBindOpt: BindOption = {};

	protected _prevIndex: number|number[];
	protected _selectedIndex: number|number[];
	protected _initSelectedIndex: number|number[];

	public onUpdate?: Function;
	public onAjaxEnd?: Function;
	public onBind?: Function;
	public onSelect?: Function;

	public container: JQuery;
	public arrSrc: string;

	constructor(jq: JQuery, cfg: any) {

		super(jq, cfg);

	}

	init(jq: JQuery, cfg: any) {
		this._api = cfg.api;
		this._bindOption = $.extend(this._defBindOpt, cfg.bindOptions);
		this._lazy = !!cfg.lazy;
		this._param = cfg.param;
		this._items = blankArray;

		this._prevIndex = -1;
		this._selectedIndex = -1;
		this._initSelectedIndex = -1;

		this.arrSrc = cfg.arrSrc || 'results';
		this.container = this.jq;

		this.onUpdate = cfg.onUpdate;
		this.onAjaxEnd = cfg.onAjaxEnd;
		this.onSelect = cfg.onSelect;
		this.onBind = cfg.onBind;
	}

	create(jq: JQuery, cfg: any) {
		if (!this._lazy) {

			if (cfg.data) {
				this.bindData(cfg.data);
			}
			else if (this._api) {
				this.ajax(this._param);
			}

		}


		return this;
	}

	selectHandler(evt: Event) {
		if (typeof this.onSelect === 'function') this.onSelect(evt);
	}

	public set selectedIndex(i: number|number[]) {
		this._prevIndex = this._selectedIndex;
		this._selectedIndex = i;

		let evt: Event = {target: this._items[i]} as Event;
		this.selectHandler(evt);
	}

	public get selectedIndex(): number|number[] {
		return this._selectedIndex;

	}

	public get selectedData(): any {
		return this._data[this._selectedIndex];
	}

	public get selectedItem(): any {
		return this._items[this._selectedIndex];
	}

	public set data(data: any) {
		this._data = data;

		if (this._created) {
			this.updateHandler(data);
		}
		else {
			this.createdHandler(data);
		}
	}

	public get data(): any {
		return this._data;
	}


	update(param?: any) {
		if (this._api) {
			if (this._param) $.extend(this._param, param);
			else this._param = param;

			this.ajax(this._param);
		}
		else {
			let data = param || this._data;
			this.bindData(data);

		}
	}

	updateHandler(data: any) {
		if (this.onUpdate) this.onUpdate(data);
	}

	ajax(param ?: any) {

		let that = this;

		this._api(param, (json) => {

			that._json = json;

			that.ajaxEndHandler(json);

			that.bindData(json);

		});

		return this;
	}

	ajaxEndHandler(json: any) {
		if (this.onAjaxEnd) this.onAjaxEnd(json);
	}

	bindData(data: AjaxMessage|Array) {

		//this._json = data;

		let list: Array;

		if ($.isArray(data)) {
			list = data as Array;
		}
		else {
			list = data[this.arrSrc];
		}

		this._bindOption.list = list;

		// 如果有过滤器，则需要
		// 将过滤后的array保存下，待稍后作为 this.data
		if (this._bindOption.itemFilter) this._bindOption.storeData = true;

		// bind data
		this.container.bindList(this._bindOption);


		//this.data 是过滤后的数组
		if (this._bindOption.itemFilter) {
			this.data = this.container.data('bound-array');
			this.container.removeData('bound-array');
		}
		else {
			this.data = list;
		}


		this.bindHandler(data);

		return this;
	}

	bindHandler(json: any) {
		if (this.onBind) this.onBind(json);
	}

}

