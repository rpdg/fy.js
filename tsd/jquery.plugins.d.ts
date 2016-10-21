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
	fieldsToJson(rules?:any): any;
	jsonToFields(obj: any): any;
	iptError(sets: string|Function): any;
	resizableColumns(sets: any): any;
	syncCheckBoxGroup(select: any, context: any): any
	pagination(count: number, sets: any): any
}

interface Window {
	ops: any
}
