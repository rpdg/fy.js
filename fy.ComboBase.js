;
(function (window, $, fy, undefined) {
	var $BODY = $("body") ,

		ComboManager = {
			zIndex: 29999,
			instances:{},
			remove:function (key) {
				delete this.instances[key];
			},
			closeAll:function () {
				for (var key in this.instances) {
					var target = this.instances[key];
					if (target.status === 'open') target.close();
				}
			}
		};

	//todo: optimize
	$BODY.bind("scroll.dropDownHideAll", function() {
		ComboManager.closeAll();
	});

	var ComboBase = function (jq, sets) {
		//init
		var cfg = $.extend({eventType:"mousedown" , allowBlank : false }, sets)  ,  that = this;

		//call super constructor
		ComboBase.parent.call(this, jq, cfg);

		//PROPERTY
		//public
		this.text = cfg.text||'';
		this.target = $(cfg.target);
		if(sets.width) this.target.width(sets.width) ;
		if(sets.height) this.target.css('maxHeight' , sets.height) ;

		this.status = 'close';
		this.event = cfg.eventType + ".fyDropdown";

		this.bodyBinder = function () {
			$BODY.bind("mousedown.dropDownHideAll", function () {
				ComboManager.closeAll();
			});
		};

		//EVENTS
		this.onBeforeOpen = cfg.onBeforeOpen;
		this.onOpen = cfg.onOpen;
		this.onClose = cfg.onClose;

		//ereaser
		if(cfg.allowBlank){
			this.wrapper = this.jq
				.css({
					float : 'left' ,
					margin : 0
				})
				.wrap('<span style="display: inline-block;vertical-align: middle;"></span>')
				.parents('span:first') ;

			var eraser = $('<div style="font:Arial 12px;color:#d00;float:left;margin:5px 0 0 -26px ;width:8px;line-height:12px;cursor:pointer;display:none;">x</div>')
				.appendTo(this.wrapper)
				.click(function(){
					if(!that.jq.prop('disabled')) that.jq.val('') ;
				});

			this.wrapper.hover(function(){
				eraser.toggle() ;
			}) ;
		}


		//create
		if(!this.lazy) this.create();
	};
	ComboBase.prototype = {
		position:function () {
			var $t = this.jq ,  //input
				$c = this.target , //drop down
				offset = $t.offset();

			var top = offset.top + $t.outerHeight(), ch = $c.outerHeight();

			if (top + ch > $(document).outerHeight()  &&  offset.top > ch) {
				top = offset.top - $c.outerHeight();
			}

			$c.css({
				top:top,
				left:offset.left,
				zIndex:ComboManager['zIndex']++
			});
		},
		create:function (json) {
			if (typeof this.onInit === 'function') this.onInit();
			//
			if (this.jq[0].tagName === 'INPUT') this.jq.addClass('combo-input').val(this.text);
			else this.jq.text(this.text);

			this.target.css({
				display:'none',
				position:'absolute'
			}).mousedown(function (evt) {
				evt.stopPropagation();
			});
			this.enable();

			this.instanceId = fy.uuid();

			ComboManager.instances[this.instanceId] = this;

			this.createHandler(json);

			return this;
		},
		enable:function () {
			var that = this ,
				$t = this.jq ,
				$c = this.target;

			$t.bind(this.event, function (event) {
				//event.stopImmediatePropagation();
				var go = true;
				that.status === "close"  && that.position();

				if (typeof that.onBeforeOpen === 'function') {
					go = that.onBeforeOpen.apply(that);
					if (go === false) return that;
				}
				$c.stop(true, true).slideToggle(90, function () {
					if ($c.css("display") === 'block') that.openHandler();
					else that.closeHandler();
				});

				return that;
			});
			return this;
		},
		disable:function () {
			this.jq.prop("disabled", true);
			this.target.hide();
			this.jq.unbind(this.event);
			return this;
		},
		open:function () {
			if (typeof this.onBeforeOpen === 'function') {
				var go = this.onBeforeOpen();
				if (go === false) return this;
			}
			this.position() ;
			this.target.stop(true, true).slideDown(90);
			this.openHandler();
			return this;
		},
		openHandler:function () {
			this.status = 'open';
			this.bodyBinder();

			this.target.bind('mouseleave.dropDownHide', this.bodyBinder)
				.bind('mouseenter.dropDownHide', function () {
					$BODY.unbind('click.dropDownHide');
				});

			if (typeof this.onOpen === 'function') this.onOpen.apply(this, arguments);
		},

		close:function () {
			this.target.stop(true, true).slideUp(90);
			this.closeHandler();
			return this;
		},

		closeHandler:function () {
			this.status = 'close';
			$BODY.unbind('.dropDownHide');
			this.target.unbind('.dropDownHide');

			if (typeof this.onClose === 'function') this.onClose.apply(this, arguments);
		} ,
		getText : function(){
			return $.trim(this.jq.val());
		}
	};

	fy.register("ComboBase", ComboBase, "DisplayObject");

})(window, jQuery, fy);