//以下目录及文件不进入编译范围
fis.set('project.ignore', [
    'assets/css/reset.styl',
    'assets/css/font.styl',
    'fis-conf.js',
    '.DS_Store',
    'hi',
    // 'pages/**'
]);

let currVersion = getVersion();

fis.match('::package', {
    packager: fis.plugin('map', {
        useTrack : false
    }),
    postpackager: fis.plugin('loader')
});

fis.match('assets/js/libs/gm.js', {
    optimizer: fis.plugin('uglify-js'),
});

fis.match('assets/js/libs/gm.js', {
    packOrder: -80
});

// Libs JS打包为一个文件
fis.match('assets/js/libs/*.js', {
    packTo: 'base.js',
});

fis.match('assets/js/plugin/(*.js)', {
    // packTo: 'base.js',
    //输出至根目录
    release: '$1'
});


fis.match('assets/js/(*.js)', {
    // 添加es6 转换支持
    parser: fis.plugin('babel-latest'), 
    optimizer: fis.plugin('uglify-js'),
    //输出至根目录
    release: '$1'
});


fis.match('ui/**/(*.{js,swf,json,zip,txt,webp})', {
    //输出至根目录
    release: '$1'
});


//stylus文件编译
fis.match('app.styl', {
    parser: 'stylus',
    rExt: '.css',
    isCssLike : false,
    optimizer: fis.plugin('clean-css'),
    packTo: 'app.css'
});


//px 2 rem 转换
fis.match('page.styl', {
    parser: 'stylus',
    rExt: '.css',
    postprocessor: fis.plugin('px2rem',    {
        baseDpr: 2,             // base device pixel ratio (default: 2)
        remVersion: true,       // whether to generate rem version (default: true)
        remUnit: 100,            // rem unit value (default: 75)
        remPrecision: 6         // rem precision (default: 6)
    }),
    isCssLike : false,
    optimizer: fis.plugin('clean-css'),
    packTo: 'page.css',
});

fis.match('*.css', {
    isCssLike : false
});

// 图片文件目录
fis.match('assets/images/(*.{png,jpg,gif})', {
    //输出至根目录
    release: '$1'
});

// 获取日期版本号
function getVersion(){
    let checkTime = function(i) { if (i < 10) { i = "0" + i } return i }
    let _now = new Date();
    return "" + checkTime(_now.getDate()) + checkTime(_now.getHours()) + checkTime(_now.getMinutes()) + checkTime(_now.getSeconds());
}

//输出文件后缀名
const htmlExt = '.html';

//输出 test 目录
//fis3 release dev -d
//fis3 release dev -d -w 如在后面再加上-w 为实时检测变化

fis.media('dev').match('(*).html',{
    parser: function(files){
        return files.replace(/\?v=(\d+)('|")/g,"?v="+currVersion+"$2")
    },
    rExt: htmlExt,
    release : '../$1'
});

fis.media('dev').match('**', {
    deploy: [
        fis.plugin('replace', {
            from: /(\"src\/\"\+[a-zA-Z]+\[[a-zA-Z\_]\]\+\"\/\"\+)|(\"use strict\")|(\?v=\d+\))/g,
            to: function($0){
                // 使annie请求单文件时请求根目录路径，不带src/x/x路径
                if( /\"src\/\"\+[a-zA-Z]+\[[a-zA-Z\_]\]\+\"\/\"\+/.test($0) ){
                    return '';
                }
                //使转换后的es5转回正常模式
                if( /\"use strict\"/.test($0) ){
                    return '';
                }
                // 替换CSS中的版本号
                if( /\?v=\d+\)/g.test($0) ){
                    return '?v='+currVersion+')';
                }
            }
        }),
        fis.plugin('skip-packed'),
        fis.plugin('local-deliver', {
            to: '../release/test/ossweb-img/'
        })
    ]
});

//版本参数模式
const pro_cdnurl = './ossweb-img/';
const pro_mediaurl = './media/';

fis.media('pro').match('pages/(*).html',{
    parser: function(files,_a,_b){
        // 替换版本号
        var result = files.replace(/\?v=(\d+)('|")/g,"?v="+currVersion+"$2");

        // 替换CDN路径
        result = result.replace(/ossweb-img\//g, pro_cdnurl);
        result = result.replace(/\.\.\/media\//g, pro_mediaurl);

        console.info("")
        console.info("--------------------------------------------------")
        console.info("* 模板文件："+_a.id)
        console.info("* 输出文件："+_a.release)
        console.info("* 版本号："+ currVersion)
        console.info("* CDN路径："+ pro_cdnurl)
        console.info("--------------------------------------------------")

        return result
    },
    rExt: htmlExt,
    release : '../$1'
});

fis.media('pro').match('**', {
    prepackager : function (content, file, settings) {
        // 删除旧文件
        var exec = require('child_process').exec,child;
        child = exec('rm -rf ../release/pro',function(err,out) {
            console.log(out);
            err && console.log(err);
        });
        return true;
    },
    deploy: [
        fis.plugin('replace', {
            from: /(\"src\/\"\+[a-zA-Z]+\[[a-zA-Z\_]+\]\+\"\/\"\+)|(\"use strict\")/g,
            to: function($0){
                // 使annie请求单文件时请求根目录路径，不带src/x/x路径
                if( /\"src\/\"\+[a-zA-Z]+\[[a-zA-Z\_]\]\+\"\/\"\+/.test($0) ){
                    return '';
                }
                //使转换后的es5转回正常模式
                if( /\"use strict\"/.test($0) ){
                    return '';
                }
                // 替换CSS中的版本号
                if( /\?v=\d+\)/g.test($0) ){
                    return '?v='+currVersion+')';
                }
            }
        }),
        fis.plugin('skip-packed'),
        fis.plugin('local-deliver', {
            //输出路径
            to: '../release/pro/ossweb-img/'
        })
    ]
});

//版本文件夹模式
const prod_cdnurl = 'https://ts.a.proo.vip/lol/act200101/ossweb-img/';
const prod_mediaurl = 'https://ts.a.proo.vip/lol/act200101/media/';

fis.media('prod').match('pages/(*).html',{
    parser: function(files,_a,_b){
        // 替换版本号
        var result = files.replace(/\?v=(\d+)('|")/g,"?v="+currVersion+"$2");

        // 替换CDN路径
        result = result.replace(/ossweb-img\//g, prod_cdnurl+currVersion+"/");
        result = result.replace(/\.\.\/media\//g, prod_mediaurl);

        console.info("")
        console.info("--------------------------------------------------")
        console.info("* 模板文件："+_a.id)
        console.info("* 输出文件："+_a.release)
        console.info("* 版本号："+ currVersion)
        console.info("* CDN路径："+ prod_cdnurl)
        console.info("--------------------------------------------------")

        return result
    },
    rExt: htmlExt,
    release : '../../$1'
});
fis.media('prod').match('**', {
    prepackager : function (content, file, settings) {
        // 删除旧文件
        var exec = require('child_process').exec,child;
        child = exec('rm -rf ../release/prod',function(err,out) {
            console.log(out);
            err && console.log(err);
        });
        return true;
    },
    deploy: [
        fis.plugin('replace', {
            from: /(\"src\/\"\+[a-zA-Z]+\[[a-zA-Z\_]+\]\+\"\/\"\+)|(\"use strict\")/g,
            to: function($0){
                // 使annie请求单文件时请求根目录路径，不带src/x/x路径
                if( /\"src\/\"\+[a-zA-Z]+\[[a-zA-Z\_]\]\+\"\/\"\+/.test($0) ){
                    return '';
                }
                //使转换后的es5转回正常模式
                if( /\"use strict\"/.test($0) ){
                    return '';
                }
                // 替换CSS中的版本号
                if( /\?v=\d+\)/g.test($0) ){
                    return '?v='+currVersion+')';
                }
            }
        }),
        fis.plugin('skip-packed'),
        fis.plugin('local-deliver', {
            //输出路径
            to: '../release/prod/ossweb-img/'+currVersion
        })
    ]
});


//自动去除console.log等调试信息
fis.config.set('settings.optimizer.uglify-js', {
    compress : {
        // drop_console: true
    }
});

console.log("本次版本号为： "+ currVersion);
