fis.set('project.fileType.text', 'es6');


var currentMedia = fis.project.currentMedia();
var apiServer; //以 / 开头结尾

switch (currentMedia) {
	case 'prd': {
		apiServer = 'http://localhost/data/';
		break;
	}
	case 'test': {
		apiServer = 'http://localhost/data/';
		break;
	}
	default: {
		apiServer = 'http://localhost/data/';
	}
}

fis.match('{**.html,/js/config.js}', {
	parser: fis.plugin('art-template', {
		native: true, //默认为false，即简单语法模式
		openTag: '<%', //默认为{{
		closeTag: '%>',//默认为}}
		compress: false,//默认为false
		define: {
			apiServer: apiServer,
			'page/': {
				'test/':{
					'pop/' :{
						bodyType: 'pop'
					}
				}
			},
			'comm/': {
				release: false
			}
		}
	})

});


fis.match('{*.es6,*:babel}', {
	parser: fis.plugin('babel-5.x', {
		sourceMap: true
	}),
	rExt: 'js'
})/*.match('{/es6/**.es6,/js/config.js}', {
 packTo: '/es6.js'
 }) */;


// 开启模块化开发
fis.hook('commonjs', {
	baseUrl: '.',
	paths: {
		$: 'lib/jquery-3.1.1',
		cfg: 'js/config'
	}

});

fis.match('{*.es6,lib/jquery-3.1.1.js,js/config.js}', {
	isMod: true
});


fis.match('::package', {
	postpackager: fis.plugin('loader'),
	useSourceMap: true // 合并后开启 SourceMap 功能。
});


fis.match('*.scss', {
	parser: fis.plugin('node-sass', {
		outputStyle: 'compact',
		sourceMap: true
	}),
	rExt: '.css'
});

/*fis.match('*.{html:css,css,scss}', {
 postprocessor : fis.plugin('autoprefixer', {
 "browsers": ['Firefox >= 40', 'Safari >= 6', 'Explorer >= 10', 'Chrome >= 50', "last 2 versions"],
 "cascade": true,
 "flexboxfixer": true,
 "gradientfixer": true
 })
 });*/






// 产品发布，进行合并
fis.media('prd').match('{/es6/**.es6,/js/config.js}', {
	packTo: '/js/es6.js'
}).match('*.{html:js,js,es6}', {
	optimizer: fis.plugin('uglify-js', {
		compress: {
			drop_console: true,
			drop_debugger: true
		}
	})
}).match('*.{html:css,css,scss}', {
	useSprite: true,
	optimizer: fis.plugin('clean-css', {
		keepBreaks: true
	})
});


// cache query
var queryPlaceholder = '?v=';
fis.match('*', {
	query: queryPlaceholder //占位符
}).match('::package', {
	postpackager: [
		fis.plugin('query', {
			placeholder: queryPlaceholder // 这里传入占位符
		}),
		fis.plugin('loader'/*, {
		 allInOne: {
		 js: function (file) {
		 return "/js/" + file.filename + "_aio.js";
		 }
		 }
		 }*/)
	]
});


// fis3 server start --root ../dist
// fis3 release dev -d ../dist --no-color
