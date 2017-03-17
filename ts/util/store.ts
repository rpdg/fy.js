let storage: Storage = window.localStorage;

const deserialize = (value: string|any): any => {
	if (typeof value != 'string') {
		return undefined;
	}
	try {
		return JSON.parse(value);
	}
	catch (e) {
		return value || undefined;
	}
};

const store = {
	use: (storageType: 'localStorage'|'sessionStorage') => {
		storage = window[storageType];
		return store;
	},
	get: (key: string, defaultVal?: any): any => {
		let val = deserialize(storage.getItem(key));
		return (val === undefined ? defaultVal : val);
	},
	set: (key: string, val: any) => {
		if (val === undefined) {
			return store.remove(key);
		}
		storage.setItem(key, JSON.stringify(val));
		return val;
	},
	remove: (key: string) => {
		storage.removeItem(key);
	},
	clear: () => {
		storage.clear();
	},
	each: function (callback: Function) {
		for (let i = 0, l = storage.length; i < l; i++) {
			let key: string = storage.key(i);
			callback(key, store.get(key));
		}
	}
};


class LocalStore {
	private storage: Storage;

	constructor(inSession: boolean = true) {
		this.storage = window[inSession ? 'sessionStorage' : 'localStorage'];
	}

	get(key: string, defaultVal?: any): any {
		let val = deserialize(this.storage.getItem(key));
		return (val === undefined ? defaultVal : val);
	}

	set(key: string, val: any) {
		if (val === undefined) {
			return this.remove(key);
		}
		this.storage.setItem(key, JSON.stringify(val));
		return val;
	}

	remove(key: string) {
		this.storage.removeItem(key);
	}
}

class Cache{
	private static instance :Cache ;
	private cache :any ;

	private constructor(){
		if(!top.window['__Cache'])
			top.window['__Cache'] = {};

		this.cache = top.window['__Cache'] ;
	}

	static getInstance(){
		if(!Cache.instance)
			Cache.instance = new Cache();
		return Cache.instance ;
	}
	static empty(){
		if(top.window['__Cache'])
			top.window['__Cache'] = null;
	}

	get(key: string, defaultVal?: any): any {
		let val = this.cache[key];
		return (val === undefined ? defaultVal : val);
	}

	set(key: string, val: any) {
		if (val === undefined) {
			return this.remove(key);
		}
		this.cache[key] = val;
	}
	remove(key: string) {
		delete this.cache[key];
	}
}

export {store, LocalStore , Cache};