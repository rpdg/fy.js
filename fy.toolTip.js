;
(function (window, $, fy, undefined) {

	var toolTip = function (jq, cfg) {
		var def = {
				arrow: true,
				arrowColor: '',
				once : false ,
				trigger: 'auto' ,
				fixedWidth: 0,
				offsetX: 0,
				offsetY: 0,
				position: 'top-left',
				tooltipTheme: '.tooltip-message'
			} ,
			sets = $.extend(def , cfg) ;

		//call super constructor
		toolTip.parent.call(this, jq, sets);

		//self attributes
		this.tipText = sets.text || this.jq.attr("title") || '' ;
		this.sets = sets ;
		this.$tip = null ;
		this.tooltip_width = this.tooltip_height = 0;
		//self events


		this.create(sets);
	};


	toolTip.prototype = {

		create:function () {
			if (typeof this.onInit === 'function') this.onInit();
			//
			var that = this  , $t = this.jq , settings = this.sets ;


			// Get tooltip text from the title attr
			var tooltip_text = that.tipText;


			// If a fixed width has been set, set the tooltip to that width
			var fixedWidth = (settings.fixedWidth > 0)?' style="width:'+ settings.fixedWidth +'px;"' : '';


			// Remove the title attribute to keep the default tooltip from popping up and append the base HTML for the tooltip
			that.$tip = $('<div class="'+ settings.tooltipTheme.replace('.','') +'"'+ fixedWidth +'><div class="tooltip-message-content">'+tooltip_text+'</div></div>').hide().appendTo('body');
			$t.data("$tip" , that.$tip) ;
			$t.data("sets" , settings) ;

			// If the tooltip doesn't follow the mouse, determine the placement

				// Find global variables to determine placement
				var window_width = $(window).width();
				var container_width = $t.outerWidth(false);
				var container_height = $t.outerHeight(false);
				var tooltip_width = this.tooltip_width = that.$tip.outerWidth(false);
				var tooltip_height = this.tooltip_height = that.$tip.outerHeight(false);
				var offset = $t.offset();

				// Hardcoding the width and removing the padding fixed an issue with the tooltip width collapsing when the window size is small
				if(!settings.fixedWidth) {
					that.$tip.css({
						'width': tooltip_width + 'px',
						'paddingLeft': 0,
						'paddingRight': 0
					});
				}


				// A function to detect if the tooltip is going off the screen. If so, reposition the crap out of it!
				function dont_go_off_screen() {

					var window_left = $(window).scrollLeft();

					// If the tooltip goes off the left side of the screen, line it up with the left side of the window
					if((my_left - window_left) < 0) {
						var arrow_reposition = my_left - window_left;
						my_left = window_left;

						that.$tip.data('arrow-reposition', arrow_reposition);
					}

					// If the tooltip goes off the right of the screen, line it up with the right side of the window
					if (((my_left + tooltip_width) - window_left) > window_width) {
						var arrow_reposition = my_left - ((window_width + window_left) - tooltip_width);
						my_left = (window_width + window_left) - tooltip_width;

						that.$tip.data('arrow-reposition', arrow_reposition);
					}
				}

				switch (settings.position) {
					case "top" :
					{
						var left_difference = (offset.left + tooltip_width) - (offset.left + $t.outerWidth(false));
						var my_left = (offset.left + settings.offsetX) - (left_difference / 2);
						var my_top = (offset.top - tooltip_height) - settings.offsetY - 10;
						dont_go_off_screen();

						if ((offset.top - tooltip_height - settings.offsetY - 11) < 0) {
							my_top = 0;
						}
						break;
					}
					case "top-left" :
					{
						var my_left = offset.left + settings.offsetX;
						var my_top = (offset.top - tooltip_height) - settings.offsetY - 10;
						dont_go_off_screen();
						break;
					}
					case 'top-right':
					{
						var my_left = (offset.left + container_width + settings.offsetX) - tooltip_width;
						var my_top = (offset.top - tooltip_height) - settings.offsetY - 10;
						dont_go_off_screen();
						break;
					}
					case 'bottom':
					{
						var left_difference = (offset.left + tooltip_width + settings.offsetX) - (offset.left + $t.outerWidth(false));
						var my_left = offset.left - (left_difference / 2);
						var my_top = (offset.top + container_height) + settings.offsetY + 10;
						dont_go_off_screen();
						break;
					}
					case 'bottom-left':
					{
						var my_left = offset.left + settings.offsetX;
						var my_top = (offset.top + container_height) + settings.offsetY + 10;
						dont_go_off_screen();
						break;
					}
					case 'bottom-right':
					{
						var my_left = (offset.left + container_width + settings.offsetX) - tooltip_width;
						var my_top = (offset.top + container_height) + settings.offsetY + 10;
						dont_go_off_screen();
						break;
					}
					case 'left':
					{
						var my_left = offset.left - settings.offsetX - tooltip_width - 10;
						var my_left_mirror = offset.left + settings.offsetX + container_width + 10;
						var top_difference = (offset.top + tooltip_height + settings.offsetY) - (offset.top + $t.outerHeight(false));
						var my_top = offset.top - (top_difference / 2);

						// If the tooltip goes off boths sides of the page
						if ((my_left < 0) && ((my_left_mirror + tooltip_width) > window_width)) {
							my_left = my_left + tooltip_width;
						}

						// If it only goes off one side, flip it to the other side
						if (my_left < 0) {
							var my_left = offset.left + settings.offsetX + container_width + 10;
							that.$tip.data('arrow-reposition', 'left');
						}
						break;

					}

					case 'right':
					{
						var my_left = offset.left + settings.offsetX + container_width + 10;
						var my_left_mirror = offset.left - settings.offsetX - tooltip_width - 10;
						var top_difference = (offset.top + tooltip_height + settings.offsetY) - (offset.top + $t.outerHeight(false));
						var my_top = offset.top - (top_difference / 2);

						// If the tooltip goes off boths sides of the page
						if (((my_left + tooltip_width) > window_width) && (my_left_mirror < 0)) {
							my_left = window_width - tooltip_width;
						}

						// If it only goes off one side, flip it to the other side
						if ((my_left + tooltip_width) > window_width) {
							my_left = offset.left - settings.offsetX - tooltip_width - 10;
							that.$tip.data('arrow-reposition', 'right');
						}
						break;
					}
					default :
					{

					}
				}


			// If arrow is set true, style it and append it
			if (settings.arrow == true){

				var arrow_class = 'tooltip-arrow-' + settings.position ,
					arrow_color = that.$tip.css('backgroundColor') ,
					arrow_type = '◆' ,
					arrow_vertical = '' ;



				if(arrow_class == 'tooltip-arrow-right') {
					arrow_vertical = 'top:' + ((tooltip_height / 2) - 6) + 'px';
				}
				else if(arrow_class == 'tooltip-arrow-left') {
					arrow_vertical = 'top:' + ((tooltip_height / 2) - 6) + 'px';
				}
				if(arrow_class.search('top') > 0) {
					arrow_vertical = 'top: '+(tooltip_height - 8)+'px';
				}
				if(arrow_class.search('bottom') > 0) {
					arrow_vertical = 'top: -6px';
				}

				var arrow = '<div class="'+ arrow_class +' tooltip-arrow" style="color:'+ arrow_color +'; width:'+ tooltip_width +'px; '+ arrow_vertical +'">'+ arrow_type +'</div>';


				// Place tooltip
				that.$tip.css({'top': my_top+'px', 'left': my_left+'px'}).append(arrow);
			}


			if(settings.trigger === 'auto'){
				$t.bind('mouseenter.fy' ,function(){
					that.show();
				}).bind('mouseleave.fy blur.fy', settings.once ? function(){
					that.dispose();
				}: function(){
					that.hide() ;
				}) ;
			}

			//
			this.createHandler();
			return this;
		} ,

		dispose : function(){
			var $t = this.jq , $tip = this.$tip ;
			$tip.stop(true,true).fadeOut(200 , function(){
				$t.removeData().unbind(".fy");
				$tip.removeData().remove();
			});
			return this;
		} ,

		show:function(){
			/*var offset = this.jq.offset() , 
				top = offset.top - this.tooltip_height - this.sets.offsetY ,
				left = offset.left - this.tooltip_width - this.sets.offsetX ;*/
			this.$tip.stop(true,true).fadeIn(200);
			return this;
		} ,

		hide:function() {
			this.$tip.stop(true,true).fadeOut(200);
			return this;
		}
	};

	fy.register("toolTip", toolTip , "DisplayObject");

})(window, jQuery, fy);



