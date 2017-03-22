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

	constructor(se: JQuery | any[] | Element | DocumentFragment | Text | string) {
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


let opg: any = (se: JQuery | any[] | Element | DocumentFragment | Text | string) => new OpgUi(se);


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
opg.dispatch = function (eventType: string, extraParameters?: any[] | Object) {
	ps_obj.trigger.apply(ps_obj, arguments);
};
opg.unListen = function () {
	ps_obj.off.apply(ps_obj, arguments);
};


/*
 //https://github.com/daniellmb/MinPubSub/
 // the topic/subscription hash
 let cache = {};
 opg.dispatch = function (topic: string, args ?: Array) {
 // summary:
 //    Publish some data on a named topic.
 // topic: String
 //    The channel to publish on
 // args: Array?
 //    The data to publish. Each array item is converted into an ordered
 //    arguments on the subscribed functions.
 //
 // example:
 //    Publish stuff on '/some/topic'. Anything subscribed will be called
 //    with a function signature like: function(a,b,c){ ... }
 //
 //    publish('/some/topic', ['a','b','c']);

 let subs = cache[topic],
 len = subs ? subs.length : 0;

 //can change loop or reverse array if the order matters
 while (len--) {
 subs[len].apply(null, args || []);
 }
 };

 opg.listen = function (topic: string, callback: Function) {
 // summary:
 //    Register a callback on a named topic.
 // topic: String
 //    The channel to subscribe to
 // callback: Function
 //    The handler event. Anytime something is publish'ed on a
 //    subscribed channel, the callback will be called with the
 //    published array as ordered arguments.
 //
 // returns: Array
 //    A handle which can be used to unsubscribe this particular subscription.
 //
 // example:
 //    subscribe('/some/topic', function(a, b, c){ handle data  });

 if (!cache[topic]) {
 cache[topic] = [];
 }
 cache[topic].push(callback);
 return [topic, callback]; // Array
 };

 opg.unListen = function ( handle,  callback) {
 // summary:
 //    Disconnect a subscribed function for a topic.
 // handle: Array
 //    The return value from a subscribe call.
 // example:
 //    var handle = subscribe('/some/topic', function(){});
 //    unsubscribe(handle);

 let subs = cache[callback ? handle : handle[0]],
 callback = callback || handle[1],
 len = subs ? subs.length : 0;

 while (len--) {
 if (subs[len] === callback) {
 subs.splice(len, 1);
 }
 }
 };
 */


//
opg.wrapPanel = Panel.wrapPanel;


window['opg'] = opg;

export default opg ;
