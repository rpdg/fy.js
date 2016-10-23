import {DisplayObject} from './DisplayOject';

var ComboManager = {
	zIndex: 999,
	instances: {},
	remove: function (key) {
		delete this.instances[key];
	},
	closeAll: function () {
		for (let key in this.instances) {
			var target: Combo = this.instances[key] as Combo;
			if (target.status === 'opened') target.close();
		}
	}
};

const $BODY = $("body");

function bodyBinder() {
	$BODY.on("mousedown.dropDownHideAll", function () {
		ComboManager.closeAll();
	});
}


class Combo extends DisplayObject {

	target: JQuery; //drop down

	//EVENTS
	onBeforeOpen?: Function;
	onOpen?: Function;
	onClose?: Function;

	private _state: 'closed'|'opened';
	private _wrapper?: JQuery;
	private _evtName: string = 'mousedown.ComboEvent';


	constructor(jq: JQuery, cfg: any) {

		super(jq, cfg);

	}

	init(jq: JQuery, cfg: any) {

		if (jq[0].tagName === 'INPUT') jq.addClass('combo-input').val(cfg.text);
		else jq.text(cfg.text);

		this.target = cfg.target; //drop down

		this.target.css({
			display: 'none',
			position: 'absolute'
		}).on('mousedown', (evt) => {
			evt.stopPropagation();
		});

		//EVENTS
		this.onBeforeOpen = cfg.onBeforeOpen;
		this.onOpen = cfg.onOpen;
		this.onClose = cfg.onClose;

		//ereaser
		if (cfg.allowBlank) {
			this._wrapper = this.jq.css({
				float: 'left',
				margin: 0
			}).wrap('<span style="display: inline-block;vertical-align: middle;"></span>').parents('span:first');

			let that = this;
			let eraser = $('<div style="font: 12px Arial;color:#d00;float:left;margin:5px 0 0 -26px ;width:8px;line-height:12px;cursor:pointer;display:none;">x</div>')
				.appendTo(this._wrapper)
				.click(function () {
					if (!that.jq.prop('disabled'))
						that.jq.val('');
				});

			this._wrapper.hover(function () {
				eraser.toggle();
			});
		}

		ComboManager.instances[this.guid] = this;
		this.enable = true;
	}

	set enable(b: boolean) {
		if (b) {
			var that = this,
				$c = this.target;

			this.jq.on(this._evtName, function () {
				//event.stopImmediatePropagation();
				var go = true;
				that.status === "closed" && that.position();

				if (typeof that.onBeforeOpen === 'function') {
					go = that.onBeforeOpen.apply(that);
					if (go === false) return that;
				}
				$c.stop(true, true).slideToggle(90, function () {
					if ($c.css("display") === 'block') that.status = 'opened';
					else that.status = 'closed';
				});

				return that;
			});
		}
		else {
			this.jq.off(this._evtName).prop("disabled", true);
			this.target.hide();

			return this;
		}
	}

	position() {
		var $t = this.jq,  //input
			$c = this.target, //drop down
			offset = $t.offset();

		var top = offset.top + $t.outerHeight(), ch = $c.outerHeight();

		if (top + ch > $(document).outerHeight() && offset.top > ch) {
			top = offset.top - $c.outerHeight();
		}

		$c.css({
			top: top,
			left: offset.left,
			zIndex: ComboManager['zIndex']++
		});
	}

	open() {
		if (typeof this.onBeforeOpen === 'function') {
			var go = this.onBeforeOpen();
			if (go === false) return this;
		}
		this.position();
		this.target.stop(true, true).slideDown(90);
		this.status = 'opened';
	}

	close() {
		this.target.stop(true, true).slideUp(90);
		this.status = 'closed';
	}


	set status(s: string) {
		if (s === 'opened') {
			this._state = 'opened';
			bodyBinder();

			this.target.on('mouseleave.dropDownHide', bodyBinder)
				.on('mouseenter.dropDownHide', function () {
					$BODY.off('.dropDownHide');
				});

			if (typeof this.onOpen === 'function') this.onOpen.apply(this, arguments);
		}
		else {
			this._state = 'closed';
			$BODY.off('.dropDownHide');
			this.target.off('.dropDownHide');

			if (typeof this.onClose === 'function') this.onClose.apply(this, arguments);
		}
	}

	get status(): string {
		return this._state;
	}


	get text(): string {
		return $.trim(this.jq.val());
	}
}


interface ICanPutIntoCombo {
	syncData()
}


export {Combo, ICanPutIntoCombo};