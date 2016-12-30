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
	datetimepicker(rules?: any) :JQuery;
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


	request: Map<string , string>;

	dateTime: {
		addSeconds(d:Date, s:number):Date,
		addDays(d:Date, s:number):Date,
		daySpan(dateFrom:Date , dateTo:Date):Date,
		weekSpan(dateFrom:Date , dateTo:Date):Date,
	};

	string: {
		pad(input:string, result_full_length:number, pad_string:string, pad_type:'STR_PAD_LEFT'|'STR_PAD_BOTH'|'STR_PAD_RIGHT'):string ,
		padLeft(oStr:string, result_full_length:number, pad_string:string='0'):string,
		padRight(oStr:string, result_full_length:number, pad_string:string='0'):string,
	};

	is: {
		Array(obj:Object):boolean ,
		RegExp(obj:Object):boolean ,
		Date(obj:Object):boolean ,
		Number(obj:Object):boolean ,
		String(obj:Object):boolean ,
		Object(obj:Object):boolean ,
		HTMLDocument(obj:Object):boolean ,
	};

	url: any;

	convert: {
		arrayToHash(arr:Array, keyName:string):Object ,
		hashToArray(obj:Object, converter?:Function):Array ,
		hashKeysToArray(obj:Object): Array
	};
	format: {
		date(date:Date, format:string):string ,
		fileSize(size:number):string ,
		number (number, decimals, dec_point?, thousands_sep?):string ,
		json(template: string, json: any): string,
	};

	array: {
		sort(arr: Array, sortPropName: string, sortCompareFunction?: Function):Array ,
		combine (...arrays: Array[]) :Array ,
		unique (arr: Array) :Array ,
	};


	wrapPanel(selector, cfg);

	alert(message, callback, options);
	confirm(message, callback, options);
	popTop(iframe:JQuery|HTMLIFrameElement|string , options);

	ok (message, callBack?: Function, options ?: any): void ;
	err (message, callBack?: Function, options ?: any): void ;
	warn (message, callBack?: Function, options ?: any): void ;
	danger (message, callBack?: Function, options ?: any): void ;

	listen (events: string, handler: (eventObject: JQueryEventObject, ...args: any[]) => any):void;
	unListen ():void;
	dispatch (eventType: string, extraParameters?: any[]|Object):void;
}

interface Window {
	CONFIG: any;
	ops: OpsStatic ;
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
declare let ops: OpsStatic;
