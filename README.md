## fy.js ##

fyUi components 


1 . 安装 **nodejs** （版本大等于 0.12），我机器装的是**v6.60**

2 . 如果不能翻墙，需要执行以下命令，后面的插件将从国内淘宝镜像下载：

	npm config set registry https://registry.npm.taobao.org

3 .  安装相关插件，请依次执行：

	npm install -g fis3
	
	npm install -g fis3-hook-commonjs
	npm install -g fis3-hook-relative
	npm install -g fis-parser-art-template
	npm install -g fis-parser-node-sass
	*npm install -g fis-parser-babel-5.x <-- 这个不要，已改为typescript*
	npm install -g fis3-parser-typescript
	npm install -g fis3-postpackager-query
	npm install -g fis3-postpackager-loader

4 . 打包命令：

	fis3 release dev -d ../dist
其中参数 dev 对应的是开发环境，测试环境为 test，生产环境 prd
其中参数 ../dist 为生成目标文件的文件夹
