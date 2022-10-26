---
title: 我是如何给我的博客加上图片压缩的
description:
date: 2022-10-26 21:00:00
---

[[toc]]

# 我是如何给我的博客加上图片压缩的
 
由于我博客的图片大多是我通过mac截图截取的，往往图片尺寸都有点大，这样容易产生多余的流量，也会导致加载图片所需时间过长，存在一定的性能问题。所以我需要对项目中的图片进行压缩。当然我个人不是很喜欢在开发时进行压缩，所以我更希望是在提交代码的时候压缩，在这一刻我是愿意等的。</br>

由于是在提交代码时进行，所以我们肯定需要用到`husky`。图片压缩的话我选择了`tinify`[(https://tinypng.com/)](https://tinypng.com/)，因为他支持node，并且他支持的图片格式是满足我的需求的(目前我的博客还没有GIF)，同时它每月可以免费压缩500张图片，并且github上存在大量的key...

## Step 1 - 安装需要的库
>  我的博客是我自己简单写了一个压缩的脚本。 
>  你完全可以使用[easy-tinypng-cli](https://github.com/sudongyuer/easy-tinypng-cli),它提供更多的功能。


首先我们先安装一下我们所需要用到的库
```js
pnpm install ora tinify fast-glob husky -S
```

- ora 用于压缩图片console加上loading效果
- tinify 用于压缩图片
- fast-glob 用于读取文件
- husky 用于在pre-commit压缩图片

## Step 2 - 完成压缩脚本
### 添加对应文件和命令
我们现在跟目录新建一个`scripts`文件夹，在里面新建一个`tiny.js`,然后我们加上这样的代码
```js
#!/usr/bin/env node
console.log("go")
```
然后在package.json里的scripts添加
```json
"scripts": {
  "tiny": "node ./scripts/tiny.js"
},
```
接下来我们可以pnpm tiny看看能否打印出`go`。</br>
因为脚本我使用的是esm规范，在node中跑的话我们还需要额外加点配置，所以我们还需要在package.json里加上
```json
{
  "type": "module"
}
```
当然你也可以把文件后缀改成`ejs`。</br>
一切可行的时候，我们接下来进行正式的开发。

### 功能分析

由于tinify没法记录那些图片是压缩过的，所以我们需要加一个cache的功能，我会在根目录新建一个`tiny.cache.json`,其中key是图片的相对路径(相对路径可以防止电脑变了导致路径不一致，也可以区别不同文件里有相同名称的图片)。value其实可以设置成一个对象，用来记录压缩前后的size和压缩比，当然我并不需要这些数据，所以我就直接value为true了。</br>

另外由于我的博客是开源的，我并不想暴露我的key，所以我必须单独写一个`tiny.key.json`来记录key值，然后在.gitignore里过滤这个文件，其格式如下
```js
{
  "key": "your key"
}
```
那我们大致的流程可以分为如下步骤
- 读取`tiny.key.json`中的key
- 获取`tiny.cache.json`中的缓存数据
- 读取对应目录下的图片文件
- 遍历图片文件
- 判断是否有cache，有则跳过，没则压缩并记录到cache中
- 更新cache文件
- 退出进程

我们先引入我们需要用到的库
```js
#!/usr/bin/env node
import path from 'path'
import fg from 'fast-glob';
import fs from 'fs/promises' // fs内的函数都变成promise据说并发时会比sync更佳
import ora from 'ora'
import tinify from 'tinify'
import { cwd } from 'node:process'
```
然后定义一下我们后面会用到的常量
```js 
// cache对应的文件
const RECORD_FILE = 'tiny.cache.json'
// 需要压缩这个文件里的图片
const ENTRY_FILE = 'public'
// tinify.key存放的地方
const KEY_FILE = 'tiny.key.json'
// 存放缓存的地方
ley cache = {}
```
接下来我们再写一个init函数，然后执行下，这时候我们完整代码如下
```js 
#!/usr/bin/env node
import path from 'path'
import fg from 'fast-glob';
import fs from 'fs/promises'
import ora from 'ora'
import tinify from 'tinify'
import { cwd } from 'node:process'

const RECORD_FILE = 'tiny.cache.json'
const ENTRY_FILE = 'public'
const KEY_FILE = 'tiny.key.json'
let cache = {}

async function init() {
  
}

await init()
```
然后我们先读取`tiny.key.json`中的key

```js
async function init() {
    const key = await readFile(KEY_FILE)
    // 把key设置给tinify
    tinify.key = key.key
}
async function readFile(p) {
  // 不是绝对路径的话 拼成绝对路径
    if (!path.isAbsolute(p)) {
        p = path.join(cwd(), p)
    }
    const fileData = await fs.readFile(p, 'utf-8')
    // 里面的值 没有null等情况 所以就用JSON.parse处理了
    return JSON.parse(fileData)
}
```
然后我们再获取`tiny.cache.json`中的缓存数据
```js
async function init() {
    const key = await readFile(KEY_FILE)
    tinify.key = key.key
    // 获取缓存数据
    cache = await loadCache()
}

// ... 其他函数先省略了

async function loadCache() {
  // 第一次使用是没有tiny.cache.json的,所以需要判断下是否有这个文件
    const haveCacheFIle = await isFile(RECORD_FILE)
    if (haveCacheFIle) {
        const result = await readFile(RECORD_FILE);
        return result;
    } else {
        return {}
    }
}
async function isFile(p) {
    if (!path.isAbsolute(p)) {
        p = path.join(cwd(), p)
    }
    // catch(() => false)是因为没有文件会报错
    // 如果没文件 这时候promise返回的就是false
    // result = false
    let result = await fs.stat(p).catch(() => false)
    return result && result.isFile()
}
 
```
然后我们再读取对应目录下的图片文件
```js
async function init() {
    const key = await readFile(KEY_FILE)
    tinify.key = key.key
    cache = await loadCache()
    let file = await getFile(ENTRY_FILE);
}

// ... 其他函数先省略了

async function getFile(path) {
   // 判断下路径是不是/开始
    path = path.endsWith('/') ? path : path + '/'
    // ** 这里的意思是是读对应文件中无限深度的内容
    // * 是读任意名称的文件
    // {png,jpg,jpeg} 是读这三个后缀的文件，因为tinify只支持这三个类型的文件
    // 完整的意思就是 读对应文件夹无限深度的任意名称，{png,jpg,jpeg}后缀的文件
    path += '**/*.{png,jpg,jpeg}'
    return await fg(path)
}
```

接下来我们再编辑文件，然后是否有cache，是否需要压缩
```js
async function init() {
    const key = await readFile(KEY_FILE)
    tinify.key = key.key
    cache = await loadCache()
    let file = await getFile(ENTRY_FILE);
    // 因为用了await 没办法用forEach Map 所以这里用for of
    for (let f of file) {
        await handleImage(f)
    }
}

// ... 其他函数先省略了

async function handleImage(p) {
    // 如果相对路径cache中有值 则直接返回
    if (cache[p]) return;
    // 开启一个黄色的console loading状态
    const spinner = ora({ text: `loading ${p}`, color: "yellow" }).start()
    // 拼成绝对路径
    const absolutePath = path.join(cwd(), p)
    // 进行图片压缩
    let source = tinify.fromFile(absolutePath)
    await source.toFile(absolutePath)
    // 添加到cache中
    cache[p] = true
    // 将console改成完成状态
    spinner.succeed()
}
```

然后我们就可以保存cache值，结束进程了

```js
async function init() {
    const key = await readFile(KEY_FILE)
    tinify.key = key.key
    cache = await loadCache()
    let file = await getFile(ENTRY_FILE);
    for (let f of file) {
        await handleImage(f)
    }
    await saveCache()
    process.exit(0)
}
// ... 其他函数先省略了
async function saveCache() {
    await fs.writeFile(RECORD_FILE, JSON.stringify(cache, null, 2))
    // 打印个内容 表示执行完了
    console.log("good dog!")
}
```
完整代码如下
```js
#!/usr/bin/env node
import path from 'path'
import fg from 'fast-glob';
import fs from 'fs/promises'
import ora from 'ora'
import tinify from 'tinify'
import { cwd } from 'node:process'

const RECORD_FILE = 'tiny.cache.json'
const ENTRY_FILE = 'public'
const KEY_FILE = 'tiny.key.json'
let cache = {}

async function init() {
    const key = await readFile(KEY_FILE)
    tinify.key = key.key
    cache = await loadCache()
    let file = await getFile(ENTRY_FILE);
    for (let f of file) {
        await handleImage(f)
    }
    await saveCache()
    process.exit(0)
}

async function loadCache() {
    const haveCacheFIle = await isFile(RECORD_FILE)
    if (haveCacheFIle) {
        const result = await readFile(RECORD_FILE);
        return result;
    } else {
        return {}
    }
}
async function isFile(p) {
    if (!path.isAbsolute(p)) {
        p = path.join(cwd(), p)
    }
    let result = await fs.stat(p).catch(() => false)
    return result && result.isFile()
}
async function handleImage(p) {
    if (cache[p]) return;
    const spinner = ora({ text: `loading ${p}`, color: "yellow" }).start()
    const absolutePath = path.join(cwd(), p)
    let source = tinify.fromFile(absolutePath)
    await source.toFile(absolutePath)
    cache[p] = true
    spinner.succeed()
}

async function getFile(path) {
    path = path.endsWith('/') ? path : path + '/'
    path += '**/*.{png,jpg,jpeg}'
    return await fg(path)
}

async function readFile(p) {
    if (!path.isAbsolute(p)) {
        p = path.join(cwd(), p)
    }
    const fileData = await fs.readFile(p, 'utf-8')
    return JSON.parse(fileData)
}
async function saveCache() {
    await fs.writeFile(RECORD_FILE, JSON.stringify(cache, null, 2))
    console.log("good dog!")
}

await init()
```
## Step 3 - 配置husky
前面我们已经安装了`husky`,接下来我们配置下`husky`。
现在package.json里添加
```js
{
  "scripts": {
      "prepare": "husky install"
  }
}
```
然后再执行下`prepare`
```js
pnpm prepare
```
然后我们再添加pre-commit
```js
// 这里tiny指你前面在scripts里添加的脚本key
// && git add . 代表前面压缩完后再执行git add .
npx husky add .husky/pre-commit "pnpm tiny && git add ."
```
然后我们就可以提交代码，在commit后就会发现在执行压缩图片的脚本了
<img  src='/tiny/commit.jpg'/>
从结果可以看出整个图片体积压缩50%左右
<img  src='/tiny/compare.png'/>