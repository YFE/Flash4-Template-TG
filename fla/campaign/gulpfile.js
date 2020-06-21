/**
 * Created by anlun on 16/7/16.
 */
//////////////////////////////
var typescript = require('gulp-tsc');
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var del = require('del');
var replace = require('gulp-replace');
var runSequence = require('gulp-sequence');
var gulpPngquant = require('gulp-pngquant');
var source = require('vinyl-source-stream');
var vinylBuffer = require('vinyl-buffer');
var babel = require('gulp-babel');
var isAll=true;
/**
 * 获取子目录列表
 * @param dir 要获取子目录的父目录
 * @returns {Array} 一个子目录名的字符串数组
 */
var getFolders = function (dir) {
    return fs.readdirSync(dir).filter(function (file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
    });
};
/**
 * 获取目录下所有文件列表
 * @param dir
 */
var getFiles = function (dir) {
    return fs.readdirSync(dir).filter(function (file) {
        return fs.statSync(path.join(dir, file)).isFile();
    });
};
//项目信息
var projectInfo = require('./package.json');
gulp.task("compileTS", function () {
    if (projectInfo.language == "typeScript") {
        var rootFiles = getFolders("./");
        var isHadTsConfig = false;
        for (var i = 0; i < rootFiles.length; i++) {
            if (rootFiles[i] == "tsconfig.json") {
                isHadTsConfig = true;
                break;
            }
        }
        //编译ts
        return gulp.src(['tsSrc/**/*.ts']).pipe(typescript({target: 'es5', module: 'commonjs'})).pipe(gulp.dest('src'));
    }
});
var time = Date.now();
var sceneList = getFolders("src/");
gulp.task("clean",function () {
    return del("../../source/ui",{
        force : true
    });
});
gulp.task("prepare", ["clean"], function () {
    if (projectInfo.type == "canvas"){
        //AnnieJS引擎
        //html页面更改
        // gulp.src('index.html').pipe(replace("Main.js", "f2xMain.min.js?v=" + time)).pipe(gulp.dest("released"));
        //压缩main.js
        // gulp.src("src/Main.js").pipe(babel({
        //     presets: ['@babel/env']
        // })).pipe(uglify()).pipe(rename("f2xMain.min.js")).pipe(gulp.dest("released/src"));
        //压缩各个scene
        for (var i = 0; i < sceneList.length; i++) {
            //获取
            var sceneInfo = require("./resource/" + sceneList[i] + "/" + sceneList[i] + ".res.json");
            var jsList = [];
            var resList = [];
            var otherList = [];
            for (var j = sceneInfo.length - 1; j >= 0; j--) {
                if (sceneInfo[j].type == "image") {
                    if (sceneInfo[j].src.toLowerCase().indexOf(".png") > 0) {
                        resList.push(sceneInfo[j].src);
                    } else {
                        otherList.push(sceneInfo[j].src);
                    }
                } else if (sceneInfo[j].type == "javascript") {
                    jsList.push(sceneInfo[j].src);
                    sceneInfo.splice(j, 1);
                } else {
                    otherList.push(sceneInfo[j].src);
                }
            }
            //合并压缩js
            gulp.src(jsList).pipe(babel({
                presets: ['@babel/env']
            })).pipe(uglify()).pipe(concat(sceneList[i] + projectInfo.suffixName)).pipe(gulp.dest("../../source/ui/src/" + sceneList[i]));
            //复制其他资源
            gulp.src(otherList).pipe(gulp.dest("../../source/ui/resource/" + sceneList[i]));
            //重写res.json文件
            sceneInfo.unshift({type: "javascript", src: "src/" + sceneList[i] + "/" + sceneList[i] + projectInfo.suffixName});
            var stream = source(sceneList[i] + ".res.json");
            // 将文件的内容写入 stream
            stream.write(JSON.stringify(sceneInfo, null, ""));
            stream.pipe(vinylBuffer()).pipe(gulp.dest("../../source/ui/resource/" + sceneList[i]));
            stream.end();
            //fs.writeFile("./../../source/ui/resource/" + sceneList[i] + "/" + sceneList[i] + ".res.json", JSON.stringify(sceneInfo, null, ""),function (err) {});
            //压缩资源
            gulp.src(resList).pipe(gulpPngquant()).pipe(gulp.dest("../../source/ui/resource/" + sceneList[i]));
        }
        //复制其他资源
        if(isAll) {
            //复制libs库
            // gulp.src("libs/*.js").pipe(gulp.dest("released/libs"));
            var resList = getFolders("resource");
            //过滤
            for (var i = resList.length - 1; i >= 0; i--) {
                for (var j = 0; j < sceneList.length; j++) {
                    if (resList[i] == sceneList[j]) {
                        resList.splice(i, 1);
                        break;
                    }
                }
            }
            for (var i = 0; i < resList.length; i++) {
                gulp.src("resource/" + resList[i] + "/**/*").pipe(gulp.dest("../../source/ui/resource/" + resList[i]));
            }
            var otherFileList = getFiles("resource");
            for (var i = 0; i < otherFileList.length; i++) {
                gulp.src("resource/" + otherFileList[i]).pipe(gulp.dest("../../source/ui/resource"));
            }
        }
    }
});
var sceneIndex=0;
var resourceIndex=0;
var resourceItem=null;
var resourceJSON=null;
var writeFile=null;
var fileSizeArr={};
function initMergeFile(){
    if(sceneIndex<sceneList.length) {
        resourceIndex=0;
        resourceItem = sceneList[sceneIndex];
        console.log("开始打包:"+resourceItem);
        resourceJSON = require("../../source/ui/resource/" + resourceItem + "/" + resourceItem + ".res.json");
        var jsURL="../../source/ui/src/" + resourceItem + "/" + resourceItem + projectInfo.suffixName;
        var jsSize=fs.statSync(jsURL).size;
        var jsCon=fs.readFileSync(jsURL);
        resourceJSON[resourceIndex].src=jsSize;
        writeFile = fs.createWriteStream(jsURL);
        writeFile.write(jsCon);
        resourceIndex++;
        mergeFile();
    }else{
        fs.writeFile('../../source/assets/js/libs/swfsize.js','window.swfBytes="#swfBytes#";','utf8',function(error){
            if(error){
                console.log(error);
                return false;
            }
            gulp.src('../../source/assets/js/libs/swfsize.js').pipe(replace("\"#swfBytes#\"", JSON.stringify(fileSizeArr))).pipe(gulp.dest("../../source/assets/js/libs/"));
            // //是否需要更改后缀
            // if(projectInfo.suffixName!=".swf"){
            //     gulp.src('../../released/**/base.js').pipe(replace("\".swf\"", "\""+projectInfo.suffixName+"\"")).pipe(gulp.dest("../../source/ui/"));
            // }
        })
        console.log("打包结束!");
    }
}
function mergeFile() {
    var url = resourceJSON[resourceIndex].src;
    var index = url.indexOf("?");
    if (index > 0) {
        url = url.substr(0, index);
    }
    url="../../source/ui/" + url;
    resourceJSON[resourceIndex].src=fs.statSync(url).size;
    var rs=fs.createReadStream(url);
    rs.on("data",function(funk){
        writeFile.write(funk);
    });
    rs.on("end",function(){
        if(resourceIndex==resourceJSON.length-1){
            //保存resource
            fs.writeFileSync("../../source/ui/resource/" + resourceItem + "/" + resourceItem + ".res.json",JSON.stringify(resourceJSON));
            var size=fs.statSync("../../source/ui/resource/" + resourceItem + "/" + resourceItem + ".res.json").size.toString();
            var len=size.length.toString();
            writeFile.write(JSON.stringify(resourceJSON));
            writeFile.write(size);
            writeFile.write(len);
            writeFile.end();
            //删除不需要的资源文件夹
            del("../../source/ui/resource/" + resourceItem,{
                force : true
            });
            //获取swf大小
            fileSizeArr[resourceItem] = fs.statSync("../../source/ui/src/" + resourceItem + "/" + resourceItem + projectInfo.suffixName).size;
            sceneIndex++;
            console.log("完成打包:"+resourceItem);
            initMergeFile();
        }else{
            resourceIndex++;
            mergeFile();
        }
    });
}
gulp.task("packToOne", function () {
    if(process.argv.length==5&&process.argv[3]=="-s"){
        isAll=false;
        sceneList=process.argv[4].split(",");
    }
    if (projectInfo.type == "canvas") {
        //合并首页
        // var releaseInfo = "annie._isReleased=" + time + ";" + fs.readFileSync("./released/src/f2xMain.min.js");
        // fs.writeFileSync("./released/src/f2xMain.min.js", releaseInfo);
        // //是否需要更改后缀
        // if(projectInfo.suffixName!=".swf"){
        //     gulp.src('./released/libs/annieCore*').pipe(replace("\".swf\"", "\""+projectInfo.suffixName+"\"")).pipe(gulp.dest("./released/libs"));
        // }
        initMergeFile();
    }
});
gulp.task("default", runSequence("compileTS", "prepare"));
gulp.task("build", ["default"]);
gulp.task("released", ["packToOne"]);