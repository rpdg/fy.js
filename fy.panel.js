;
(function (window, $, fy, undefined) {

	var Panel = function (jq, sets) {
		//init
		var cfg = $.extend({} , sets) ;

		//call super constructor
		Panel.parent.call(this , jq , cfg) ;

		//PROPERTY
		//public
		this.title = cfg.title ;


		//EVENTS


		//create
		this.create();
	};
	Panel.prototype = {
		create:function () {
			if (typeof this.onInit === 'function') this.onInit();
			//

			this.createHandler();
			return this;
		}
	};

	fy.register("panel", Panel , "DisplayObject");

})(window, jQuery, fy);