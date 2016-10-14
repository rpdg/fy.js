import {DisplayObject} from 'base';
import {$} from '/es6/util/jquery.plugins';

class Panel extends DisplayObject {
	constructor(jq, cfg) {
		cfg = $.extend({
			title: '内容检索',
			btnClose: true ,
			btnClass : 'btn-primary btn-small',
			btnSearchId : 'btnSearch' ,
			btnSearchText: '<i class="ico-find"></i> 查询'
		}, cfg);

		super(jq, cfg);

		this.cfg = cfg;

		this.created = false;

		this.create(jq, cfg);

	}

	create(jq, cfg) {

		if(jq[0].tagName === 'DIV' && !jq[0].className){
			this.panel = jq.addClass('panel');
		}
		else{
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

			var self = this;
			this.btnClose.on('click', function () {
				var btn = $(this);
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

		if(cfg.btnSearchId){
			this.btnSearch = $(`<button id="${cfg.btnSearchId}" class="${cfg.btnClass}">${cfg.btnSearchText}</button>`) ;
			this.addToFoot(this.btnSearch) ;
		}

		jq.append(this.panel);

		this.created = true;
		if ($.isFunction(this.onCreate)) this.onCreate();

		return this;
	}


	addToBody(selector) {
		this.body.append($(selector));
	}

	addToFoot(selector) {
		this.foot.append($(selector));
	}

	static wrapPanel(selector , cfg){
		var target = $(selector) ;
		var wrapper = $('<div />');

		target.replaceWith(wrapper);

		var sets = $.extend({
			onCreate: function () {
				this.addToBody(target);
			}
		} , cfg) ;

		return ops(wrapper).panel(sets);
	}
}


export {Panel}