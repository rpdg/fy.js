import {DisplayObject} from './DisplayOject';

class TabBar extends DisplayObject {

	prevIndex: number;
	selectedIndex: number;
	onSelect?: Function;

	data: any;
	bar: JQuery;
	items: JQuery;


	protected _prevIndex: number;
	protected _selectedIndex: number;
	protected _initSelectedIndex: number;


	constructor(jq, cfg) {
		cfg = $.extend({
			autoFire: true,
			selectedIndex: 0,
			bindOptions: {
				template: '<li>${label}</li>'
			}
		}, cfg);

		super(jq, cfg);


		//this.create(jq, cfg);
	}


	init(jq, cfg) {
		jq.css({display: 'table'});

		let navi = $('<div class="tabNavigator"></div>');

		this.bar = $('<ul class="tabUL"></ul>');

		$('<div class="tabWrap"></div>').append(this.bar).appendTo(navi);

		this.data = cfg.bindOptions.list = cfg.data;

		//console.log(cfg.bindOptions);
		this.bar.bindList(cfg.bindOptions);
		jq.prepend(navi);

		this.items = this.bar.find("li");


		this._prevIndex = -1;
		this._selectedIndex = -1;
		this._initSelectedIndex = (this.items.length > cfg.selectedIndex) ? cfg.selectedIndex : (this.items.length ? 0 : -1);


		let self = this;
		this.bar.on('click.ops', 'li', function (evt) {
			self.selectHandler.call(self, evt);
		});


		if (typeof cfg.onSelect === 'function')
			this.onSelect = cfg.onSelect;


		this.createdHandler(this.data);

		if (cfg.autoFire && cfg.selectedIndex > -1) {
			self.selectedIndex = (cfg.selectedIndex);
		}

		return this;
	}


	selectHandler(evt) {
		evt.stopImmediatePropagation();

		let li = evt.target, i = this.items.index(li);
		if (i === this._selectedIndex && this._prevIndex != -1) return;

		$(li).addClass("current").siblings("li.current").removeClass("current");
		this.selectedIndex = i;

		if (typeof this.onSelect === 'function') this.onSelect.call(this , evt);
	}

	set selectedIndex(i: number) {
		if (this._selectedIndex != i) {
			this._prevIndex = this._selectedIndex;
			this._selectedIndex = i;
			this.bar.find("li:eq(" + i + ")").trigger('click.ops');
		}
	}

	get selectedIndex(): number {
		return this._selectedIndex;
	}
	get prevIndex():number{
		return this._prevIndex;
	}

	getSelectedData(original?: boolean) {
		let src = this.data[this.selectedIndex];
		//过滤对象中的绑定时增加的属性
		if (!original) {
			let tar = {}, key;
			for (key in src) if (key.indexOf(":") === -1) tar[key] = src[key];
			return tar;
		}
		else return src;
	}

}


class TabNavigator extends DisplayObject {

	tabBar: TabBar;
	iframe: JQuery;

	constructor(jq, cfg) {


		super(jq, cfg);

		//this.create(jq, cfg);
	}

	create(jq, cfg) {
		let x = cfg.selectedIndex || 0;
		let self = this;
		cfg.selectedIndex = -1;
		this.tabBar = new TabBar(jq, cfg);
		this.iframe = $('<iframe frameborder="0" src="about:blank"></iframe>').appendTo($('<div class="tabStack"></div>').appendTo(jq));
		this.tabBar.onSelect = function () {
			self.iframe.attr('src', self.tabBar.getSelectedData()['url']);
		};
		this.tabBar.selectedIndex = (x);


		this.createdHandler();
	}
}


class TabView extends DisplayObject {

	views: Array;
	tabBar: TabBar;
	stack: JQuery;

	constructor(jq, cfg) {


		super(jq, cfg);

	}


	create(jq, cfg) {
		this.views = [];

		let x = cfg.selectedIndex || 0;
		let self = this;
		cfg.selectedIndex = -1;
		this.tabBar = new TabBar(jq, cfg);

		this.stack = $('<div class="tabStack"></div>').appendTo($('<div style="display: table-row;height: 100%;"></div>').appendTo(jq));

		for (let i = 0, l = cfg.data.length; i < l; i++) {
			let div = cfg.data[i]['view'];
			this.addView($(div));
		}

		this.tabBar.onSelect = function () {
			if (self.views[self.tabBar.prevIndex])
				self.views[self.tabBar.prevIndex].toggle();

			if (self.views[self.tabBar.selectedIndex])
				self.views[self.tabBar.selectedIndex].toggle();
		};
		this.tabBar.selectedIndex = (x);


		this.createdHandler();
	}

	addView(jqDiv) {
		this.views.push(jqDiv);
		this.stack.append(jqDiv.addClass('tabDivision'));
	}
}

export {TabBar, TabNavigator, TabView};