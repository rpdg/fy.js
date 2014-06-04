;
(function (window, $, fy, undefined) {

	var Tree = function (jq, cfg) {
		//initialize defaults
		var renderer = '' ,
			sets = $.extend({
				bindOptions:{},
				textSrc:"text",
				animated: 100 ,
				control: $('<span><a></a><a></a><a></a></span>'),
				collapsed: true ,
				fullyUpdate : false
			}, cfg);

		if (cfg.renderer) {
			renderer = ':=render';
			sets.bindOptions.itemRender = {render:cfg.renderer};
		}

		if(!sets.bindOptions.template)
			sets.bindOptions.template = sets.template || '<li><span>{' + sets.textSrc + renderer + '}</span></li>';

		//call super constructor
		Tree.parent.call(this, jq, sets);

		//self attributes
		this.selectedClass = sets.selectedClass || "current" ;
		this.selectedIndex = sets.selectedIndex ;
		this.eventType = "click.fy" ;
		this.updateKey = sets.updateKey||"id" ;
		this.control = sets.control.find("a") ;
		this.fullyUpdate = sets.fullyUpdate ;

		//如果是从空容器创建的，将jq对象指定到<ul>控件上
		if (this.jq[0].tagName.toLowerCase() !== 'ul')
			this.jq = $('<ul class="treeview"></ul>').appendTo(this.jq);
		else
			this.jq.addClass("treeview");

		if(sets.fileTree) this.jq.addClass("filetree") ;
		this.sets = sets ;
		if(!this.lazy) this.create(sets);

	};

	Tree.prototype = {
		createHandler : function (json) {
			this.created = true ;
			var that = this;
			this._selectedItem = null ;
			//add event listener
			this.jq.delegate("li", this.eventType, function (evt) {
				evt.stopPropagation();
				that.selectHandler(evt, that.selectedIndex);
			});
			if (typeof this.onCreate === 'function') this.onCreate(json);
		},
		selectHandler : function(evt) {
			if(this._selectedItem!==null && (this._selectedItem[0] === evt.currentTarget)) return ;

			if(this.selectedClass) if(this._selectedItem) this._selectedItem.children("span").removeClass(this.selectedClass);
			this._selectedItem = $(evt.currentTarget) ;

			if(this.selectedClass) if(this._selectedItem) this._selectedItem.children("span").addClass(this.selectedClass);
			this._selectedData = this._selectedItem.data("treeItem") ;

			if (typeof this.onSelect === 'function') this.onSelect(evt , this._selectedData) ;

			//ajax update
			if(this._selectedItem.hasClass("hasChildren")){
				this._selectedItem.removeClass("hasChildren");
				var obj = {} ;
				obj[this.updateKey] = this._selectedData[this.updateKey] ;
				this.update(obj);
			}
		},
		getSelectedData : function() {
			if(this._selectedData) return this._selectedData ;
			else return null;
		} ,
		getSelectedItem : function () {
			if(this._selectedItem) return this._selectedItem ;
			else return null;
		} ,
		collapseAll : function(){
			if(this.control) this.control.eq(0).trigger("click") ;
		} ,
		expandAll : function(){
			//this.jq.find("li.expandable").click();
			if(this.control) this.control.eq(1).trigger("click") ;
		} ,
		toggleAll : function(){
			if(this.control) this.control.eq(2).trigger("click") ;
		} ,
		bindData : function (json , isInCreating) {
			if (!isInCreating) {
				var container ;
				if(this.fullyUpdate || !this._selectedItem){
					this.data = json.data ;
					container = this.jq ;
				}
				else{
					//TODO: 异步后续载入的数据，应该追加在原有JSON当中
					this.data = json.data ; //<--- 不对
					container = this._selectedItem.find("ul") ;
				}

				this.createNode(container , json.data) ;
				container.treeview({collapsed: true});

				this.bindHandler(json , isInCreating);
				this.updateHandler(json);
			}
			else {
				this.data = json.data ;
				this.createNode(this.jq , json.data) ;
				//log(this.jq , this.sets);
				this.jq.treeview(this.sets);

				this.bindHandler(json , isInCreating);
				this.createHandler(json) ;
			}

			return this ;
		},
		createNode : function (parent , dataList) {
			var that = this ;
			parent.bindList({
				list : dataList ,
				template: that.bindOptions.template ,
				itemRender : that.bindOptions.itemRender ,
				onBound : function( list){
					var branch = this.find("li") ;
					for (var i=0 , l=list.length ; i<l ; i++){
						var item = list[i] , $c = branch.eq(i).data("treeItem" , item) ;
						if (item.expanded) {
							$c.addClass("open");
						}
						if(item.children && item.children.length){
							that.createNode($('<ul></ul>').appendTo($c.find("span").addClass("folder").end()) , item.children);
						}
						else if(item.hasChildren){
							$c.find("span").addClass("folder").end().addClass("hasChildren").append('<ul><li><span class="placeholder">&nbsp;</span></li></ul>');
						}
						else{
							$c.find("span").addClass("file");
						}
					}
				}
			}) ;
		}
	};


	fy.register("tree", Tree, "ListBase");
})(window, jQuery, fy);



/*
 * Treeview 1.5pre - jQuery plugin to hide and show branches of a tree
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-treeview/
 * http://docs.jquery.com/Plugins/Treeview
 *
 * Copyright 2010 Jörn Zaefferer
 * Released under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

;(function($) {

	// TODO rewrite as a widget, removing all the extra plugins
	$.extend($.fn, {
		swapClass: function(c1, c2) {
			var c1Elements = this.filter('.' + c1);
			this.filter('.' + c2).removeClass(c2).addClass(c1);
			c1Elements.removeClass(c1).addClass(c2);
			return this;
		},
		replaceClass: function(c1, c2) {
			return this.filter('.' + c1).removeClass(c1).addClass(c2).end();
		},
		hoverClass: function(className) {
			className = className || "hover";
			return this.hover(function() {
				$(this).addClass(className);
			}, function() {
				$(this).removeClass(className);
			});
		},
		heightToggle: function(animated, callback) {
			animated ?
				this.animate({ height: "toggle" }, animated, callback) :
				this.each(function(){
					jQuery(this)[ jQuery(this).is(":hidden") ? "show" : "hide" ]();
					if(callback)
						callback.apply(this, arguments);
				});
		},
		heightHide: function(animated, callback) {
			if (animated) {
				this.animate({ height: "hide" }, animated, callback);
			} else {
				this.hide();
				if (callback)
					this.each(callback);
			}
		},
		prepareBranches: function(settings) {
			if (!settings.prerendered) {
				// mark last tree items
				this.filter(":last-child:not(ul)").addClass(CLASSES.last);
				// collapse whole tree, or only those marked as closed, anyway except those marked as open
				this.filter((settings.collapsed ? "" : "." + CLASSES.closed) + ":not(." + CLASSES.open + ")").find(">ul").hide();
			}
			// return all items with sublists
			return this.filter(":has(>ul)");
		},
		applyClasses: function(settings, toggler) {
			// TODO use event delegation
			this.filter(":has(>ul):not(:has(>a))").find(">span").unbind("click.treeview").bind("click.treeview", function(event) {
				// don't handle click events on children, eg. checkboxes
				if ( this == event.target )
					toggler.apply($(this).next());
			}).add( $("a", this) ).hoverClass();

			if (!settings.prerendered) {
				// handle closed ones first
				this.filter(":has(>ul:hidden)")
					.addClass(CLASSES.expandable)
					.replaceClass(CLASSES.last, CLASSES.lastExpandable);

				// handle open ones
				this.not(":has(>ul:hidden)")
					.addClass(CLASSES.collapsable)
					.replaceClass(CLASSES.last, CLASSES.lastCollapsable);

				// create hitarea if not present
				var hitarea = this.find("div." + CLASSES.hitarea);
				if (!hitarea.length)
					hitarea = this.prepend("<div class=\"" + CLASSES.hitarea + "\"/>").find("div." + CLASSES.hitarea);
				hitarea.removeClass().addClass(CLASSES.hitarea).each(function() {
					var classes = "" , $this = $(this) ;

					$.each($this.parent().attr("class").split(" "), function() {
						classes += this + "-hitarea ";
					});
					//log($this , $this.parent().attr("class")) ;
					$this.addClass( classes );
				})
			}

			// apply event to hitarea
			this.find("div." + CLASSES.hitarea).click( toggler );
		},
		treeview: function(settings) {

			settings = $.extend({
				cookieId: "treeview"
			}, settings);

			if ( settings.toggle ) {
				var callback = settings.toggle;
				settings.toggle = function() {
					return callback.apply($(this).parent()[0], arguments);
				};
			}

			// factory for treecontroller
			function treeController(tree, control) {
				// factory for click handlers
				function handler(filter) {
					return function() {
						// reuse toggle event handler, applying the elements to toggle
						// start searching for all hitareas
						toggler.apply( $("div." + CLASSES.hitarea, tree).filter(function() {
							// for plain toggle, no filter is provided, otherwise we need to check the parent element
							return filter ? $(this).parent("." + filter).length : true;
						}) );
						return false;
					};
				}
				// click on first element to collapse tree
				$("a:eq(0)", control).click( handler(CLASSES.collapsable) );
				// click on second to expand tree
				$("a:eq(1)", control).click( handler(CLASSES.expandable) );
				// click on third to toggle tree
				$("a:eq(2)", control).click( handler() );
			}

			// handle toggle event
			function toggler() {
				$(this)
					.parent()
					// swap classes for hitarea
					.find(">.hitarea")
					.swapClass( CLASSES.collapsableHitarea, CLASSES.expandableHitarea )
					.swapClass( CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea )
					.end()
					// swap classes for parent li
					.swapClass( CLASSES.collapsable, CLASSES.expandable )
					.swapClass( CLASSES.lastCollapsable, CLASSES.lastExpandable )
					// find child lists
					.find( ">ul" )
					// toggle them
					.heightToggle( settings.animated, settings.toggle );
				if ( settings.unique ) {
					$(this).parent()
						.siblings()
						// swap classes for hitarea
						.find(">.hitarea")
						.replaceClass( CLASSES.collapsableHitarea, CLASSES.expandableHitarea )
						.replaceClass( CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea )
						.end()
						.replaceClass( CLASSES.collapsable, CLASSES.expandable )
						.replaceClass( CLASSES.lastCollapsable, CLASSES.lastExpandable )
						.find( ">ul" )
						.heightHide( settings.animated, settings.toggle );
				}
			}

			this.data("toggler", toggler);

			function serialize() {
				function binary(arg) {
					return arg ? 1 : 0;
				}
				var data = [];
				branches.each(function(i, e) {
					data[i] = $(e).is(":has(>ul:visible)") ? 1 : 0;
				});
				$.cookie(settings.cookieId, data.join(""), settings.cookieOptions );
			}

			function deserialize() {
				var stored = $.cookie(settings.cookieId);
				if ( stored ) {
					var data = stored.split("");
					branches.each(function(i, e) {
						$(e).find(">ul")[ parseInt(data[i]) ? "show" : "hide" ]();
					});
				}
			}

			// add treeview class to activate styles
			this.addClass("treeview");

			// prepare branches and find all tree items with child lists
			var branches = this.find("li").prepareBranches(settings);

			switch(settings.persist) {
				case "cookie":
					var toggleCallback = settings.toggle;
					settings.toggle = function() {
						serialize();
						if (toggleCallback) {
							toggleCallback.apply(this, arguments);
						}
					};
					deserialize();
					break;
				case "location":
					var current = this.find("a").filter(function() {
						return this.href.toLowerCase() == location.href.toLowerCase();
					});
					if ( current.length ) {
						// TODO update the open/closed classes
						var items = current.addClass("selected").parents("ul, li").add( current.next() ).show();
						if (settings.prerendered) {
							// if prerendered is on, replicate the basic class swapping
							items.filter("li")
								.swapClass( CLASSES.collapsable, CLASSES.expandable )
								.swapClass( CLASSES.lastCollapsable, CLASSES.lastExpandable )
								.find(">.hitarea")
								.swapClass( CLASSES.collapsableHitarea, CLASSES.expandableHitarea )
								.swapClass( CLASSES.lastCollapsableHitarea, CLASSES.lastExpandableHitarea );
						}
					}
					break;
			}

			branches.applyClasses(settings, toggler);

			// if control option is set, create the treecontroller and show it
			if ( settings.control ) {
				treeController(this, settings.control);
				$(settings.control).show();
			}

			return this;
		}
	});

	// classes used by the plugin
	// need to be styled via external stylesheet, see first example
	$.treeview = {};
	var CLASSES = ($.treeview.classes = {
		open: "open",
		closed: "closed",
		expandable: "expandable",
		expandableHitarea: "expandable-hitarea",
		lastExpandableHitarea: "lastExpandable-hitarea",
		collapsable: "collapsable",
		collapsableHitarea: "collapsable-hitarea",
		lastCollapsableHitarea: "lastCollapsable-hitarea",
		lastCollapsable: "lastCollapsable",
		lastExpandable: "lastExpandable",
		last: "last",
		hitarea: "hitarea"
	});

})(jQuery);


