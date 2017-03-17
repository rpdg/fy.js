import {ListBox, CheckBox, RadioBox} from "./ui/FormControls";
import {api} from  'util/api';
import Table from "./ui/Table";
import PopUp from "./ui/Popup";
import Panel from "./ui/Panel";
import Tree from "./ui/Tree";
import {TabBar, TabNavigator, TabView} from "./ui/TabView";

import {request, string, dateTime, is, url, convert, format, array} from  'util/utils';


//a ui factory class
class OpgUi {

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

	tabView(cfg): TabView {
		return new TabView(this.jq, cfg);
	}

}


let opg : any = (se: JQuery|any[]|Element|DocumentFragment|Text|string) => new OpgUi(se);


opg.api = api;

opg.request = request;
opg.dateTime = dateTime;
opg.string = string;
opg.is = is;
opg.url = url;
opg.convert = convert;
opg.format = format;
opg.array = array;


//
opg.popTop = PopUp.popTop;
opg.alert = PopUp.alert;
opg.confirm = PopUp.confirm;

opg.ok = function (message, callBack?: Function, options ?: any = {}) {
	PopUp.alert('<i class="ico-ok"></i><span>' + message + '</span>', callBack, options);
};
opg.err = function (message, callBack?: Function, options ?: any = {}): void {
	PopUp.alert('<i class="ico-error"></i><span>' + message + '</span>', callBack, options);
};
opg.warn = function (message, callBack?: Function, options ?: any = {}) {
	PopUp.alert('<i class="ico-warn"></i><span>' + message + '</span>', callBack, options);
};
opg.danger = function (message, callBack?: Function, options ?: any = {}) {
	PopUp.confirm('<i class="ico-warn"></i><span>' + message + '</span>', callBack, options);
};


//Pub/Sub
//https://github.com/cowboy/jquery-tiny-pubsub
let ps_obj = $({});

opg.listen = function (events: string, handler: (eventObject: JQueryEventObject, ...args: any[]) => any) {
	ps_obj.on.apply(ps_obj, arguments);
};
opg.dispatch = function (eventType: string, extraParameters?: any[]|Object) {
	ps_obj.trigger.apply(ps_obj, arguments);
};
opg.unListen = function () {
	ps_obj.off.apply(ps_obj, arguments);
};


//
opg.wrapPanel = Panel.wrapPanel;


window['opg'] = opg;

export default opg ;
