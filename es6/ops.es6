import {PopUp} from 'ui/popup';
import {Table} from 'ui/table';
import {Tree} from 'ui/tree';
import {Panel} from 'ui/panel';
import {Tab} from 'ui/tab';
import {ListBox, CheckBox, RadioBox} from 'ui/form';

import {$} from '/es6/util/jquery.plugins';

import {uuid, guid} from 'util/uuid';
import {api} from  'util/service';
import {request, string, dateTime, is, url, convert, format} from  'util/utils';


class UI {
	constructor(se, ctx) {
		this.jq = $(se, ctx);
		if (this.jq.length === 0) {
			throw new Error('no dom object to process');
		}
	}


	table(cfg) {
		return new Table(this.jq, cfg);
	}

	panel(cfg) {
		return new Panel(this.jq, cfg);
	}

	tab(cfg) {
		return new Tab(this.jq, cfg);
	}

	tree(cfg) {
		return new Tree(this.jq, cfg);
	}

	popup(cfg) {
		return new PopUp(this.jq, cfg);
	}

	listBox(cfg) {
		return new ListBox(this.jq, cfg);
	}

	checkBox(cfg) {
		return new CheckBox(this.jq, cfg);
	}

	radioBox(cfg) {
		return new RadioBox(this.jq, cfg);
	}
}


const ops = (se, ctx) => new UI(se, ctx);

ops.api = api;


ops.uuid = uuid;
ops.guid = guid;
ops.request = request;
ops.dateTime = dateTime;
ops.string = string;
ops.is = is;
ops.url = url;
ops.convert = convert;
ops.format = format;

//
ops.popTop = PopUp.popTop;
ops.alert = PopUp.alert;
ops.confirm = PopUp.confirm;

ops.ok = function (message, callBack, options = {}) {
	PopUp.alert('<i class="ico-ok"></i><span>' + message + '</span>' , callBack , options);
};
ops.err = function (message, callBack, options = {}) {
	PopUp.alert('<i class="ico-error"></i><span>' + message + '</span>' , callBack , options);
};
ops.warn = function (message, callBack, options = {}) {
	PopUp.alert('<i class="ico-warn"></i><span>' + message + '</span>' , callBack , options);
};
ops.danger = function (message, callBack, options = {}) {
	PopUp.confirm('<i class="ico-warn"></i><span>' + message + '</span>' , callBack , options);
};
//
ops.wrapPanel = Panel.wrapPanel;


window.$ = window.jQuery = $;
window.ops = ops;


export {ops, $} ;