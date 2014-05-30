;
(function (window, $, fy, undefined) {

	var DateField = function(jq, cfg){

		var sets = $.extend({ format:'yyyy-MM-dd' , allowBlank : true }, cfg ) ,  that = this ;

		//self attributes
		this.format = sets.format ;
		this.onChoose = sets.onChoose ;
		this.jq = jq.addClass("dateField-input")
			.prop("readonly", true) ;



		//calendar maker
		var dcSets = $.extend({} , sets) ;
		delete dcSets.onInit;
		delete dcSets.onCreate;

		dcSets.onChoose = function (date , $td){
			that._syncData() ;
			//[Event]
			if(typeof that.onChoose === 'function') that.onChoose(that.text , date , $td) ;
			that.close() ;
		} ;

		this.dateChooser = fy($('<div class="combo-dropDown dateField-combo"/>').appendTo("body")).dateChooser(dcSets);


		//call super constructor
		this._syncData();
		sets.target = this.dateChooser.jq ;
		if(sets.text===undefined) sets.text = this.text;

		//
		DateField.parent.call(this, jq, sets);

	};

	DateField.prototype = {
		_syncData : function(){
			this.selectedDate = this.dateChooser.selectedDate ;
			this.text = fy.formatDate(this.selectedDate , this.format);
			this.jq.val(this.text) ;
		} ,
		setSelectedDate : function(v){
			this.dateChooser.setSelectedDate(v) ;
			this._syncData() ;
			return this;
		} ,
		goto : function(y , m , d){
			this.dateChooser.goto(y , m , d) ;
			if(d) this._syncData() ;
			return this;
		} ,
		select : function(d){
			this.dateChooser.select(d);
			return this;
		}
	};

	fy.register("dateField", DateField, "ComboBase");

})(window, jQuery, fy);