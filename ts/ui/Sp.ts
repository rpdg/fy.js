import {DisplayObject, AjaxDisplayObject} from "./DisplayOject";

const defaults: Object = {
	text: "default string"
};

class Sp extends AjaxDisplayObject {

	constructor(jq: JQuery, cfg: any) {

		cfg = $.extend({}, defaults, cfg);

		super(jq, cfg);
	}


	bindData(data: any) {

		this.jq.text(data.text);

		this.data = data;

	}
}

export default Sp;