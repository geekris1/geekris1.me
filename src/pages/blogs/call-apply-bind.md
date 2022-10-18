---
title: call,apply,bind的实现
description:
date: 2022-10-18 11:00:00
---

[[toc]]

# call,apply,bind的实现

## 如何修改this指向
由于本文不是关于this的，在这段里，我们只是讲一下后面call会用到的一个概念。在网上关于this指向流传着一句话`谁调用就指向谁`，这句话虽然不是特别准确，比如`(a,a.b)()`，这里面a.b函数执行，函数内this在非严格模式下指向的就是window，但是在真正开发中这句话也是非常适用的。接下来我们就依据这句话讲下怎么修改函数this。
```js
 let ojb = {
  name:"thez",
  getName(){
    console.log(this.name)
  }
 }
 ojb.getName() // thez
```
上面这代代码，大家很容易就能想到结果。但是如果我们把getName函数提出来会如何呢
```js
 let ojb = {
  name:"thez",
  getName:getName
 }
 function getName(){
   console.log(this.name)
 }
 ojb.getName()   // thez
```
所以我们很明显的就能得出，this指向跟函数在哪定义的没有关系，而是跟执行主体有关系。

## call函数的实现
通过上面的例子，我们大致就能想象出call函数是如何实现的了。
- 先将传递的第一个参数转化成object
- 在将这个函数当作这个object的一个属性
- 在调用这个函数，并把其他参数传入给这个函数
- 最后删除object上的这个属性

```js
Function.prototype.call1 = function(context){
  // 可能会传比如 number string 
  // 所以需要转换成object
  const _KEY=  Symbol.for('CALL1_KEY')
  let args= []
  for(let i =1;i<arguments.length;i++){
    args.push(arguments[i])
  }
  context =Object(context)
  context[_KEY] = this;
  return eval('context[_KEY](' + args + ')')
}
```
上面一个call函数就实现完了。用eval主要是为了将arguments展开。也可以用换成展开运算符`context[_KEY](...args)`。
下来我们就用一个函数来测试下 
```js
function add() {
  console.log(this)
}

add.call1(1) // [Number: 1]
```

其实这段代码还是有点问题的，比如我们这样调用`add.call(null)`,用原生方法的话,在严格模式下会指向`undefined`,非严格模式会指向`window`。那我们就把上面的代码修改一下。</br>
这里额外将一下，如何判断是否是严格模式。我们可以利用一个自执行函数，其`this`会指向全局，如果是严格模式其值就是`undefined`，所以我们可以判断this是否和void 0相等, 如果相等其就是严格模式，如果不是则相反
```js
const isStrict = (function(){
　　return this === void 0
}())
```
call修改后的代码如下
```js
  Function.prototype.call1 = function (context) {
    // 判断是否为严格模式
    const isStrict = (function () {
      return this === void 0;
    })();
    // 处理arguments
    let args = [];
    for (let i = 1; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    // 如果context为 null undefined 并且是严格模式 就直接执行函数即可 这时候函数内的this就是undefined
    // typeof context !== "number" 过滤 0
    if (!context && typeof context !== "number" && isStrict) {
      return eval("this(" + args + ")");
    }
    context = Object(context);
    const _KEY = Symbol.for("CALL1_KEY");
    context[_KEY] = this;
    return eval("context[_KEY](" + args + ")");
  };
```

这样我们的call函数就完美的复刻了。


## apply函数的实现
在了解过call函数后，apply其实就非常好实现的。两者唯一的区别就是对arguments的处理。
```js
Function.prototype.apply1 = function (context, arr) {
  const isStrict = (function () {
    return this === void 0;
  })();
  if (!context && typeof context !== "number" && isStrict) {
    // 严格模式下 没有传第二个参数 直接执行即可
    if (!arr) {
      return this()
    }
    return eval("this(" + args + ")");
  }
  context = Object(context);
  const _KEY = Symbol.for("CALL1_KEY");
  context[_KEY] = this;
  if (!arr) {
    return context[_KEY]()
  }
  let args = [];
  for (let i = 0; i < arr.length; i++) {
    args.push('arr[' + i + ']');
  }
  return eval("context[_KEY](" + args + ")");
};
```