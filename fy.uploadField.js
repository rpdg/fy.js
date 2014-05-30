
;
(function (window, $, fy, undefined) {

	var UploadField = function (jq, cfg) {
		//initialize defaults
		var def = {};
		var sets = $.extend({} , cfg) ;

		//call super constructor
		UploadField.parent.call(this, jq, sets);

		//self attributes

		this.create(sets);
	};

	UploadField.prototype = {
		htmlMashup : function(){
			var $tc = $('<input class="fileField_text" type="text"/>') ;
			var $wrap = $('<div class="fyFileFieldWrap"></div>') ;
			this.jq.wrap($wrap).after($tc).change(function(){
				$tc.val(this.value) ;
			});
		} ,
		clear : function(){

		}
	};

	fy.register("uploadField", UploadField, "DisplayObject");
})(window, jQuery, fy);