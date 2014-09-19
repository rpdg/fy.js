/**
 * popup
 * last modified 2012-12-17
 */
;
(function (window, $, fy, undefined) {

	var popup = function (jq, cfg) {
		var def = {
				title : "对话框"
				, hideFade :true
				//, unloadOnHide : true
			} ,
			sets = $.extend(def , cfg) ;

		//call super constructor
		popup.parent.call(this, jq, sets);

		//self attributes
		this.boxy = null ;


		this.create(sets);
	};

	popup.prototype = {
		create:function (sets) {
			if (typeof this.onInit === 'function') this.onInit();

			//log.warn(this.jq[0]);

			this.boxy = new Boxy(this.jq, sets);

			this.jq = this.boxy.boxy;



			this.createHandler();

			return this;
		},

		/**
		 * Returns the Boxy instance containing element,
		 * e.g. <a href="#" onclick="Boxy.get(this).hide();">Close dialog</a>.
		 * @param elem
		 * @return {boxy}
		 */
		get : function(elem){
			return this.boxy.get(elem);
		},
		/**
		 * Returns a jQuery object wrapping the dialog's inner region -
		 * everything inside the frame, including the title bar.
		 * Chances are you want getContent(), below, instead.
		 * @returns a jQuery Object
		 */
		getInner : function(){
			return this.boxy.getInner();
		},
		/**
		 * Returns a jQuery object wrapping the dialog's content region -
		 * everything inside the frame, excluding the title bar.
		 * @returns a jQuery Object
		 */
		getContent : function(){
			return this.boxy.getContent();
		},
		setContent : function(obj){
			this.boxy.setContent(obj);
			return this;
		},
		getTitle : function(){
			return this.boxy.getTitle();
		},
		setTitle : function(html){
			this.boxy.setTitle(html);
			return this;
		},
		getPosition : function(){
			var arr = this.boxy.getPosition();
			return {
				x: arr[0] ,
				y: arr[1]
			}
		},
		moveTo : function(x,y){
			this.boxy.moveTo(x,y) ;
			return this;
		} ,
		moveToX : function(x){
			this.boxy.moveToX(x) ;
			return this;
		} ,
		moveToY : function(y){
			this.boxy.moveToY(y) ;
			return this;
		} ,
		/**
		 * @public
		 * Moves the dialog so that it is centered in the viewport. Chainable.
		 * @param {string} axis Optional parameter axis can be 'x' or 'y' to center on a single axis only.
		 */
		center :function(axis){
			this.boxy.center(axis) ;
			return this;
		},
		centerAt :function(x, y){
			this.boxy.centerAt(x, y) ;
			return this;
		},
		getCenter : function(){
			var arr = this.boxy.getCenter();
			return {
				x: arr[0] ,
				y: arr[1]
			}
		},
		resize :function(w,h,callback){
			this.boxy.resize(w,h, callback) ;
			return this;
		},
		tween :function(w,h,callback){
			this.boxy.tween(w,h, callback) ;
			return this;
		},
		getSize : function(){
			var arr = this.boxy.getSize();
			return {
				width: arr[0] ,
				height:arr[1]
			}
		},
		getContentSize: function(){
			var arr = this.boxy.getContentSize() ;
			return {
				width: arr[0] ,
				height:arr[1]
			}
		} ,
		/**
		 * @public
		 * Estimate the size of the dialog box while invisible.
		 * Do not use this method if dialog is currently visible, use getSize() instead.
		 * @returns object of {width , height}
		 */
		estimateSize : function(){
			var arr = this.boxy.estimateSize();
			return {
				width: arr[0] ,
				height:arr[1]
			}
		},
		toTop : function(){
			this.boxy.toTop();
			return this;
		},
		show : function(){
			this.boxy.show().toTop() ;
			return this;
		},
		hide : function(callback){
			this.boxy.hide(callback) ;
			return this;
		},
		toggle : function(){
			this.boxy.toggle() ;
			return this;
		},
		maximum:function(){
			this.boxy.winState = null ;
			if(this.boxy.btnMax) this.boxy.btnMax.trigger("click") ;
			else this.boxy.maximum();
			return this;
		},
		/**
		 * @public
		 * Hide the dialog and then immediately destory. Chainable.
		 * @param {function} callback will be fired before destory
		 * @returns this
		 */
		closeAndDestroy : function(callback){
			this.boxy.hideAndUnload(callback) ;
			return this;
		},
		destroy : function(){
			this.boxy.unload() ;
			return this;
		},
		isVisible:function(){
			return this.boxy.isVisible() ;
		},
		/**
		 * Returns true if any modal dialog is currently visible, false otherwise.
		 * @return {boolean}
		 */
		isModalVisible:function(){
			return this.boxy.isModalVisible() ;
		}
	};
	fy.register("popup", popup, "DisplayObject");


	/**
	 * some shortcuts
	 */
	fy.dialog = function(content, btns, callback, options){
		var vec = Boxy.ask(content, btns, callback, $.extend({title: null, show: true, unloadOnHide: true} , options )) ;
		return fy(vec[0]).popup(vec[1]) ;
	} ;
	fy.alert = function(message, callback, options){
		var vec = Boxy.alert(message, callback, $.extend({title: null, show: true, unloadOnHide: true} , options )) ;
		var pop = fy(vec[0]).popup(vec[1]) ;
		pop.jq.find(".answers>.fyBtnImportant")[0].focus();
		return pop ;
	} ;
	fy.confirm = function(message, callback, options){
		var vec = Boxy.confirm(message, callback, $.extend({title: "请确认您的操作" , show: true, unloadOnHide: true} ,options )) ;
		return fy(vec[0]).popup(vec[1]) ;
	} ;

	fy.popHTML = function(url, options) {
		options = options || {};
		var ajax = {
			url: url, type: 'GET', dataType: 'html', cache: false, success: function(html) {
				html = jQuery(html);
				if (options.filter) html = jQuery(options.filter, html);
				new Boxy(html, options);
			}
		};
		$.each(['type', 'cache'], function() {
			if (this in options) {
				ajax[this] = options[this];
				delete options[this];
			}
		});
		$.ajax(ajax);
	};

	fy.popImage = function(url , cfg){
		var img = new Image();
		img.onload = function() {
			new Boxy($('<div class="boxy-image-wrapper"/>').append(this), cfg);
		};
		img.src = url;
	};
})(window, jQuery, fy);













/**
 *
 * @param options
 * @return {*}
 */

/**
 * Boxy 0.1.4 - Facebook-style dialog, with frills
 *
 * (c) Jason Frame
 * Licensed under the MIT License (LICENSE)
 */

/*
 * jQuery plugin
 *
 * Options:
 *   message: confirmation message for form submit hook (default: "Please confirm:")
 *
 * Any other options - e.g. 'clone' - will be passed onto the boxy constructor (or
 * Boxy.load for AJAX operations)
 */
jQuery.fn.boxy = function(options) {
	options = options || {};
	return this.each(function() {
		var node = this.nodeName.toLowerCase(), self = this;
		if (node === 'a') {
			jQuery(this).click(function() {
				var active = Boxy.linkedTo(this),
					href = this.getAttribute('href'),
					localOptions = jQuery.extend({actuator: this, title: this.title}, options);

				if (href.match(/(&|\?)boxy\.modal/)) localOptions.modal = true;

				if (active) {
					active.show();
				} else if (href.indexOf('#') >= 0) {
					var content = jQuery(href.substr(href.indexOf('#'))),
						newContent = content.clone(true);
					content.remove();
					localOptions.unloadOnHide = false;
					new Boxy(newContent, localOptions);
				} else if (href.match(/\.(jpe?g|png|gif|bmp)($|\?)/i)) {
					localOptions.unloadOnHide = true;
					Boxy.loadImage(this.href, localOptions);
				} else { // fall back to AJAX; could do with a same-origin check
					if (!localOptions.cache) localOptions.unloadOnHide = true;
					Boxy.load(this.href, localOptions);
				}

				return false;
			});
		} else if (node == 'form') {
			jQuery(this).bind('submit.boxy', function() {
				Boxy.confirm(options.message || 'Please confirm:', function() {
					jQuery(self).unbind('submit.boxy').submit();
				});
				return false;
			});
		}
	});
};

//
// Boxy Class

function Boxy(element, options) {

	this.boxy = jQuery(Boxy.WRAPPER).attr("id" , 'boxy_' + Math.random());
	jQuery.data(this.boxy[0], 'boxy', this);

	this.visible = false;
	this.options = jQuery.extend({}, Boxy.DEFAULTS, options || {});

	/*if (this.options.modal) {
	 this.options = jQuery.extend(this.options, {center: true, draggable: false});
	 }*/

	// options.actuator == DOM element that opened this boxy
	// association will be automatically deleted when this boxy is remove()d
	if (this.options.actuator) {
		jQuery.data(this.options.actuator, 'active.boxy', this);
	}

	element = $(element || "<div></div>");
	this.setContent(element);
	this._setupTitleBar();

	this.boxy.css('display', 'none').appendTo(document.body);
	this.toTop();

	//log( element[0] , element.eq(0).outerHeight(true) ) ;
	//log('222' , element , jQuery(window).height() ) ;
	element = jQuery(element).eq(0);
	var wmh = jQuery(window).height()- 125 ;
	if(wmh < element.outerHeight(true)){
		element.height(wmh) ;
	}

	if (this.options.fixed) {
		if (Boxy.IE6) {
			this.options.fixed = false; // IE6 doesn't support fixed positioning
		} else {
			this.boxy.addClass('fixed');
		}
	}

	if (this.options.center && Boxy._u(this.options.x, this.options.y)) {
		this.center();
	} else {
		this.moveTo(
			Boxy._u(this.options.x) ? Boxy.DEFAULT_X : this.options.x,
			Boxy._u(this.options.y) ? Boxy.DEFAULT_Y : this.options.y
		);
	}

	if (this.options.show) this.show();

}

fy.popupManager = Boxy;

Boxy.EF = fy.EMPTY_FN;
Boxy.PREVENT_FN = fy.PREVENT_FN;

jQuery.extend(Boxy, {

	/*WRAPPER:    "<table cellspacing='0' cellpadding='0' border='0' class='boxy-wrapper'>" +
	 "<tr><td class='boxy-top-left'></td><td class='boxy-top'></td><td class='boxy-top-right'></td></tr>" +
	 "<tr><td class='boxy-left'></td><td class='boxy-inner'></td><td class='boxy-right'></td></tr>" +
	 "<tr><td class='boxy-bottom-left'></td><td class='boxy-bottom'></td><td class='boxy-bottom-right'></td></tr>" +
	 "</table>",*/
	WRAPPER : '<div class="boxy-wrapper"><div class="boxy-inner"></div></div>' ,

	DEFAULTS: {
		title:                  null,           // titlebar text. titlebar will not be visible if not set.
		closeable:              true,           // display close link in titlebar?
		minimizable:              false,           // display min link in titlebar?
		maximizable:              false,           // display max link in titlebar?
		draggable:              true,           // can this dialog be dragged?
		clone:                  false,          // clone content prior to insertion into dialog?
		actuator:               null,           // element which opened this dialog
		center:                 true,           // center dialog in viewport?
		show:                   true,           // show dialog immediately?
		modal:                  false,          // make dialog modal?
		fixed:                  true,           // use fixed positioning, if supported? absolute positioning used otherwise
		closeText:              '',      // text to use for default close link
		maxText:              '',      // text to use for default max link
		minText:              '',      // text to use for default min link
		restoreText:              '',      // text to use for default close link
		unloadOnHide:           false,          // should this dialog be removed from the DOM after being hidden?
		clickToFront:           false,          // bring dialog to foreground on any click (not just titlebar)?
		behaviours:             Boxy.EF,        // function used to apply behaviours to all content embedded in dialog.
		afterDrop:              Boxy.EF,        // callback fired after dialog is dropped. executes in context of Boxy instance.
		afterShow:              Boxy.EF,        // callback fired after dialog becomes visible. executes in context of Boxy instance.
		afterHide:              Boxy.EF,        // callback fired after dialog is hidden. executed in context of Boxy instance.
		beforeUnload:           Boxy.EF,        // callback fired after dialog is unloaded. executed in context of Boxy instance.
		beforeHide:             Boxy.EF,        // callback fired after dialog is hide. executed in context of Boxy instance.
		onMax:                  Boxy.EF,
		onMin:                  Boxy.EF,
		onRestore:              Boxy.EF,
		hideFade:               false,
		hideShrink:             'vertical'
	},

	IE6:                (jQuery.browser.msie && jQuery.browser.version < 7),
	DEFAULT_X:          50,
	DEFAULT_Y:          50,
	MODAL_OPACITY:      0.05 ,
	zIndex:             9000,
	dragConfigured:     false, // only set up one drag handler for all boxys
	resizeConfigured:   false,
	dragging:           null,

	// load a URL and display in boxy
	// url - url to load
	// options keys (any not listed below are passed to boxy constructor)
	//   type: HTTP method, default: GET
	//   cache: cache retrieved content? default: false
	//   filter: jQuery selector used to filter remote content
	load: function(url, options) {

		options = options || {};

		var ajax = {
			url: url, type: 'GET', dataType: 'html', cache: false, success: function(html) {
				html = jQuery(html);
				if (options.filter) html = jQuery(options.filter, html);
				new Boxy(html, options);
			}
		};

		jQuery.each(['type', 'cache'], function() {
			if (this in options) {
				ajax[this] = options[this];
				delete options[this];
			}
		});

		jQuery.ajax(ajax);

	},

	loadImage: function(url, options) {
		var img = new Image();
		img.onload = function() {
			new Boxy($('<div class="boxy-image-wrapper"/>').append(this), options);
		};
		img.src = url;
	},

	// allows you to get a handle to the containing boxy instance of any element
	// e.g. <a href='#' onclick='alert(Boxy.get(this));'>inspect!</a>.
	// this returns the actual instance of the boxy 'class', not just a DOM element.
	// Boxy.get(this).hide() would be valid, for instance.
	get: function(ele) {
		var p = jQuery(ele).parents('.boxy-wrapper');
		return p.length ? jQuery.data(p[0], 'boxy') : null;
	},

	// returns the boxy instance which has been linked to a given element via the
	// 'actuator' constructor option.
	linkedTo: function(ele) {
		return jQuery.data(ele, 'active.boxy');
	},

	// displays an alert box with a given message, calling optional callback
	// after dismissal.
	alert: function(message, callback, options) {
		if(typeof callback != 'function' && !options) {
			options = callback ;
			callback = null ;
		}
		var pop = Boxy.ask(message, [options.btnOK?options.btnOK:'确定'], callback, options);
		var btns = pop[0].eq(1).find("button") ;
		btns.eq(0).addClass("fyBtnImportant") ;
		return pop ;
	},

	// displays an alert box with a given message, calling after callback iff
	// user selects OK.
	confirm: function(message, callback, options) {
		var pop =  Boxy.ask(message, [options.btnOK?options.btnOK:'确定', options.btnCancel?options.btnCancel:'取消'], function(i , evt , ifrWin) {
			if (i===0) return callback(i , evt , ifrWin);
			return void(0);
		}, options );

		var btns = pop[0].eq(1).find("button") ;
		btns.eq(0).addClass("fyBtnImportant") ;
		btns.eq(1).addClass("fyBtn") ;
		return pop ;
	},

	// asks a question with multiple responses presented as buttons
	// selected item is returned to a callback method.
	// answers may be either an array or a hash. if it's an array, the
	// the callback will received the selected value. if it's a hash,
	// you'll get the corresponding key.
	ask: function(question, answers, callback, options) {

		question = jQuery('<div class="question"></div>').append(question).appendTo('body') ;


		//log('qqq' , question.outerHeight(true));

		var wmh = jQuery(window).height()- 125 ;
		if(wmh < question.outerHeight(true)){
			question.height(wmh) ;
		}

		options = jQuery.extend({title: "网页对话框" , show: true , modal: true, closeable: false}, options || {} );

		var body = jQuery('<div></div>').append(question);

		body.ifrWin = (question.find('iframe').length > 0) ;
		//log(body.appendTo('body').height(500));

		var buttons = jQuery('<div class="answers"></div>');

		buttons.html(jQuery.map(Boxy._values(answers), function(v , x) {
			var cls = (x===0?'fyBtnImportant':'fyBtn');
			return '<button class="boxy-button '+cls+'" name="'+x+'">' + v + '</button>' ;
		}).join(' '));

		jQuery('button', buttons).click(function(evt) {
			var clicked = this;
			if (callback) {
				var ifrWin ;

				if(body.ifrWin) {
					var iframe = question.find('iframe')[0];
					ifrWin = iframe.contentWindow? iframe.contentWindow : iframe.contentDocument.defaultView;
				}

				var i = parseInt(clicked.name, 10) ;

				var dontClose = callback(i , evt , ifrWin);

				ifrWin = null;

				if(!dontClose) Boxy.get(clicked).hide();
				//else keep the popup opening
			}
			else Boxy.get(clicked).hide();
		});


		body.after(buttons);

		//return new Boxy(body, options);
		return [body.add(buttons), options] ;

	},

	// returns true if a modal boxy is visible, false otherwise
	isModalVisible: function() {
		return jQuery('.boxy-modal-blackout').length > 0;
	},

	_u: function() {
		for (var i = 0; i < arguments.length; i++)
			if (typeof arguments[i] != 'undefined') return false;
		return true;
	},

	_values: function(t) {
		if (t instanceof Array) return t;
		var o = [];
		for (var k in t) o.push(t[k]);
		return o;
	},

	_handleResize: function(evt) {
		jQuery('.boxy-modal-blackout').css('display', 'none')
			.css(Boxy._cssForOverlay())
			.css('display', 'block');
	},

	_handleDrag:function (evt) {
		//evt.preventDefault() ;
		var d = Boxy.dragging;
		if (d) {
			////d[0].boxy.css({left: evt.pageX - d[1], top: evt.pageY - d[2]});
			//var evt = e || window.event;
			//if (!evt.pageX) evt.pageX = evt.clientX;
			//if (!evt.pageY) evt.pageY = evt.clientY;

			var w = evt.pageX - d[1];
			var h = evt.pageY - d[2];

			if (w < 3) w = 3;
			else if (w > d[3]) w = d[3];

			if (h < 3) h = 3;
			else if (h > d[4]) h = d[4];

			var css = ';left:' + w + 'px;top:' + h + 'px;';
			Boxy.dragConfigured[0].style.cssText += css;
			if(d[5]) d[0].style.cssText += css ;
		}
	},

	_nextZ: function() {
		return Boxy.zIndex++;
	},

	_viewport: function() {
		var d = document.documentElement, b = document.body, w = window;
		return jQuery.extend(
			jQuery.browser.msie ?
			{ left: b.scrollLeft || d.scrollLeft, top: b.scrollTop || d.scrollTop } :
			{ left: w.pageXOffset, top: w.pageYOffset },
			!Boxy._u(w.innerWidth) ?
			{ width: w.innerWidth, height: w.innerHeight } :
				(!Boxy._u(d) && !Boxy._u(d.clientWidth) && d.clientWidth != 0 ?
				{ width: d.clientWidth, height: d.clientHeight } :
				{ width: b.clientWidth, height: b.clientHeight }) );
	},

	_setupModalResizing: function() {
		if (!Boxy.resizeConfigured) {
			//var w = jQuery(window).resize(Boxy._handleResize);
			//if (Boxy.IE6) w.scroll(Boxy._handleResize);
			Boxy.resizeConfigured = true;
		}
	},

	_cssForOverlay: function() {
		if (Boxy.IE6) {
			return Boxy._viewport();
		} else {
			return {width: '100%', height: jQuery(document).height()};
		}
	}

});

Boxy.prototype = {

	// Returns the size of this boxy instance without displaying it.
	// Do not use this method if boxy is already visible, use getSize() instead.
	estimateSize: function() {
		this.boxy.css({visibility: 'hidden', display: 'block'});
		var dims = this.getSize();
		this.boxy.css('display', 'none').css('visibility', 'visible');
		return dims;
	},

	// Returns the dimensions of the entire boxy dialog as [width,height]
	getSize: function() {
		return [this.boxy.outerWidth(), this.boxy.outerHeight()];
	},

	// Returns the dimensions of the content region as [width,height]
	getContentSize: function() {
		var c = this.getContent();
		return [c.width(), c.height()];
	},

	// Returns the position of this dialog as [x,y]
	getPosition: function() {
		var b = this.boxy[0];
		return [b.offsetLeft, b.offsetTop];
	},

	// Returns the center point of this dialog as [x,y]
	getCenter: function() {
		var p = this.getPosition();
		var s = this.getSize();
		return [Math.floor(p[0] + s[0] / 2), Math.floor(p[1] + s[1] / 2)];
	},

	// Returns a jQuery object wrapping the inner boxy region.
	// Not much reason to use this, you're probably more interested in getContent()
	getInner: function() {
		return jQuery('.boxy-inner', this.boxy);
	},

	// Returns a jQuery object wrapping the boxy content region.
	// This is the user-editable content area (i.e. excludes titlebar)
	getContent: function() {
		var content = jQuery('.boxy-content', this.boxy);
		if(content.length>1) content = content.find('.question').children(":first") ;
		return content ;
	},

	// Replace dialog content
	setContent: function(newContent) {
		newContent = jQuery(newContent).css({display: 'block'}).addClass('boxy-content');
		if (this.options.clone) newContent = newContent.clone(true);
		this.getContent().remove();
		this.getInner().append(newContent);
		//this._setupDefaultBehaviours(newContent);
		this.options.behaviours.call(this, newContent);
		return this;
	},

	// Move this dialog to some position, funnily enough
	moveTo: function(x, y) {
		//this.moveToX(x).moveToY(y);
		if (typeof x == 'number' && typeof y == 'number') this.boxy.css({left: x , top: y});
		return this;
	},

	// Move this dialog (x-coord only)
	moveToX: function(x) {
		if (typeof x == 'number') this.boxy.css({left: x});
		else this.centerX();
		return this;
	},

	// Move this dialog (y-coord only)
	moveToY: function(y) {
		if (typeof y == 'number') this.boxy.css({top: y});
		else this.centerY();
		return this;
	},

	// Move this dialog so that it is centered at (x,y)
	centerAt: function(x, y) {
		var s = this[this.visible ? 'getSize' : 'estimateSize']();
		if (typeof x == 'number') {
			var _x = x - s[0] / 2 ;
			this.moveToX(_x<0 ? 0 : _x);
		}
		if (typeof y == 'number') {
			var _y = y - s[1] / 2 ;
			this.moveToY( _y < 0 ? 0 : _y );
		}
		return this;
	},

	centerAtX: function(x) {
		return this.centerAt(x, null);
	},

	centerAtY: function(y) {
		return this.centerAt(null, y);
	},

	// Center this dialog in the viewport
	// axis is optional, can be 'x', 'y'.
	center: function(axis) {
		var v = Boxy._viewport();
		var o = this.options.fixed ? [0, 0] : [v.left, v.top];
		if (!axis || axis == 'x') this.centerAt(o[0] + v.width / 2, null);
		if (!axis || axis == 'y') this.centerAt(null, o[1] + v.height / 2);
		return this;
	},

	// Center this dialog in the viewport (x-coord only)
	centerX: function() {
		return this.center('x');
	},

	// Center this dialog in the viewport (y-coord only)
	centerY: function() {
		return this.center('y');
	},

	// Resize the content region to a specific size
	resize: function(width, height, after) {
		if (!this.visible) return this;
		var bounds = this._getBoundsForResize(width, height);
		//this.boxy.css({left: bounds[0], top: bounds[1]});
		this.getContent().css({width: bounds[2], height: bounds[3]});
		if (after) after(this);
		return this;
	},

	// Tween the content region to a specific size
	tween: function(width, height, after) {
		if (!this.visible) return this;
		var bounds = this._getBoundsForResize(width, height);
		var self = this;
		this.boxy.stop().animate({left: bounds[0], top: bounds[1]} , 300);
		this.getContent().stop().animate({width: bounds[2], height: bounds[3]} , 300,  function() {
			if (after) after(self);
		});
		return this;
	},

	maximum : function(sender){
		var win = jQuery(window) ,
			boxy = this.boxy.stop(true , true) ,
			content = this.getContent() ;
		var cW = content.width() ,
			cH = content.height();

		if(sender) {
			this.winState = "max" ;
			var po = this.getPosition() , rst = { l:po[0] , t:po[1] , w : cW , h : cH };
			//save original window size and set the restore button
			this.btnMax.data("size" , rst).removeClass("max").text(this.options.restoreText).addClass("restore") ;
			var self = this ;
			win.bind("resize.boxy" , function() {
				self.maximum();
			});
			//bring window to (0,0,top-Z-index) ;
			this.boxy.css({ left: 0 , top: 0 , zIndex: ++Boxy.zIndex });
		}
		else{
			//bring window to (0,0,top-Z-index) ;
			this.boxy.css({ left: 0 , top: 0 });
		}


		//resize window entity
		content.css({
			width: win.width() - (boxy.outerWidth() - cW) ,
			height: win.height() - (boxy.outerHeight() - cH)
		});
	} ,

	minimum : function(srcElem){
		if (!this.visible) return this;
		this.boxy.stop(true , true) ;
		this.winState = "min" ;

		this.hide(this.options.onMin , true , true) ;
		return this;
	} ,

	restoreSize : function(){
		this.winState = "normal" ;
		$(window).unbind("resize.boxy");
		var old = this.btnMax.removeClass("restore").text(this.options.maxText).addClass("max").data("size");
		this.resize(old.w , old.h).moveTo(old.l, old.t);
	} ,

	// Returns true if this dialog is visible, false otherwise
	isVisible: function() {
		return this.visible;
	},

	// Make this boxy instance visible
	show: function() {
		if (this.visible) {
			this.toTop();
			return this;
		}
		if (this.options.modal) {
			var opacity = (typeof(this.options.modal) === 'number') ? this.options.modal : Boxy.MODAL_OPACITY ;
			Boxy._setupModalResizing();
			this.modalBlackout = jQuery('<div class="boxy-modal-blackout"></div>')
				.css(jQuery.extend(Boxy._cssForOverlay(), {
				"zIndex": Boxy._nextZ(), "opacity": opacity
			})).appendTo(document.body);
			this.toTop();
			/*
			var self = this ;
			if (this.options.closeable) {
			 jQuery(window).bind('keypress.boxy', function(evt) {
			 var key = evt.which || evt.keyCode;
			 if (key == 27) {
			 self.hide();
			 jQuery(document.body).unbind('keypress.boxy');
			 }
			 });
			 }
			 */
		}
		this.getInner().stop().css({width: '', height: ''});
		//--> this.boxy.stop(true,true).css({opacity: 1 , display:"block"}) ;
		if(fy.browser.msie && fy.browser.version < 10){
			//this.boxy.css({top : _t , display:"block"}) ;
			this.boxy.stop(true,true).css({opacity: 1, display:"block"}) ;
		}
		else{
			this.boxy.stop(true,true).css({opacity: 0 , display:"block" });
			var _t = this.boxy.position().top ;
			this.boxy.css({top : _t-20}).animate({opacity: 1 , top: _t} , 200) ;
		}


		this.visible = true;

		var btn = this.boxy.find('.fyBtnImportant') ;
		if(btn.length) btn.eq(0).focus() ;
		/*else{
			this.boxy.find('.close:first').focus();
		}*/
		this._fire('afterShow');
		return this;
	},

	// Hide this boxy instance
	hide: function(after , always , min) {

		if (!this.visible) return this;

		var self = this;

		self._fire('beforeHide');

		if (this.options.modal) {
			jQuery(document.body).unbind('keypress.boxy');
			this.modalBlackout.animate({opacity: 0} , 200, function() {
				jQuery(this).remove();
			});
		}

		var target = { boxy: {}, inner: {} },
			tween = 0;

		if(fy.browser.msie && fy.browser.version < 9){
			var pos = this.getPosition();
			self.boxy.css({display: 'none' , left: pos[0] , top:pos[1]});
			self.visible = false;
			self._fire('afterHide');
			if (after) after(self);
			if (!always && self.options.unloadOnHide) self.unload();
		}
		else{
			if (this.options.hideShrink) {
				var inner = this.getInner(),
					hs = this.options.hideShrink,
					pos = this.getPosition();

				tween |= 1;

				if (hs === true || hs == 'vertical') {
					//target.inner.height = 0;
					//target.boxy.top = pos[1] + inner.height()>>1 ;
					if(min) {
						var tar = this.options.minimizable ;
						if(tar.offset){
							var p = tar.offset() ;
							target.boxy.top = p.top ;
							target.boxy.left = p.left + 64 ;
						}
						else{
							var $doc = $(document);
							target.boxy.top = $doc.height()-10 ;
							target.boxy.left = ($doc.width() + inner.width()>>1 ) >> 1 ;
						}
						target.inner.height = 0;
						target.inner.width = 0;
						inner.height(100);
					}
					else target.boxy.top = pos[1]-40 ;
				}

				if (hs === true || hs == 'horizontal') {
					target.inner.width = 0;
					target.boxy.left = pos[0] + inner.width()>>1 ;
				}
			}

			if (this.options.hideFade) {
				tween |= 2;
				target.boxy.opacity = 0;
			}

			var hideComplete = function() {
				self.boxy.css({display: 'none' , left: pos[0] , top:pos[1]});
				self.visible = false;
				self._fire('afterHide');
				if (after) after(self);
				if (!always && self.options.unloadOnHide) self.unload();
			};

			if (tween) {
				if ((tween&1)) inner.stop().animate(target.inner, min?300:200);
				this.boxy.stop(true, true).animate(target.boxy, min?300:200, hideComplete);
			} else {
				hideComplete();
			}
		}



		return this;

	},

	toggle: function() {
		this[this.visible ? 'hide' : 'show']();
		return this;
	},

	hideAndUnload: function(after) {
		this.options.unloadOnHide = true;
		this.hide(after);
		return this;
	},

	unload: function() {
		this._fire('beforeUnload');
		this.boxy.remove();
		if (this.options.actuator) {
			jQuery.data(this.options.actuator, 'active.boxy', false);
		}
		//this.winState = "destroyed" ;

		if (this.options.maximizable) {
			if(this.winState) {
				$(window).unbind("resize.boxy");
				jQuery.data(this.btnMax, 'size', false);
				this.btnMax = null;
			}
		}
	},

	// Move this dialog box above all other boxy instances
	toTop: function() {
		this.boxy.css({zIndex: Boxy._nextZ()});
		return this;
	},

	// Returns the title of this dialog
	getTitle: function() {
		return jQuery('> .title-bar h2', this.getInner()).html();
	},

	// Sets the title of this dialog
	setTitle: function(t) {
		jQuery('> .title-bar h2', this.getInner()).html(t);
		return this;
	},

	//
	// Don't touch these privates

	_getBoundsForResize: function(width, height) {
		var csize = this.getContentSize();
		var delta = [width - csize[0], height - csize[1]];
		var p = this.getPosition();
		return [Math.max(p[0] - delta[0] / 2, 0),
			Math.max(p[1] - delta[1] / 2, 0), width, height];
	},

	_setupTitleBar: function() {
		if (this.options.title) {
			var self = this;
			var tb = jQuery("<div class='title-bar'></div>").html("<h2>" + this.options.title + "</h2>");
			tb[0].onselectstart = Boxy.PREVENT_FN;

			var btnSets = jQuery('<div class="btnSets"></div>').appendTo(tb) ;
			if (this.options.minimizable) {
				btnSets.append(jQuery("<a href='javascript:void(0)' class='min'></a>").html(this.options.minText));
			}
			if (this.options.maximizable) {
				this.btnMax = jQuery("<a href='javascript:void(0)' class='max'></a>").html(this.options.maxText);
				btnSets.append(this.btnMax);
			}
			if (this.options.closeable) {
				btnSets.append(jQuery("<a href='javascript:void(0)' class='close'></a>").html(this.options.closeText));
			}

			if (this.options.draggable) {
				if (!Boxy.dragConfigured) {
					Boxy.dragConfigured = jQuery('<div id="boxy-helper" style=""></div>').appendTo("body") ;
					if(!document.addEventListener) {
						Boxy.dragConfigured.css({
							border: "2px dotted #000" ,
							backgroundColor: "#fff" ,
							opacity : 0.2
						});
					}
				}
				tb.mousedown(function (evt) {
					//log(evt.button , evt.target.tagName);
					self.toTop();
					if(evt.target.tagName==='A') return ;
					if (evt.button < 2 && self.winState !== "max") {
						tb.bind("mousemove.boxy", function (evt) {
							tb.unbind("mousemove.boxy");
							//self.boxy.css({opacity:0.7});
							var boxy = self.boxy[0];
							Boxy.dragConfigured.css({
								display:"block",
								top:boxy.offsetTop,
								left:boxy.offsetLeft,
								width:self.boxy.outerWidth(),
								height:self.boxy.outerHeight()
							});

							document.onselectstart = Boxy.PREVENT_FN;
							var size = self.getSize();
							Boxy.dragging = [
								boxy,
								evt.pageX - boxy.offsetLeft,
								evt.pageY - boxy.offsetTop ,
								document.body.scrollWidth - size[0] ,
								document.body.scrollHeight -size[1] ,
								(document.addEventListener?true:false)
							];


							jQuery(document).bind("mousemove.boxy", Boxy._handleDrag);
							if(!document.addEventListener) {
								Boxy.dragConfigured[0].setCapture();
								/*self.boxy.css({
									opacity:0.3
								}) ;*/
								self.boxy.hide(0);
							}

							jQuery(document).bind("mouseup.boxy", function () {
								if (self.winState !== "max" && Boxy.dragging) {
									Boxy.dragConfigured.hide();
									jQuery(document).unbind(".boxy");

									if(!document.removeEventListener) {
										Boxy.dragConfigured[0].releaseCapture();
										//log(Boxy.dragConfigured[0].style.left , Boxy.dragConfigured[0].style.top) ;
										self.boxy.show(0).css({
											top: Boxy.dragConfigured[0].style.top,
											left: Boxy.dragConfigured[0].style.left
										}) ;
									}
									Boxy.dragging = document.onselectstart = null;
									self._fire('afterDrop');
								}
							});
						});
						tb.bind("mouseup.boxy" , function(){
							tb.unbind(".boxy");
						});
					}
				});


			}
			this.getInner().prepend(tb);
			this._setupDefaultBehaviours(tb);
		}
	},

	_setupDefaultBehaviours: function(root) {
		var self = this;
		if (this.options.clickToFront) {
			root.click(function() { self.toTop(); });
		}
		jQuery('.close', root).click(function() {
			self.hide();
			return false;
		});
		if(this.btnMax){
			jQuery('.max', root).click(function(evt) {
				if(self.winState === "max" || self.winState === "min") self.restoreSize(evt.currentTarget) ;
				else self.maximum(true) ;
				return false;
			}) ;
			root.dblclick(function(evt){
				evt.stopPropagation();
				self.btnMax.trigger("click");
			}) ;
		}
		jQuery('.min', root).click(function(evt) {
			self.minimum(evt.currentTarget) ;
			return false;
		});
	},

	_fire: function(event) {
		this.options[event].call(this);
	}

};

