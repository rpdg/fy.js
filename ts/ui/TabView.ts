import {DisplayObject} from './DisplayOject';

class TabBar extends DisplayObject {

	prevIndex:number;
	selectedIndex:number;
	onSelect?:Function;

	data :any;
	bar :JQuery;
	items :JQuery;

	constructor(jq, cfg) {
		cfg = $.extend({
			autoFire: true,
			selectedIndex: 0,
			bindOptions: {
				template: '<li>${label}</li>'
			}
		}, cfg);

		super(jq, cfg);

		this.prevIndex = -1;
		this.selectedIndex = -1;


		if (typeof cfg.onSelect === 'function')
			this.onSelect = cfg.onSelect;

		this.create(jq, cfg);
	}


	create(jq, cfg) {
		jq.css({display: 'table'});

		var navi = $('<div class="tabNavigator"></div>');

		this.bar = $('<ul class="tabUL"></ul>');

		$('<div class="tabWrap"></div>').append(this.bar).appendTo(navi);

		this.data = cfg.bindOptions.list = cfg.data;

		//console.log(cfg.bindOptions);
		this.bar.bindList(cfg.bindOptions);
		jq.prepend(navi);

		this.items = this.bar.find("li");

		this.selectedIndex = (this.items.length > cfg.selectedIndex) ? cfg.selectedIndex : (this.items.length ? 0 : -1);


		var self = this;
		this.bar.on('click.ops', 'li', function (evt) {
			self.selectHandler.call(self, evt);
		});


		this.createdHandler(this.data);

		if (cfg.autoFire && cfg.selectedIndex > -1) {
			self.selectedIndex = (cfg.selectedIndex);
		}

		return this;
	}


	selectHandler(evt) {
		var li = evt.target, i = this.items.index(li);
		if (i === this.selectedIndex && this.prevIndex != -1) return;

		$(li).addClass("current").siblings("li.current").removeClass("current");

		this.prevIndex = this.selectedIndex;
		this.selectedIndex = i;

		if (typeof this.onSelect === 'function') this.onSelect(evt);
	}

	set selectedIndex(i:number) {
		this.bar.find("li:eq(" + i + ")").trigger('click.ops');
	}

	getSelectedData(original?:boolean) {
		var src = this.data[this.selectedIndex];
		//过滤对象中的绑定时增加的属性
		if (!original) {
			var tar = {}, key;
			for (key in src) if (key.indexOf(":") === -1) tar[key] = src[key];
			return tar;
		}
		else return src;
	}

}


class TabNavigator extends DisplayObject {

	tabBar :TabBar;
	iframe :JQuery;

	constructor(jq, cfg) {


		super(jq, cfg);

		this.create(jq, cfg);
	}

	create(jq, cfg) {
		var x = cfg.selectedIndex || 0;
		var self = this;
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

	views :Array;
	tabBar :TabBar;
	stack :JQuery;

	constructor(jq, cfg) {


		super(jq, cfg);

	}


	create(jq, cfg) {
		this.views = [];

		var x = cfg.selectedIndex || 0;
		var self = this;
		cfg.selectedIndex = -1;
		this.tabBar = new TabBar(jq, cfg);

		this.stack = $('<div class="tabStack"></div>').appendTo(jq);

		for (let i = 0, l = cfg.data.length; i < l; i++) {
			var div = cfg.data[i]['view'];
			this.addView($(div));
		}

		this.tabBar.onSelect = function () {
			if(self.views[self.tabBar.prevIndex])
				self.views[self.tabBar.prevIndex].toggle();
			if(self.views[self.tabBar.selectedIndex])
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