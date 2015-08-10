/**
	updated 2014-05-04 by Lyu
**/

(function (window , $ , undefined) {
	var document = window.document,
		location = window.location;


	var fy = (function (jQuery) {
		var fy = function (cfg) {
			return new fy.fn.init(cfg);
		};

		fy.fn = fy.prototype = {
			init: function (obj) {
				this.jq = (obj instanceof jQuery) ? obj : $(obj); //hold the jQuery object
				if(this.jq.length<1) throw new Error('fy component container is null.');
			}
		};

		//class inherit
		fy.fn.__defined = {};
		var expand = function (Child , Parent) {
			if (Child.parent) {
				if (!(Child.parent instanceof Array)) Child.parent = [Child.parent] ;
				Child.parent.push(Parent) ;
			}
			else Child.parent = Parent ;

			var p = Parent.prototype ,
				c = Child.prototype ,
				key;

			for (key in p)  {
				if (!(key in c)) c[key] = p[key];
			}
		};

		//register a named component into fy
		fy.register = function (name , fn , expands) {
			//log("register" , fn)
			if (name in fy.fn.init.prototype) throw new Error("[" + name + "] registered failed: The same name is used by another component!");

			fn.prototype.define = name;
			fn.prototype.getDefine = function () {
				return fn;
			};

			fn.prototype.extra = function (extras, unsafe) {
				var key;
				for (key in extras) 
					if (this[key] === undefined || unsafe) this[key] = extras[key];
				return this;
			};

			fy.fn.__defined[name] = fn;

			if (expands) {
				for (var i = 2 , l = arguments.length ; i < l ; i++) {
					if (!fy.fn.__defined[arguments[i]]) throw new Error("Super Class [" + arguments[i] + "] Not Found!");
					expand(fn , fy.fn.__defined[arguments[i]]);
				}
			}

			fy.fn.init.prototype[name] = function (sets1 , sets2 , sets3) {
				return new fn(this.jq , sets1 , sets2 , sets3);
			}
		};


		return fy;
	})($);

	// Expose to window
	window.fy = fy;



})(window , jQuery);

