import {DisplayObject} from './DisplayOject';

class Panel extends DisplayObject {
	cfg: any;
	panel: JQuery;
	body ?: JQuery;
	foot ?: JQuery;
	titleBar ?: JQuery;
	btnClose ?: JQuery;
	btnSearch ?: JQuery;

	constructor(jq: JQuery, cfg: any) {
		cfg = $.extend({
			title: '内容检索',
			btnClose: true,
			btnClass: 'btn-primary btn-small',
			btnSearchId: 'btnSearch',
			btnSearchText: '<i class="ico-find"></i> 查询'
		}, cfg);

		super(jq, cfg);
	}

	init(jq: JQuery, cfg: any) {
		super.init(jq, cfg);
		this.cfg = cfg;
	}

	create(jq: JQuery, cfg: any) {

		if (jq[0].tagName === 'DIV' && !jq[0].className) {
			this.panel = jq.addClass('panel');
		}
		else {
			this.panel = $('<div class="panel" />');
		}
		this.panel.show();

		this.titleBar = $('<div class="panel-title" />');
		this.titleBar.html(cfg.title);
		this.panel.append(this.titleBar);

		this.body = $('<div class="panel-body" />');
		this.panel.append(this.body);

		this.foot = $('<div class="panel-foot" />');
		this.panel.append(this.foot);

		if (cfg.btnClose) {
			this.btnClose = $('<b class="panel-collapse" />');
			this.titleBar.append(this.btnClose);

			let self = this;
			this.btnClose.on('click', function () {
				let btn = $(this);
				if (!btn.hasClass('expanded')) {
					self.body.hide();
					self.foot.hide();
				}
				else {
					self.body.show();
					self.foot.show();
				}
				btn.toggleClass('expanded');
			});
		}

		if (cfg.btnSearchId) {
			this.btnSearch = $(`<button id="${cfg.btnSearchId}" class="${cfg.btnClass}">${cfg.btnSearchText}</button>`);
			this.addToFoot(this.btnSearch);
		}

		jq.append(this.panel);

		this.createdHandler();
	}


	addToBody(selector) {
		this.body.append($(selector));
	}

	addToFoot(selector) {
		this.foot.append($(selector));
	}

	static wrapPanel(selector, cfg) :Panel {
		let target = $(selector) ;
		let wrapper = $('<div />');

		target.replaceWith(wrapper);

		let sets = $.extend({
			onCreate: function () {
				this.addToBody(target);
			}
		}, cfg);

		return new Panel(wrapper, sets);
	}
}


export default Panel;