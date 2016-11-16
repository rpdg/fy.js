interface IDictionary {
	add(key: string, value: any): void;
	remove(key: string): void;
	containsKey(key: string): boolean;
	keys(): string[];
	values(): any[];
}

class Dictionary implements IDictionary{

	protected _keys: string[] = [];
	protected _values: any[] = [];

	constructor(init: { key: string; value: any; }[]) {

		for (let x = 0; x < init.length; x++) {
			this[init[x].key] = init[x].value;
			this._keys.push(init[x].key);
			this._values.push(init[x].value);
		}
	}

	add(key: string, value: any) {
		this[key] = value;
		this._keys.push(key);
		this._values.push(value);
	}

	remove(key: string) {
		let index = this._keys.indexOf(key, 0);
		this._keys.splice(index, 1);
		this._values.splice(index, 1);

		delete this[key];
	}

	keys(): string[] {
		return this._keys;
	}

	values(): any[] {
		return this._values;
	}

	containsKey(key: string) {
		return !(typeof this[key] === "undefined");
	}

}

/*interface IPerson {
	firstName: string;
	lastName: string;
}

interface IPersonDictionary extends IDictionary {
	[index: string]: IPerson;
	values(): IPerson[];
}

class PersonDictionary extends Dictionary {
	constructor(init: { key: string; value: IPerson; }[]) {
		super(init);
	}

	values(): IPerson[]{
		return this._values;
	}

	toLookup(): IPersonDictionary {
		return this;
	}
}
 let persons = new PersonDictionary([
 { key: "p1", value: { firstName: "F1", lastName: "L2" } },
 { key: "p2", value: { firstName: "F2", lastName: "L2" } },
 { key: "p3", value: { firstName: "F3", lastName: "L3" } }
 ]).toLookup();


 alert(persons["p1"].firstName + " " + persons["p1"].lastName);
 // alert: F1 L2

 persons.remove("p2");

 if (!persons.containsKey("p2")) {
 alert("Key no longer exists");
 // alert: Key no longer exists
 }

 alert(persons.keys().join(", "));
*/


interface Map<T> {
	[K: string]: T;
}
/*
let dict: Map<number> = {};
dict["one"] = 1;
*/
