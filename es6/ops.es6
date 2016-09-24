import {PopUp} from 'ui/popup';
import {Table} from 'ui/table';
import {ListBox, CheckBox, RadioBox} from 'ui/form';

import {$} from '/es6/util/jquery.plugins';

import {uuid, guid} from 'util/uuid';
import {api} from  'util/service';
import {request, string, dateTime, is, url, convert, format} from  'util/utils';


class UI {
	constructor(se, ctx) {
		this.jq = $(se, ctx);
	}

	table(cfg) {
		return new Table(this.jq, cfg);
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

ops.api = api ;


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
ops.alert = PopUp.alert ;
ops.confirm = PopUp.confirm ;




export {ops , $} ;