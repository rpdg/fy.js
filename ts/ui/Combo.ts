import {DisplayObject} from './DisplayOject';

let ComboManager = {
	zIndex: 999,
	instances: {},
	remove: function (key) {
		delete this.instances[key];
	},
	closeAll: function () {
		for (let key in this.instances) {
			let target: Combo = this.instances[key] as Combo;
			if (target.status === 'opened') target.close();
		}
	},
};

const $BODY = $('body');

function bodyBinder() {
	$BODY.on('mousedown.dropDownHide', function () {
		ComboManager.closeAll();
	});
}


class Combo extends DisplayObject {

	jqValueField: JQuery; //to put value

	target: JQuery; //drop down

	//EVENTS
	onBeforeOpen?: Function;
	onOpen?: Function;
	onClose?: Function;

	private _state: 'closed' | 'opened';
	//private _wrapper?: JQuery;
	private _evtName: string;


	constructor(jq: JQuery, cfg: any) {
		cfg = $.extend({}, cfg);

		super(jq, cfg);

	}

	init(jq: JQuery, cfg: any) {
		this._evtName = 'mousedown.ComboEvent';

		if (jq[0].tagName === 'INPUT') jq.addClass('combo-input').val(cfg.text);
		else jq.text(cfg.text);

		this.jqValueField = $(cfg.valueField);

		this.target = cfg.target; //drop down

		this.target.addClass('combo-dropDown').on('mousedown', (evt) => {
			evt.stopPropagation();
		});

		//EVENTS
		this.onBeforeOpen = cfg.onBeforeOpen;
		this.onOpen = cfg.onOpen;
		this.onClose = cfg.onClose;

		//ereaser
		if (cfg.allowBlank) {
			Combo.makeClearableInput(this.jq, this.jqValueField);
		}

		ComboManager.instances[this.guid] = this;
		this.enable = true;
	}

	public static makeClearableInput(ipt: JQuery, valueIpt: JQuery): void {
		let isIE = $.detectIE();
		if (isIE && (isIE > 10) && !ipt.prop('readonly')) {
			//do nothing
		}
		else {
			let wrapper = ipt.css({
				float: 'left',
				margin: 0,
			}).wrap('<span class="sp-eraserWrap"></span>').parents('span:first');

			let eraser = $('<div class="ipt-eraser">&times;</div>')
				.appendTo(wrapper)
				.click(function () {
					if (!ipt.prop('disabled')) {
						ipt.val('');
						valueIpt.val('');
						eraser.hide();
					}
				});

			wrapper.mouseenter(function () {
				if (!ipt.prop('disabled') && ipt.val()) {
					eraser.show();
				}
			}).mouseleave(function () {
				eraser.hide();
			});
		}

	}

	set enable(b: boolean) {
		if (b) {
			let that = this,
				$c = this.target;

			this.jq.on(this._evtName, function () {
				//event.stopImmediatePropagation();
				let go = true;
				that.status === 'closed' && that.position();

				if (typeof that.onBeforeOpen === 'function') {
					go = that.onBeforeOpen.apply(that);
					if (go === false) return that;
				}
				$c.stop(true, true).slideToggle(90, function () {
					if ($c.css('display') === 'block') that.status = 'opened';
					else that.status = 'closed';
				});

				return that;
			});
		}
		else {
			this.jq.off(this._evtName).prop('disabled', true);
			this.target.hide();

			return this;
		}
	}

	position() {
		let $t = this.jq,  //input
			$c = this.target, //drop down
			offset = $t.offset();

		let top = offset.top + $t.outerHeight(), ch = $c.outerHeight();

		if (top + ch > $(document).outerHeight() && offset.top > ch) {
			top = offset.top - $c.outerHeight();
		}

		$c.css({
			top: top,
			left: offset.left,
			zIndex: ComboManager['zIndex']++,
		});
	}

	open() {
		if (typeof this.onBeforeOpen === 'function') {
			let go = this.onBeforeOpen();
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


	setValue(txt, val) {
		this.jq.val(txt);
		this.jqValueField.val(val);
	}

	get text(): string {
		return $.trim(this.jq.val());
	}
}


interface ICanPutIntoCombo {
	syncData(current: any)
}


export {Combo, ICanPutIntoCombo};