## 版本更新
### 2020-06-21 
    1. 更新 annie 至3.2.1
    2. 添加 gm.videoPlayer.js 
    3. CSS 添加 img 禁止默认菜单设置

## 目录结构
- /docs/ `文档`
- /fla/ `放置flash源文件`
    - /campaign/ `界面源目录`
- /source/ `源文件目录`
    - /assetes/ `基础库及逻辑文件目录`
    - /ui/ `界面打包后输出目录`
    - /pages/ `页面文件`
- /release/ `打包输出目录`

## 开发流程
### 界面输出
``` sh
cd fla/campaign
gulp build
# 输出界面文件至 source/ui 目录
gulp released
```

### 文件打包
```sh
cd source
# 调试 - 调试目录 输出至 release/test 目录
fis3 release dev -d -w
# 生产 - 分离前目录 输出至 release/pro 目录
fis3 release pro -d 
# 生产 - 分离后目录 输出至 release/prod 目录
fis3 release prod -d

# 简化命令
# 调试
sh hi dev
# 重新输出界面并输出调试
sh hi dev fla
# 生产
sh hi pro 
# 重新输出界面并输出生产
sh hi pro fla
```