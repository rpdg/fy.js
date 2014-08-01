
;
(function (window, $, fy, undefined) {
	var idSeed = 0;


	var DataGrid = function (jq, cfg) {
		//initialize defaults
		var that = this ,
			sets = $.extend({template:this.makeTemplate(cfg)}, cfg);

		//call super constructor
		DataGrid.parent.call(this, jq, sets);

		//self attributes
		this.columns = sets.columns;
		//if (typeof sets.sortFunction === 'function') this.sortFunction = sets.sortFunction;

		//如果是从空容器创建的，将jq对象指定到<table>控件上
		if (this.jq[0].tagName.toLowerCase() !== 'table')
			this.jq = $('<table id="' + jq[0].id + '_table" class="fui-datagrid"></table>').appendTo(this.jq);
		else{
			this.jq.addClass("fui-datagrid");
			//fix webkit addClass redraw bug
			if(fy.browser.webkit){
				var tmp = $('<br>') ;
				this.jq.replaceWith(tmp) ;
				tmp.replaceWith(this.jq) ;
			}
		}


		this.table = this.jq;



		//make the table header
		this.makeTHeader(sets);

		this.thead = this.jq.find("tr.fyGridHeadCols") ;
		this.tfoot = this.jq.find("tfoot td").eq(0);
		this.tbody = this.jq = this.jq.find("tbody");
		if(this.group) this.tbody.addClass('groupedTbody') ;


		this.titleBars = 1 ;
		if(sets.header) this.titleBars++ ;
		if(sets.toolBar) this.titleBars++ ;

		this.sortInLocal = !!sets.sortInLocal ;
		if(sets.selectedClass) this.selectedClass = sets.selectedClass ;
		this.keyboardEdit = sets.keyboardEdit ;

		//if (sets.hideFooter) this.tfoot.hide();
		if (sets.hideHeader) this.thead.hide();



		//add event listener
		var selectEvt = sets.selectEvent||'click' ;
		this.tbody.delegate("td", selectEvt , function (evt) {
			//log($(evt.currentTarget).parents("tr")[0].rowIndex);
			that.selectHandler(evt, $(evt.currentTarget).parents("tr")[0].rowIndex - that.titleBars);
		});

		//
		if(cfg.onRowDblClick) {
			this.tbody.delegate('tr' , 'dblclick' , function(){
				cfg.onRowDblClick(that.selectedIndex , that.getSelectedData()) ;
			}) ;
		}

		this.pagination = sets.pagination ;
		this.param = sets.param ;

		//data-grid.create
		if(!this.lazy) this.create();
	};

	//class methods
	DataGrid.prototype = {
		create : function() {
			if (typeof this.onInit === 'function') this.onInit() ;

			if (typeof this.htmlMashup === 'function') this.htmlMashup(true);

			if (this.data) {
				this.sortInLocal = true ;
				this.bindData({data : this.data} , true);
			}
			else if (this.url) {
				//when be setted pagable
				var that = this ;
				if (this.pagination) {

					var pageDefaults = {
						link_to:"javascript:void(0)",
						num_edge_entries:1,
						num_display_entries:5,
						items_per_page:10,
						prev_text:"上页",
						next_text:"下页",
						load_first_page : false ,
						callback:function (pageIndex, paginationContainer) {
							that.pageIndex = that.param.pageIndex = pageIndex;
							that.update();
							return false;
						}
					};
					this.pagination = $.extend(pageDefaults, this.pagination);

					this.pageCount =
						this.pageIndex =
							this.rowCount = 0;

					this.pageSize = this.pagination.items_per_page ;

					this.param = $.extend({
						pageIndex: this.pageIndex,
						pageSize: this.pageSize
					}, this.param);

					this.tPager = $('<div style="float: right; "></div>').appendTo(this.tfoot);

					if (this.pagination.showCount) {

						if (typeof this.pagination.showCount === "string") this.showCountTmpl = this.pagination.showCount;
						else this.showCountTmpl = '总记录数: {rowCount} , 第{pageNum} / {pageCount}页';

						this.pageCounter = $('<span></span>');

						this.tPager.after(this.pageCounter);
					}

					if(this.pagination.customizable){
						if(!this.pagination.customizable.push) this.pagination.customizable = [10 , 20 , 50] ;

						var ps = this.pagination.customizable , arq =[] ;
						for(var q = 0 , ql = ps.length ; q < ql ; q++)
							arq[q] = '<option value="'+ps[q]+'" '+(ps[q]==this.pageSize?'selected':'')+'>'+ps[q]+'</option>' ;

						this.pageSelector = $('<select style="width: 50px;margin-right: 12px;">'+arq.join('')+'</select>');
						this.tfoot.prepend(this.pageSelector);

						//on change event
						this.pageSelector.bind('change' , function(){
							that.pageSize = that.param.pageSize = this.options[this.selectedIndex].value ;
							that.pageIndex = that.param.pageIndex = 0;
							that.update();
							return false;
						});
					}

				}
				//else if (sets.hideFooter) this.tfoot.hide();

				this.xhr = $.ajaxSettings.xhr() ;
				this.ajax(this.param , true) ;
			}

			return this ;
		} ,
		bindHandler: function(json , isInCreating){

			this.items = this.tbody.find("tr") ;

			if(this.group) this.mkGroup(this.group , json , isInCreating) ;

			if (typeof this.onBind === 'function') this.onBind(json , isInCreating) ;
		} ,
		createHandler:function (json) {
			this.created = true ;
			this.paginate(json , true) ;

			if(this.columns){
				this.sortColumn(json , true);
				this.configEditable(json , true);
			}


			if (typeof this.onCreate === 'function') {
				this.onCreate(json);
				if (this.keyboardEdit) keyboardEdit(this);
			}
		},
		mkGroup : function(group , json, isInCreating){
			for(var gi = 0 , gl = group.length ; gi<gl ; gi++){
				var cellIndex = group[gi]  ,  pValue = null , pSpan = 1 , $pTd = null ;
				var col = this.cols(cellIndex);
				for(var i = 0 , l = col.length ; i < l ; i++){
					var $td = col.eq(i) , html = $td.html() ;
					if(html !== pValue){
						pValue = html ;
						pSpan = 1 ;
						$pTd = $td ;
					}
					else{
						pSpan++ ;
						$td.remove() ;
						$pTd.attr('rowspan' , pSpan) ;
					}
				}
			}


			/*this.tbody.on('click' , 'td' ,function(){
					alert(this.cellIndex);
			}) ;*/
		},
		paginate: function(json , isInCreating){
			if (this.pagination) {

				this.pageInfo = json.page || this.pageInfo;

				this.pageInfo.pageNum = this.pageInfo.pageIndex + 1;

				this.rowCount = this.pageInfo.rowCount;

				this.pageIndex = this.pagination.current_page = this.pageInfo.pageIndex;

				this.pageCount = this.pageInfo.pageCount;

				this.pageSize = this.pagination.items_per_page = this.pageInfo.pageSize ;

				this.tPager.pagination(this.rowCount, this.pagination);

				if (this.pagination.showCount) {
					this.pageCounter.html(fy.formatJSON(this.showCountTmpl, this.pageInfo));
				}
			}
		} ,

		updateHandler :function (json , isInCreating) {
			isInCreating = !!isInCreating ;

			//this.items = this.tbody.find("tr") ;

			this.paginate(json , isInCreating) ;
			////this.sortColumn(json , isInCreating);
			if(this.columns) this.configEditable(json , isInCreating);


			if (typeof this.onUpdate === 'function') this.onUpdate(json , isInCreating);

			if (typeof this.onUpdateOnce === 'function') {
				this.onUpdateOnce(json ,isInCreating) ;
				delete this.onUpdateOnce ;
			}
		},

		//TODO : to be optimized
		configEditable:function (json , isInCreating) {
			var that = this ,
				cmtFn = function (val, editCfg) {
					var $td = $(this)  ,
						str = val  ,
						datarow = that.data[$td.parent("tr")[0].rowIndex - that.titleBars] ,
						attr = that.columns[this.cellIndex].src ,
						oldVal = $td.data("oval")|| datarow[attr] ,
						oldHTML = $td.data("oldHTML")  ;

					if (val != oldVal) {
						var renderer = that.columns[this.cellIndex].renderer;
						if (renderer) str = renderer(val, this.cellIndex, datarow , attr);

						//put value into original dataset
						datarow[attr] = val;
						datarow[":modified by user"] = true ;

						if($td.data("linkRow")){
							var tds = $td.siblings("td") ;
							tds.each(function(i, o){
								var $t = tds.eq(i);
								var r = that.columns[o.cellIndex].renderer; //$t.data("itemRender");
								if (r && !o.editing) {
									var h = r(datarow[that.columns[o.cellIndex].src] , o.cellIndex, datarow , attr) ;
									$t.html(h).data({"oldHTML" : h}) ;
								}
							});
						}
						$td.data("oval" , val).data({"oldHTML" : str}).addClass("tableEditedCell");

						if(editCfg.type === "select") {
							editCfg.data.selected = val;
							$td.editable('destroy');
							$td.editable(cmtFn, editCfg);
						}
						else if(editCfg.type === "checkBox"){
							//alert(0)
							//log(val)
						}

						if(editCfg.onEdited) {
							var mObj = {} ;
							mObj[attr] = val ;
							editCfg.onEdited.call(that , $td , mObj , datarow , attr) ;
						}
					}
					else {
						str = oldHTML ;
					}
					return str;
				};

			var i = l = this.columns.length;
			while (i--) {
				var colSet = this.columns[i];

				if (colSet.editable) {
					var thisCol = this.cols(i) ;
					thisCol.each(function (x, td) {
						//log(x, td ,this);
						var $td = $(td) , def = {onblur:'submit' , width:'none' , height:'none' , placeholder : ''};
						if(colSet.editable.submit) def.onblur = "ignore" ;
						var editSets = $.extend(def , colSet.editable) ;
						if(editSets.type === "select"){
							if(editSets.data.reverse){
								var btArr = editSets.data, btl = btArr.length , btJson = {} ;
								while(btl--) btJson[btArr[btl][editSets.value]] = btArr[btl][editSets.text];
								editSets.data = btJson ;
							}
							editSets.data = $.extend({selected : $td.data("oval")} , editSets.data) ;
							//log(editSets , $td.data("oval"));
						}

						//editable阻止事件冒泡，所以在这里再先注册一下click事件，矫正 onSelect
						$td.bind("click.fy",function (evt) {
							that.selectHandler(evt, td.parentElement.rowIndex - that.titleBars);
						})
						.data({"oldHTML" : $td.html()}).addClass("editableTD")
						.editable(cmtFn, editSets);

						if(colSet.editable.linkRow){
							$td.data("linkRow" , true) ;
						}
					});
				}

				switch (colSet.cmd){
					case "checkAll" :{
						if(isInCreating) {
							this.cmdCheckAll = this.thead.find("th").eq(i).find('input') ;
							//log('dddd' , i , this.cols(0) , $(this.cols(i).find(':checkbox') , this.tbody)) ;
							this.cmdCheckAll.syncCheckBoxGroup("td.cellIndex_0>:checkbox:enabled" , this.tbody);
						}
						this.cmdCheckAll.prop("checked" , false) ;
						break;
					}
					case "checkOne" :{
						//TODO:
						if(isInCreating) {
							this.cmdCheckOne = this.thead.find("th").eq(i).find('input:hidden') ;
						}
						break;
					}
					default :
				}
			}
		},
		makeTHeader:function (sets) {
			var i = 0, l = sets.columns?sets.columns.length :0 , cols = [] , th = []  ;

			for (; i < l; i++) {
				var bool = false  , col = sets.columns[i];
				//cols[i] = '<col style="'+(col.width? 'width:'+col.width+'px;':'' ) + (col.align? 'text-align:'+col.align+';' : '') +'" />' ;
				if(col.cmd) {
					bool = true ;
					col.width = '30' ;

					if(col.cmd === 'checkAll')
						col.text = '<label><input type="checkbox" name="'+ col.src +'" value="chk_'+i+'"> '+ (col.text||'') + '</label>';
					else
						col.text = '<input type="hidden" name="'+ col.src +'" value="chk_'+i+'">';
				}

				th[i] = '<th data-osrc="' + (typeof col.sortable ==='string'? col.sortable: col.src) + '"'+(bool?' style="text-overflow:clip;"':'')+'>' + (col.text || 'column_' + i) + '</th>';
				cols[i] = "width:" + (col.width ? col.width+"px;" : "auto;min-width:16px;");
			}
			var tbHeaderTr = (sets.header) ? '<tr class="fyGridHeadText"><th colspan="' + (l || '1') + '">' + sets.header + '</th></tr>' : '';

			var toolBar = (sets.toolBar) ? '<tr class="fyGridHeadBar"><th class="fyToolBar" colspan="' + l + '" ></th></tr>' : '' ;

			var thead = '<colgroup><col style="' + cols.join('"><col style="') + '"></colgroup><thead>' + tbHeaderTr + toolBar + '<tr class="fyGridHeadCols">' + th.join('') + '</tr></thead>';
			//var thead = '<colgroup>' + cols.join('') + '"</colgroup><thead>' + tbHeaderTr + '<tr>' + th.join('') + '</tr></thead>';

			var tfoot = (sets.hideFooter) ? '' : '<tfoot><tr><td colspan="' + (l || '1') + '"></td></tr></tfoot>';

			this.jq.append(thead + '<tbody id="' + this.jq[0].id + '_tbody"></tbody>' + tfoot);


			if(sets.toolBar){
				this.toolBar = this.jq.find('.fyToolBar') ;
				var btnVars ;
				for (i = 0 , l = sets.toolBar.length ; i < l ; i++ ){
					btnVars = sets.toolBar[i] ;
					$('<button'+(btnVars.id? ' id="'+btnVars.id+'"' : '')+' class="fyToolBar_Button" style="'+
						(btnVars.icon ? 'background-image:url('+btnVars.icon+')': 'text-indent:0') + ';" '+
						(btnVars.disabled?'disabled':'')+'>'+btnVars.text+'</button>')
						.click(btnVars.onClick)
						.appendTo(this.toolBar) ;
				}
				this.toolBar.buttons = this.toolBar.find('.fyToolBar_Button') ;

				if(sets.toolBarPosition === 'bottom') this.toolbarCopy();
				if(sets.toolBarPosition === 'both') this.toolbarCopy(true);
			}


		},
		makeTemplate: function (obj) {
			var tmp = [] , render , name , i = 0, l = obj.columns?obj.columns.length :0 ;
			obj.bindOptions = $.extend({itemRender:{}}, obj.bindOptions);

			for (; i < l; i++) {
				var col = obj.columns[i] ;

				if(col.group) {
					if(!this.group) this.group = [i] ;
					else this.group.push(i) ;
				}

				var cls = col.className?(' '+col.className):'' ;
				if(col.cmd){
					if(col.cmd === 'checkAll')
						tmp[i] = '<td data-osrc="'+col.src+'" class="font-center cellIndex_'+i+'">' +
							'<input type="checkbox" name="chk_'+i+'" value="{' + col.src + '}"></td>' ;
					else tmp[i] = '<td data-osrc="'+col.src+'" class="font-center cellIndex_'+i+'">' +
						'<input type="radio" name="chk_'+i+'" value="{' + col.src + '}"></td>' ;
				}
				else{
					if (typeof col.renderer === 'function') {
						name = col.src + '_Renderer' + (++idSeed) ;
						render = ':=' + name ;
						obj.bindOptions.itemRender[name] = col.renderer;
					}
					else render = "";

					var tt = '' ;
					if(cls && col.title===undefined) col.title=true ;
					if(col.title === true) tt = ' title="{'+col.src + render +'}"' ;
					else if(typeof col.title ==='string') tt = ' title="'+col.title.replace(/"/g , '\\"')+'"' ;

					var classAlign = (col.align ? "font-" + col.align.toLowerCase() : "");

					tmp[i] = '<td '+tt+' data-osrc="'+col.src+'" class="'+classAlign+' cellIndex_'+i + cls +'">{' + col.src + render + '}</td>';
				}
			}
			return '<tr>' + tmp.join('') + '</tr>';
		},

		toolbarCopy :function(clone){
			if(this.toolBar){
				var bar ;
				if(clone){
					bar = this.toolBar.parent().clone(true) ;
					bar.find('.fyToolBar_Button').each(function(i, elem){
						if(elem.id) elem.id = elem.id + "_2";
					}) ;
				}
				else{
					bar = this.toolBar.parent()
				}

				this.table.find('tfoot').prepend(bar);
			}
		},
		th:function (i) {
			if (i !== undefined)
				return this.thead.find("th").eq(parseInt(i, 10) || 0);
			else
				return this.thead.find("th");
		},
		hideColumn: function(i){
			this.th(i).add(this.cols(i)).hide() ;
		} ,
		rows:function (i) {
			if (i !== undefined) return this.tbody.find("tr").eq(parseInt(i, 10) || 0);
			else return this.tbody.find("tr");
		},
		cols: function (i) {
			if (i !== undefined) return this.tbody.find('.cellIndex_' + i) ;
			else return this.tbody.find("td");
		},
		selectHandler:function (evt, curIndex) {
			//if(curIndex === this.selectedIndex) return ;

			this.prevIndex = this.selectedIndex;
			this.selectedIndex = curIndex;

			if(this.selectedClass) {
				//log(curIndex , this.prevIndex , this.rows(curIndex) , this.rows(this.prevIndex));
				if (this.prevIndex > -1) this.rows(this.prevIndex).removeClass(this.selectedClass) ;
				this.rows(curIndex).addClass(this.selectedClass) ;
			}

			if (typeof this.onSelect === 'function') this.onSelect(evt);
		},

		sortColumn:function (json) {
			var $thArr = this.thead.find("th") ,
				sortInLocal = this.sortInLocal ,
				that = this  ;

			for (var i = 0, l = this.columns.length; i < l; i++) {
				if (this.columns[i].sortable) {
					var $th = $thArr.eq(i) ;
					$th.append('<span class="spSortableTH"></span>') ;

					//本地排序
					if (sortInLocal) {

						//点击事件
						$th.click(function () {
							var $th = $(this);
							$th.data("sortType", ($th.data("sortType") === "desc" ? "asc" : "desc"));

							var attr = $th.data("osrc");
							that.json.data = fy.sortOn(that.json.data, attr , that.columns[this.cellIndex].sortFunction);

							if (that.prevSortCol) that.prevSortCol.find(".spSortableTH").text("");

							that.prevSortCol = $th ;

							if ($th.data("sortType") === "desc") {
								that.json.data.reverse();
								$th.find(".spSortableTH").text(" (▾)");
							}
							else $th.find(".spSortableTH").text(" (▴)");

							that.bindData(that.json , false);
						});

					}
					// ajax排序, 发送配对参数即可
					else {
						//点击事件
						$thArr.eq(i).click(function () {
							var $th = $(this),
								sType = $th.data("sortType") === "desc" ? "asc" : "desc" ;

							$th.data("sortType", sType);
							that.curSortCol = $th;
							if (that.prevSortCol &&  that.prevSortCol[0] != that.curSortCol[0]) {
								that.prevSortCol.find(".spSortableTH").text("");
							}
							that.prevSortCol = $th;


							if (sType === "desc") {
								$th.find(".spSortableTH").text(" (▾)");
							}
							else $th.find(".spSortableTH").text(" (▴)");

							var sortParam = {"sortBy":$th.data("osrc"), "sortType": sType };

							that.update(sortParam);
						});
					}
				}
			}
		} ,

		getCheckValue : function(){
			var key , chkBoxes ;
			if(this.cmdCheckAll){
				key = this.cmdCheckAll.val() ;
				chkBoxes = this.tbody.find("[name='"+key+"']:checked") ;
				if(chkBoxes.length){
					var chks = this.tbody.find("[name='"+key+"']:checked").fieldsToJson() ;
					return chks[key].push ? chks[key] : [chks[key]]  ;
				}
				else return [] ;
			}
			else if(this.cmdCheckOne){
				key = this.cmdCheckOne.val() ;
				chkBoxes = this.tbody.find(":radio[name='"+key+"']:checked") ;
				return chkBoxes.val() || null ;
			}
			else return null ;
		},
		getCheckData : function(){
			if(this.cmdCheckAll || this.cmdCheckOne){
				var key = (this.cmdCheckAll || this.cmdCheckOne).val() ,
					chkBoxes = this.tbody.find("input[name='"+key+"']") ,
					rev = this.cmdCheckAll ? [] : null ;

				for(var i = 0 , l = chkBoxes.length ; i < l ; i++){
					if(chkBoxes[i].checked) {
						if(this.cmdCheckOne) return this.data[i];
						else rev.push(this.data[i]);
					}
				}

				return rev ;
			}
			else return null;
		} ,
		addRow : function(json){
			//TODO: fix the error caused when pagination is setted
			//if(this.pagination) return this;
			this.data.push(json) ;
			this.bindData({data : this.data});
			//this.updateHandler(this.data);
			return this;
		},
		delRowAt : function(i){
			this.data.splice(i,1) ;
			//this.items.eq(i).remove() ;
			this.bindData({data : this.data});
			this.updateHandler(this.data);
			return this;
		},
		getModifiedRows:function(){
			var arr = []  , d = this.data , n = d.length;
			while(n--) if(d[n][":modified by user"]) arr.push(d[n]);
			return this.getPureData(arr) ;
		},
		delRow : function(tr){
			var i = this.items.index(tr) ;
			this.delRowAt(i) ;
			return this;
		} ,
		empty : function(){
			this.tbody.html('');
			return this;
		},
		setTitle:function(str){
			var tr = this.table.find('tr.fyGridHeadText') ;
			if(tr.length){
				tr.find('th:first').html(str) ;
			}
		}
	};

	//regist into fy namespace
	fy.register("datagrid" , DataGrid, "ListBase");


	//
	function keyboardEdit(tb, newdata) {
		setTimeout(function () {
			tb.tbody.find("tr:first").find(".editableTD").eq(0).trigger('click');
		}, 100);
		tb.tbody.delegate("td", "keydown", function (e) {
			var $curTd = $(this);
			switch (e.keyCode) {
				case 13 :
					setTimeout(function () {
						var $nextTd = $curTd.nextAll('.editableTD');
						if ($nextTd.length) {
							$nextTd.eq(0).trigger('click');
						}
						else {
							var $tr = $curTd.parent("tr");
							var $nextTr = $tr.next('tr');
							if ($nextTr.length) {
								$nextTr.find(".editableTD").eq(0).trigger('click');
							}
							else {
								if (newdata) {
									tb.addRow(newdata);
									tb.tbody.find("tr:last").find(".editableTD").eq(0).trigger('click');
								}
							}
						}
					}, 20);

					break;
				case 37 :
					setTimeout(function () {
						var $prevTd = $curTd.prevAll('.editableTD');
						if ($prevTd.length) {
							$prevTd.eq(0).trigger('click');
						}
					}, 20);
					break;
				case 38 :
					setTimeout(function () {
						var $prevTr = $curTd.parent("tr").prev('tr') , $prevTd;
						if ($prevTr.length) {
							$prevTd = $prevTr.find("td").eq($curTd[0].cellIndex);
							$prevTd.trigger('click');
						}
					}, 20);
					break;
				case 39 :
					setTimeout(function () {
						var $nextTd = $curTd.nextAll('.editableTD');
						if ($nextTd.length) {
							$nextTd.eq(0).trigger('click');
						}
					}, 20);
					break;
				case 40 :
					setTimeout(function () {
						var $nextTr = $curTd.parent("tr").next('tr') , $nextTd;
						if ($nextTr.length) {
							$nextTd = $nextTr.find("td").eq($curTd[0].cellIndex);
							$nextTd.trigger('click');
						}
						else {
							if (newdata) {
								tb.addRow(newdata);
								tb.tbody.find("tr:last").find(".editableTD").eq(0).trigger('click');
							}
						}
					}, 20);
					break;
				default :
					;
			}
		})
	}
})(window, jQuery, fy);
