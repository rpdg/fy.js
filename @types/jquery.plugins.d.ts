interface BindOption {
	list ?: Array;
	template ?: string;
	storeData ?: boolean;
	itemRender ?: any;
	itemFilter ?: Function;
	onBound ?: Function;
}

interface Pagination {
	pageNo: number;
	pageSize: number;
	current_page: number;
	items_per_page: number;
	customizable: boolean|Array;
	showCount: boolean|string;
}

interface JQuery {
	bindList(target: any): JQuery;
	fieldsToJson(rules?: any): any;
	jsonToFields(obj: any): any;
	iptError(sets: string|Function): any;
	resizableColumns(sets: any): any;
	syncCheckBoxGroup(select: any, context: any): any
	checkBoxAll(select: any, context: any): any
	pagination(count: number, sets: any): any
}

interface JQueryStatic {
	detectIE(): number
	escapeSelector(selector: string|number): string
}


interface IOpsUi {
	jq: JQuery;
}

interface OpsStatic {
	(se: JQuery|any[]|Element|DocumentFragment|Text|string): IOpsUi;


	request: Map;
	dateTime: any;
	string: any;
	is: any;
	url: any;
	convert: any;
	format: any;
	array: any;
	wrapPanel: Function;

	alert: Function;
	confirm: Function;
	popTop: Function;

	ok (message, callBack?: Function, options ?: any): void ;
	err (message, callBack?: Function, options ?: any): void ;
	warn (message, callBack?: Function, options ?: any): void ;
	danger (message, callBack?: Function, options ?: any): void ;
}

interface Window {
	CONFIG: any;
	ops: any;
	__uri(path: string): string
}


interface Node {
	requestFullscreen(): void;
	cancelFullScreen(): void;

	msFullscreenElement(): void;
	msRequestFullscreen(): void;

	mozRequestFullScreen(): void;
	webkitRequestFullscreen(): void;
}

interface Document {
	fullScreenElement: Element;
	cancelFullScreen(): void;

	msFullscreenElement: Element;
	msExitFullscreen(): void;

	mozFullScreenElement: Element;
	mozCancelFullScreen(): void;
}

interface HTMLElement {
	msRequestFullscreen(): void;
	mozRequestFullScreen(): void;
}

interface plyrStatic {
	setup(selector: string, options?: any): plyrPlayer[];
	get(selector: string): plyrPlayer[];
}

interface plyrPlayer {

	source(options: any): void;

	on(evtName: string, callback: Function): void;
	off(evtName: string, callback: Function): void;

	play(): void;
	pause(): void;
	stop(): void;
	restart(): void;

	seek(time: number): void;
	forward(time?: number = 10): void;
	rewind(time?: number = 10): void;

	getCurrentTime(): number;
	getDuration(): number;

	isPaused(): boolean
}


interface FisUri {
	(uri: string): string
}

declare let __uri: FisUri;
declare let plyr: plyrStatic;
