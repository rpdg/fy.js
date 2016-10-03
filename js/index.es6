import store from '/es6/util/store';

if(store.get('x-token')){
	window.location.href = '/page/index.html' ;
}
else{
	store.set('x-token' , 'aaa') ;
}