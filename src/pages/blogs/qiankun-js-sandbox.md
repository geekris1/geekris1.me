---
title: 关于微前端(qiankun)中js沙盒实现
description:
date: 2023-03-16 15:18:00
---

[[toc]]
 

# 关于微前端(qiankun)中js沙盒实现

所谓的微前端，其实是通过监听路由的变化去请求对应应用的资源，然后跑在一个容器里。由于一个页面可能同时有一个主应用和一个及多个微应用，它们可能会有相同的样式，或者都对window上同一属性进行了修改，这时候就需要对css,js做一些隔离。在qiankun中对js做隔离一共有三种模式`SnapshotSandbox`和`LegacySandbox`以及`ProxySandbox`，下面我们将简单介绍每种模式的实现和优缺点。

## SnapshotSandbox
SnapshotSandbox主要是为了兼容不支持Proxy的浏览器，同时它只支持加载单个微应用。它的实现主要是在`active`里遍历window，通过for in遍历，把每个prop和值存到windowSnapshot的对象里，同时存在modifyPropMap的对象存放着上次修改的值，在这一步在遍历modifyPropMap把window对应的值进行修改。最后在`inactive`里在遍历window和windowSnapshot里做一个比较，如果值变了这要把这个值记录到modifyPropMap里，并且把window值进行还原。


```js
class SnapshotSandbox {
  windowSnapshot = {}
  modifyPropMap = {}
  active() {
    // 把window立的值放到windowSnapshot里
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop]
    }
    // 恢复上一次对window的修改
    Object.keys(this.modifyPropMap).forEach(prop => {
      window[prop] = this.modifyPropMap[prop]
    })
  }
  inactive() {
    // 再次遍历window 和 windowSnapshot里的值做比较 看下那些值变了
    // 如果变了则存到modifyPropMap里 并将window还原
    for (const prop in window) {
      if (window[prop] !== this.windowSnapshot[prop]) {
        this.modifyPropMap[prop] = window[prop]
        window[prop] = this.windowSnapshot[prop]
      }
    }
  }
}
```
接下来我们写一个简单的demo来测试一下
```js
let snapshot = new SnapshotSandbox()
window.city = 'beijing';
console.log(window.city) // beijing
snapshot.active()
window.city = 'wuhan'  
console.log(window.city) // wuhan
snapshot.inactive()
console.log(window.city) // beijing
snapshot.active()
console.log(window.city) // wuhan
```
这种写法的缺点是非常明显的，每次对window做snapshot会有一些性能上的开销，而且都是浅拷贝的比较，对于引用类型还是有修改的可能性，并且只支持单个微应用，其唯一的优点也就是对低版本浏览器的兼容性了。
## LegacySandbox
LegacySandbox是使用proxy代理了一个fakeWindow，并同了以下几个值来记录数据新增或修改
- addedPropsMapInSandbox 记录在沙盒期间新增的全局变量
- modifiedPropsOriginalValueMapInSandbox 记录沙盒期间更新的全局变量
- currentUpdatedPropsValueMap 持续记录更新的(新增和修改的)全局变量的
这一步的实现如下
```js
function setWindowProp(prop, value, isToDelete) {
  if (value === undefined && isToDelete) {
    delete window[prop]
  } else {
    window[prop] = value
  }
}
class LegacySandbox {
  proxyWindow = new Map()
  currentUpdatedPropsValueMap = new Map()
  modifiedPropsOriginalValueMapInSandbox = new Map()
  addedPropsMapInSandbox = new Map()
  constructor() {
    // 创建一个空对象 没有prototype(原型链)
    const fakeWindow = Object.create(null)
    // set里this指向不是事例 所以这里结构一下
    const { modifiedPropsOriginalValueMapInSandbox, currentUpdatedPropsValueMap, addedPropsMapInSandbox } = this
    // 代理前面的空对象
    this.proxyWindow = new Proxy(fakeWindow, {
      get(target, prop, receiver) {
        return window[prop]
      },
      set(target, prop, value, receiver) {
        // 记录当前window的值
        const originalValue = window[prop]
        // window上没有prop就是新增 否则就是修改
        if (!window.hasOwnProperty(prop)) {
          addedPropsMapInSandbox.set(prop, value)
        // 首次修改需要保存值 后续再修改则不需要了
        } else if (!modifiedPropsOriginalValueMapInSandbox.has(prop)) {
          modifiedPropsOriginalValueMapInSandbox.set(prop, originalValue)
        }
        // 记录值的新增/修改
        currentUpdatedPropsValueMap.set(prop, value)
        // 修改window上的值
        setWindowProp(prop, value)
      },
    })
  }
}
```
接下来就是`active`和`inactive`
```js
active() {
  // 还原至上次修改
  this.currentUpdatedPropsValueMap.forEach((value, prop) => {
    setWindowProp(prop, value)
  })
}
inactive() {
  // 还原window
  this.modifiedPropsOriginalValueMapInSandbox.forEach((value, prop) => {
    setWindowProp(prop, value)
  })
  // 删除新增的值
  this.addedPropsMapInSandbox.forEach((value, prop) => {
    setWindowProp(prop, undefined, true)
  })
}
```
同样我们可以写一个demo来测试一下
```js
let legacySandbox = new LegacySandbox()
window.city = 'beijing';
console.log(window.city) // beijing
legacySandbox.active()
// 这里需要修改代理的window proxyWindow
legacySandbox.proxyWindow.city = 'wuhan'
console.log(window.city) // wuhan
legacySandbox.inactive()
console.log(window.city) // beijing
legacySandbox.active()
console.log(window.city) // wuhan
```
虽然legacySandbox解决了循环window属性带来的性能问题，但也只能加载单个微应用
## ProxySandbox
上面两个sandbox都只能加载单个微应用，其原因就在于他们都直接修改了window下的值。如果要实现加载多个微应用很容易想到的就是不直接修改window，而是新建一个对象把新增/修改的值都挂在上面，获取值也优先从这个对象里获取，如果没有再从window里获取。由于我们是了解其实现思路，而不是一比一的实现，所以下面将简单实现一版。
```js
class ProxySandbox {
  // 存放更新或者新增了哪些prop
  updatedValueSet = new Set()
  proxyWindow
  // 是否是激活状态
  sandboxRunning = true
  constructor() {
    const fakeWindow = Object.create(null)
    this.proxyWindow = new Proxy(fakeWindow, {
      set: (target, prop, value, receiver) => {
      if (this.sandboxRunning) {
        // 添加prop
        this.updatedValueSet.add(prop)
        // 将值挂到target上 而不是 window了
        target[prop] = value
      }
      },
      get: (target, prop, receiver) => {
        if (this.sandboxRunning) {
          // 如果prop是新增或者修改的 就从target上取
          // 否则就从window上获取
          return this.updatedValueSet.has(prop) ? target[prop] : window[prop]
        }
      },
    })
  }
  active() {
    // 激活
    this.sandboxRunning = true
  }
  inactive() {
    // 失活
    this.sandboxRunning = false
  }
}
```
接下来我们也简单写个demo测试一下
```js
let proxySandbox1 = new ProxySandbox()
let proxySandbox2 = new ProxySandbox()
window.city = 'beijing'
proxySandbox1.active()
proxySandbox2.active()
proxySandbox1.proxyWindow.city = 'wuhan'
proxySandbox2.proxyWindow.city = 'guangzhou'
console.log(window.city) // beijing
console.log(proxySandbox1.proxyWindow.city) // wuhan
console.log(proxySandbox2.proxyWindow.city) // guangzhou
```

## with的使用
在上面的例子，我们都是使用proxySandbox.proxyWindow.xxx 这样的写法，实际上我们使用的时候是写的window.xxx，那这是如何实现的呢？其中用到了一个叫做import-html-entry的包，他在处理js资源是会将其通过自执行函数和with包一层，创造一个独立的作用域链和命令空间，具体实现如下。
```js
let proxy = new ProxySandbox()
window.city = 'wuhan'
window.proxy = proxy
  ; (function (window) {
    with (window) {
      window.city = 'beijing'
      console.log(window.city) // beijing
    }
  })(window.proxy)
console.log(window.city) // wuhan
```
这样就做到了js沙箱环境。