import {AjaxDisplayObject} from 'base';

class Tree extends AjaxDisplayObject {
	constructor(jq, cfg) {

		super(jq, cfg);
	}

	init(jq , cfg){

	}

	create(jq, cfg) {

	}

	getSelectedData() {
		if (this._selectedData) return this._selectedData;
		else return null;
	}

	appendNode(parent , dataList){

	}
}



export {Tree}