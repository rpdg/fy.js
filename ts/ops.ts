import {ListBox, CheckBox, RadioBox} from "./ui/FormControls";
import {api} from  'util/api';
import Table from "./ui/Table";
import PopUp from "./ui/Popup";
import Panel from "./ui/Panel";
import Tree from "./ui/Tree";

import {request, string, dateTime, is, url, convert, format, array} from  'util/utils';


//a ui factory class
class OpsUi {

	jq: JQuery;

	constructor(se: JQuery|any[]|Element|DocumentFragment|Text|string) {
		this.jq = $(se);
		if (this.jq.length === 0) {
			throw new Error('There is no dom object to be processed.');
		}
	}


	table(cfg: any): Table {
		return new Table(this.jq, cfg);
	}

	tree(cfg) {
		return new Tree(this.jq, cfg);
	}

	listBox(cfg: any): ListBox {
		return new ListBox(this.jq, cfg);
	}

	checkBox(cfg: any): CheckBox {
		return new CheckBox(this.jq, cfg);
	}

	radioBox(cfg: any): RadioBox {
		return new RadioBox(this.jq, cfg);
	}

	popup(cfg): PopUp {
		return new PopUp(this.jq, cfg);
	}

	panel(cfg): Panel {
		return new Panel(this.jq, cfg);
	}

}


let ops: any = (se: JQuery|any[]|Element|DocumentFragment|Text|string) => new OpsUi(se);


ops.api = api;

ops.request = request;
ops.dateTime = dateTime;
ops.string = string;
ops.is = is;
ops.url = url;
ops.convert = convert;
ops.format = format;
ops.array = array;


//
ops.popTop = PopUp.popTop;
ops.alert = PopUp.alert;
ops.confirm = PopUp.confirm;

ops.ok = function (message, callBack?: Function, options ?: any = {}) {
	PopUp.alert('<i class="ico-ok"></i><span>' + message + '</span>', callBack, options);
};
ops.err = function (message, callBack?: Function, options ?: any = {}): void {
	PopUp.alert('<i class="ico-error"></i><span>' + message + '</span>', callBack, options);
};
ops.warn = function (message, callBack?: Function, options ?: any = {}) {
	PopUp.alert('<i class="ico-warn"></i><span>' + message + '</span>', callBack, options);
};
ops.danger = function (message, callBack?: Function, options ?: any = {}) {
	PopUp.confirm('<i class="ico-warn"></i><span>' + message + '</span>', callBack, options);
};


//
ops.wrapPanel = Panel.wrapPanel;


window['ops'] = ops;

export default ops ;
