/*
 * directly map to xheditor
 * */

;
(function (window, $, fy, undefined) {

	fy.register("editor", function (jq , cfg) {
		return jq.xheditor($.extend({skin:'nostyle'}, cfg));
	});

})(window, jQuery, fy);

