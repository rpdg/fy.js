import {DisplayObject} from 'base';
import {guid} from '/es6/util/uuid' ;
import {$} from '/es6/util/jquery.plugins';


const DEFAULTS = {
	title: null,           // titlebar text. titlebar will not be visible if not set.
	btnClose: true,           // display close link in titlebar?
	btnMax: false,           // display max link in titlebar?
	drag: true,           // can this dialog be dragged?
	modal: true,          // make dialog modal?
	show: true,           // show dialog immediately?
	destroy: true,          // should this dialog be removed from the DOM after being hidden?
	onClose: $.noop,        // callback fired after dialog is hidden. executed in context of Boxy instance.
	onDestroy: $.noop,
	buttons: null
};

const BoxyStore = {
	_handleDrag: (evt)=> {
		//evt.preventDefault() ;
		var d = BoxyStore.dragging;

		if (d) {

			var w = evt.pageX - d[1];
			var h = evt.pageY - d[2];

			if (w < 1) w = 1;
			else if (w > d[3]) w = d[3];

			if (h < 1) h = 1;
			else if (h > d[4]) h = d[4];

			d[0].style.cssText += ';left:' + w + 'px;top:' + h + 'px;';

		}
	}
};

const nextZ = (()=> {
	var zIndex = 1000;
	return ()=> ++zIndex;
})();


const returnFalse = ()=>false;


function setTitleBar(cfg) {
	let self = this;
	let tb = this.titleBar = $(`<div class="dg-title">${cfg.title}</div>`);
	this.boxy.append(this.titleBar);
	tb[0].onselectstart = returnFalse;

	var btnSets = $('<div class="dg-title-buttons"></div>').appendTo(tb);

	if (cfg.btnMax) {
		this.btnMax = $("<b class='dg-btn-max'></b>");
		btnSets.append(this.btnMax);
		this.btnMax.on('click', function () {
			self.toggle();
		});
	}
	if (cfg.btnClose) {
		this.btnClose = $("<b class='dg-btn-x'></b>");
		btnSets.append(this.btnClose);

		this.btnClose.on('click', function () {
			self.close();
		});
	}

	if (cfg.drag) {
		setDraggable.call(this, this, cfg);
	}

	$('<div class="row tb-row" />').prependTo(this.boxy).append(tb);


}


function setDraggable(self) {
	let tb = self.titleBar;

	tb.on('mousedown', function (evt) {
		self.toTop();

		if (evt.target.tagName === 'B') return;

		if (evt.button < 2 && self.state !== "max") {

			tb.on('mousemove.boxy', function (e) {
				tb.unbind("mousemove.boxy");

				var boxy = self.boxy[0];


				document.onselectstart = returnFalse;

				var size = self.getSize();

				BoxyStore.dragging = [
					boxy,
					e.pageX - boxy.offsetLeft,
					e.pageY - boxy.offsetTop,
					document.body.scrollWidth - size.width,
					document.body.scrollHeight - size.height
				];

				$(document)
					.bind("mousemove.boxy", BoxyStore._handleDrag)
					.bind("mouseup.boxy", function () {
						if (self.state !== "max" && BoxyStore.dragging) {
							$(document).unbind(".boxy");
							BoxyStore.dragging = document.onselectstart = null;

							var pos = self.boxy.position();
							self.restoreSize.top = pos.top;
							self.restoreSize.left = pos.left;

						}
					});
			});

		}

		tb.on("mouseup.boxy", function () {
			tb.unbind(".boxy");
		});

	});
}

function setFooter(cfg) {
	var footer = this.footBar = $('<div class="dg-footer"></div>');

	var htmlArr = [];
	for (let key in cfg.buttons) {
		var v = cfg.buttons[key], x = htmlArr.length;

		let cls, txt;

		if (typeof v === 'string') {
			cls = (x === 0 ? 'btn-primary' : '');
			txt = v;
		}
		else {
			cls = v.className || '';
			txt = v.text || '';
		}

		htmlArr.push('<button class="' + cls + '" name="' + x + '">' + txt + '</button>');
	}

	footer.html(htmlArr.join(' '));


	var self = this;
	footer.on('click', 'button', function (evt) {
		if (cfg.callback) {
			var clicked = this;
			var ifrWin;
			if (self.iframe) {
				ifrWin = self.iframe.contentWindow ? self.iframe.contentWindow : self.iframe.contentDocument.defaultView;
			}

			var i = parseInt(clicked.name, 10);

			var wontClose = cfg.callback(i, evt, ifrWin);

			if (!wontClose) self.close();

		}
		else self.close();
	});

	$('<div class="row tf-row" />').appendTo(this.boxy).append(footer);
}

class PopUp extends DisplayObject {

	constructor(jq, cfg) {

		cfg = $.extend({}, DEFAULTS, cfg);


		super(jq, cfg);

		this.cfg = cfg;

		this.create(jq, cfg);

	}

	create(jq, cfg) {
		this.state = 'normal';
		this.visible = false;

		this.mask = $('<div class="dg-mask"></div>');
		this.boxy = $('<div class="dg-wrapper" id="' + ('dialog_' + guid() ) + '"></div>');
		this.content = $('<div class="dg-content"></div>');


		this.content.append(jq);
		this.boxy.append(this.content).appendTo(document.body);


		var titleBarHeight = 0;

		if (cfg.title) {
			setTitleBar.call(this, cfg);
			titleBarHeight = this.titleBar.outerHeight();
			this.boxy.find('.tb-row').css({height: titleBarHeight});
		}

		this.iframe = this.jq[0].tagName === 'IFRAME' ? this.jq[0] : undefined;


		var contentSize = {
			width: cfg.width || this.boxy.outerWidth() || 500,
			height: cfg.height || this.boxy.outerHeight() || 300
		};

		/*//console.log(size);
		 this.boxy.css(contentSize);*/

		if (cfg.buttons) {
			setFooter.call(this, cfg);
			this.boxy.find('.tf-row').css({height: this.footBar.outerHeight()});
		}

		var doc = document.documentElement;//, win = window;

		var viewport = {
			//top: win.pageYOffset,
			//left: win.pageXOffset,
			width: doc.clientWidth,
			height: doc.clientHeight
		};
		//console.log(p);

		var pos = {
			width: cfg.width || this.boxy.outerWidth() || 500,
			height: cfg.height || this.boxy.outerHeight() || 300,
			top: Math.max(0, (viewport.height - contentSize.height ) / 2 ),
			left: Math.max(0, (viewport.width - contentSize.width) / 2)
		};


		this.boxy.css(pos);

		this.restoreSize = pos;

		//console.warn(this.restoreSize);

		this.mask.append(this.boxy.css({visibility: 'visible'})).appendTo(document.body);


		this.toTop();

		if(navigator.userAgent.indexOf('Firefox')>-1 && this.iframe){
			jq.css({height: contentSize.height - titleBarHeight - 2});
		}

		if (cfg.show) this.open();

	}

	getSize() {
		return {
			width: this.boxy.outerWidth(),
			height: this.boxy.outerHeight()
		}
	}

	getPosition() {
		var b = this.boxy[0];
		return {left: b.offsetLeft, top: b.offsetTop};
	}

	toTop() {
		this.mask.css({zIndex: nextZ()});
		return this;
	}

	open() {

		this.boxy.stop(true, true);

		if (this.visible) {
			return this.toTop();
		}

		this.mask.css({display: "block", opacity: 1});

		var topPx = this.boxy.position().top ;

		//console.warn(topPx);

		this.boxy.css({top: topPx - 20, opacity: 0}).animate({opacity: 1, top: topPx}, 300 );

		this.visible = true;
		return this;
	}

	close(fn) {

		var that = this;
		var css = this.getPosition();
		css.opacity = 0;
		css.top = Math.max(css.top - 40, 0);

		this.mask.animate({opacity: 0}, 200);

		this.boxy.stop(true, true).animate(css, 300, function () {


			if (typeof that.cfg.onClose === 'function')
				that.cfg.onClose.call(that);

			if (typeof fn === 'function')
				fn.call(that);


			if (that.cfg.destroy)
				that.destroy();
			else {
				that.visible = false;
				that.mask.css({display: 'none'});
			}
		});


		return this;
	}

	max() {
		//resize window entity
		this.boxy.stop(true, true).css({
			left: 0,
			top: 0,
			width: '100%',
			height: '100%'
		});


		if (this.btnMax)
			this.btnMax.toggleClass('dg-btn-max dg-btn-restore');

		$(document.body).addClass('no-scroll');

		this.state = 'max';
		return this;
	}

	restore() {


		this.boxy.stop(true, true).css(this.restoreSize);


		if (this.btnMax)
			this.btnMax.toggleClass('dg-btn-max dg-btn-restore');

		$(document.body).removeClass('no-scroll');

		this.state = 'normal';

		return this;
	}

	destroy() {

		if (this.titleBar) {
			this.titleBar.off('mousedown');
			if (this.btnMax) this.btnMax.off('click');
			if (this.btnClose) this.btnClose.off('click');
		}
		if (this.footBar)
			this.footBar.off('click');


		this.mask.remove();
	}

	toggle() {
		if (this.state === 'normal') {
			this.max();

			if(navigator.userAgent.indexOf('Firefox')>-1 && this.iframe){
				this.iframe.style.cssText+= 'height: '+ (this.boxy.outerHeight() - this.titleBar.outerHeight() - 2) + 'px; ';
			}

		}
		else {
			this.restore();

			if(navigator.userAgent.indexOf('Firefox')>-1 && this.iframe){
				this.iframe.style.cssText+= 'height: '+ (this.restoreSize.height - this.titleBar.outerHeight() - 2) + 'px; ';
			}
		}


		return this;
	}


	static alert(message, callback, options = {}) {

		var {html, cfg} = wrapAsk(message, callback, options);

		return new PopUp($(html), cfg);
	}

	static confirm(message, callback, options = {}) {

		var {html, cfg} = wrapAsk(message, callback, options);

		if (!cfg.buttons.cancel) {
			cfg.buttons.cancel = '取消';
		}

		cfg.callback = function (i, evt, ifrWin) {
			if (i === 0) return callback(i, evt, ifrWin);
			return void(0);
		};

		return new PopUp($(html), cfg);
	}

	static popTop(iframe, options) {
		return top.ops(iframe).popup(options);
	}
}

function wrapAsk(msg, cb, cfg) {
	if (typeof cb === 'function')
		cfg.callback = cb;

	if (!cfg.buttons) {
		cfg.buttons = {};
	}

	if (!cfg.buttons.ok) {
		cfg.buttons.ok = '确定';
	}

	var html ;
	if(typeof msg === 'string' && msg.indexOf('<iframe ') < 0){
		html =  `<div class="dg-alert">${msg}</div>` ;
	}
	else html =  msg;

	return {html, cfg};
}


export {PopUp};