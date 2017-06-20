fis.set('project.fileType.text', 'ts');

// 需要：完整协议+ url +‘/’ 结尾
// 如： http://54.223.126.249:8080/api/
var apiServer; //以 / 开头结尾

var isUnderLocal = false;
var orgCode = 'sys';

var currentMedia = fis.project.currentMedia();


var jScripts = null;


switch (currentMedia) {
	case 'prd': {
		apiServer = 'http://10.0.128.154:8081/api/';
		orgCode = 'bestv';
		break;
	}
	case 'test': {
		apiServer = 'http://10.0.128.154:8081/api/';
		orgCode = 'bestv';
		break;
	}
	case 'alpha' : {
		//apiServer = 'http://54.223.126.249:8080/api/';
		apiServer = 'http://10.0.135.90:8080/ams_api/';
		break;
	}
	default: { //dev
		//apiServer = 'http://54.223.126.249:8080/api/';
		apiServer = 'http://10.0.135.90:8080/ams_api/';
		jScripts = ['/lib/jquery.mockjax.js', '/js/mockData.js'];
		isUnderLocal = true;
	}
}

fis.match('{**.html,/js/config.js,/js/mockData.js}', {
	parser: fis.plugin('art-template', {
		native: true, //默认为false，即简单语法模式
		openTag: '<%', //默认为{{
		closeTag: '%>',//默认为}}
		compress: false,//默认为false
		define: {
			apiServer: apiServer,
			jScripts: jScripts,
			'page/': {
				mainModule: './index' ,
				'index.html': {
					orgCode: orgCode,
					currentMedia: currentMedia ,
					//jScripts : ['/lib/jquery.hover3d.js']
				},
				bodyType: ''
			}
		}
	})
});

fis.match('**/*.ts', {
	parser: fis.plugin('typescript', {
		sourceMap: isUnderLocal,
		strictNullChecks: true,
		module: 1,
		target: 1,
		//showNotices : true ,
		noImplicitAny: true
	}),
	//packTo: '/js/ts.js',
	rExt: '.js'
});


fis.match('{/@types/**.*,/comm/**.*}', {
	release: false
});


fis.match('{/mock/**}', {
	release: isUnderLocal
});

// 开启模块化
fis.hook('commonjs', {
	/*packages: [
		{
			name: 'opm',
			location: './ts/opm',
			main: 'Auto.ts'
		}
	] ,*/
	baseUrl: '.',
	extList: ['.ts']
});


// 设置成是模块化 js, 编译后会被 define 包裹。
fis.match('**/*.ts', {
	//wrap : false,
	//useSameNameRequire: true,// 开启同名依赖
	isMod: true
});


fis.match('::package', {
	postpackager: fis.plugin('loader'),
	useSourceMap: true // 合并后开启 SourceMap 功能。
});


//SCSS Compile
fis.match('*.scss', {
	parser: fis.plugin('node-sass', {
		outputStyle: 'compact',
		sourceMap: isUnderLocal
	}),
	rExt: '.css'
});


// 测试发布，进行合并
fis.media('test')
	.match('/ts/**.ts', {
		packTo: '/js/opg.js'
	})
	.match('**.{html:js,js,ts}', {
		optimizer: fis.plugin('uglify-js', {
			compress: {
				drop_console: true,
				drop_debugger: true
			}
		})
	})
	.match('*.{html:css,css,scss}', {
		useSprite: true,
		optimizer: fis.plugin('clean-css', {
			keepBreaks: true
		})
	});

// 产品发布，进行合并
fis.media('prd')
	.match('/ts/**.ts', {
		packTo: '/js/opg.js'
	})
	.match('**.{html:js,js,ts}', {
		optimizer: fis.plugin('uglify-js', {
			compress: {
				drop_console: true,
				drop_debugger: true
			}
		})
	})
	.match('*.{html:css,css,scss}', {
		useSprite: true,
		optimizer: fis.plugin('clean-css', {
			keepBreaks: true
		})
	});


// fis3 server start --root ../dist
// fis3 release dev -d ../dist
