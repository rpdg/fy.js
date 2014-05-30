//contextMenu
;
(function (window, $, fy, undefined) {
	var idSeed = 0 ;

	var ContextMenu = function (jq, cfg) {
		var that = this;
		//settings
		var sets = $.extend({}, cfg);

		//call super constructor
		ContextMenu.parent.call(this, jq, sets);

		//self attributes
		this.cmds = {} ;

		var makedId = 'fyMenu'+ (idSeed++) ;
		var menuUl = $('<ul id="'+makedId+'" class="contextMenu"></ul>') ;
		var menu = sets.menu ;
		for (var key in menu){
			menuUl.append('<li><a href="#'+key+'">'+menu[key].txt+'</a></li>') ;
			this.cmds[key] = menu[key].cmd ;
		}
		$("body").append(menuUl) ;

		this.jq = menuUl ;

		sets.menu = makedId ;

		jq.contextMenu(sets , function (action, el, pos){
			that.cmds[action](el , pos) ;
		}) ;

	};

	ContextMenu.prototype = {

		disable : function(target){
			this.jq.disableContextMenuItems(target);
		} ,

		enable : function(target){
			this.jq.enableContextMenuItems(target);
		}
	};

	fy.register("contextMenu", ContextMenu, "DisplayObject");

})(window, jQuery, fy);



