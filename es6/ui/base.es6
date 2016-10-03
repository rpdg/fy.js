import {guid} from '/es6/util/uuid' ;
import {$} from '/es6/util/jquery.plugins';

class DisplayObject {

	constructor(jq, cfg) {
		//this.guid = guid();
		this.jq = jq;
		if(typeof cfg.onCreate === 'function') this.onCreate = cfg.onCreate;
	}

	create() {
		throw new Error("'create' method not implemented");
	}
}


class AjaxDisplayObject extends DisplayObject {
	constructor(jq, cfg) {

		super(jq, cfg);

		this.lazy = !!cfg.lazy;
		this.autoFire = !!cfg.autoFire;
		this.data = cfg.data;
		this.api = cfg.api;
		this.param = cfg.param;
		this.arrSrc = cfg.arrSrc || 'data';
		this.listContainer = this.listContainer || this.jq ;
		this.items = null;
		this.selectedIndex = -1;
		this.prevIndex = -1;
		
		this.bindOptions = $.extend({}, cfg.bindOptions);
		
		if(typeof cfg.onAjaxEnd === 'function') this.onAjaxEnd = cfg.onAjaxEnd;
		if(typeof cfg.onUpdate === 'function') this.onUpdate = cfg.onUpdate;
		if (typeof cfg.onSelect === 'function') this.onSelect = cfg.onSelect;
		
		this.created = false;


		this.init(jq, cfg);
		
		if (!this.lazy) this.create(jq, cfg);
	}
	init(jq , cfg){
		
	}
	create(jq, cfg) {

		if (this.data) {
			this.bindData(this.data);
		}
		else if (!this.lazy) {
			this.ajax(this.param);
		}

		return this;
	}

	createHandler(json , onceCall) {
		this.created = true;
		if ($.isFunction(this.onCreate)) this.onCreate(json);

		if(onceCall)
			onceCall.call(this , json);

		return this;
	}

	update(param , onceCall) {

		if (this.api) {
			if (this.param) $.extend(this.param, param);
			else this.param = param;

			this.ajax(this.param , onceCall);
		}
		else {
			var data = param || this.data;
			this.bindData(data , onceCall);

		}

		return this;
	}

	updateHandler(json , onceCall) {

		if ($.isFunction(this.onUpdate))
			this.onUpdate(json);

		if(onceCall)
			onceCall.call(this , json);

		return this;
	}

	ajax(param , onceCall) {

		var that = this;

		this.api(param, (json) => {

			that.json = json;

			that.ajaxEndHandler(json);

			that.bindData(json , onceCall);

		});

		return this;
	}

	ajaxEndHandler(json) {
		if ($.isFunction(this.onAjaxEnd)) this.onAjaxEnd(json);
	}

	bindData(data , onceCall) {

		var json = data , list ;

		if($.isArray(data)){
			list = data ;
		}
		else{
			list = data[this.arrSrc] ;
		}

		this.bindOptions.list = list ;

		// 如果有过滤器，则需要
		// 将过滤后的array保存下，待稍后作为 this.data
		if (this.bindOptions.itemFilter) this.bindOptions.storeData = true;

		this.listContainer.bindList(this.bindOptions);

		//this.data 是过滤后的数组
		if (this.bindOptions.itemFilter) {
			this.data = this.listContainer.data('bound-array');
			this.listContainer.removeData('bound-array');
		}
		else {
			this.data = this.bindOptions.list;
		}



		this.bindHandler(json);


		if (this.created)
			this.updateHandler(json , onceCall);
		else
			this.createHandler(json , onceCall);




		return this;
	}

	bindHandler(json) {
		if (typeof this.onBind === 'function') this.onBind(json) ;
	}

	setSelectedIndex(i) {
		this.prevIndex = this.selectedIndex;
		this.selectedIndex = i;

		var evt = {target: this.items[i]};
		this.selectHandler(evt);

		return this;
	}

	selectHandler(evt) {
		if (typeof this.onSelect === 'function') this.onSelect(evt);
	}

	getSelectedItem() {
		return this.items[this.selectedIndex];
	}

	getSelectedData(original) {
		var src = this.data[this.selectedIndex];
		//过滤对象中的绑定时增加的属性
		if (!original) {
			let tar = {}, key;
			for (key in src) if (key.indexOf(":") === -1) tar[key] = src[key];
			return tar;
		}
		else {
			return src;
		}
	}
}




export {DisplayObject, AjaxDisplayObject, $};