

export default function sortOn(arr, prop, sortCompareFunction) {
	if (sortCompareFunction && typeof sortCompareFunction === 'function')
		return arr.sort(sortCompareFunction);

	else {
		var dup = Array.prototype.slice.call(arr, 0);
		//var dup = arr.slice(0);
		if (!arguments.length) return dup.sort();
		//var args = Array.prototype.slice.call(arguments);
		return dup.sort(
			function (a, b) {
				var A = a[prop], nA = isNaN(A), B = b[prop], nB = isNaN(B);
				//两者皆非number
				if (nA && nB) {
					if (A === '') return -1;
					if (B === '') return 1;
					return (A === B ? 0 : A > B ? 1 : -1);
				}
				//a[prop] 非 number, b[prop] 是 number
				else if (nA) return -1;
				//a[prop] 是 number, b[prop] 非 number
				else if (nB) return 1;
				//a[prop], b[prop]  均是 number
				return A === B ? 0 : A > B ? 1 : -1;
			}
		);
	}
};


