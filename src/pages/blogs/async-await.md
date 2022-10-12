---
title: async函数的实现原理
description:
date: 2022-10-10 17:18:00
---

[[toc]]

# async函数的实现原理
## 前沿
在现在的开发中，多多少少的都离不开`async`和`await`语法糖。</br>
`async`实现的本质就是`generator`函数加`co`,所以我们将先讲解这两个内容

## generator

### 初步了解generator
`generator`是es6提供的一种异步编程方法。 
较比普通函数，它需要在function关键字和函数名中间添加`*`号
```js
function* generator(){}
```
可以在函数内使用`yield`来定义不同的内部状态
```js
function* generator() {
  let name = yield 'hello'
  let age = yield name
  yield age
  return 'over'
}
```
我们可以和正常函数一样使用`()`来对其进行调用，但是调用后该函数内容并不会执行，而是返回有个指向内部状态的迭代器对象。 
我们可以使用该对象上`next`方法来指向下一个状态。 
```js
let iterator = generator();
console.log(iterator.next()) // { value: 'hello', done: false }
console.log(iterator.next('thez')) // { value: 'thez', done: false }
console.log(iterator.next(18)) // { value: 18, done: false }
console.log(iterator.next()) // { value: 'over', done: true }
```
用`next`方法会从函数头部开始或上次停止的位置开始执行,直到遇到`yield`(或return),就会停止。
所以我们上面的`generator`函数，我们可以拆解为这样的几步
``` js
yield 'hello'
let name = yield name
let age = yield age
return 100
```
第一次执行`iterator.next()`代表执行的是`yield 'hello'` 这句代码，返回值`{ value: 'hello', done: false }`，value代表yield后面的内容，done为false代表后面还有未执行的语句</br>
第二次执行`iterator.next('thez')`代表执行的是`let name = yield name`。其中`thez`的传参会赋值给`name`，也可以这样理解这段代码
```js
next('thez')
function next(name){
  return {value:name,done:false}
}
```

### 如何实现generator
首先我们可以打开babel网站将上面的代码粘贴进去
<img  src='/babel-generator.jpg'/>
(需要注意的是,我们需要将左侧的ELECTRON设置为1,上图划红框的地方)

```js
function _regeneratorRuntime() {...} // 代码过长省略
var _marked = /*#__PURE__*/_regeneratorRuntime().mark(generator);
function generator() {
  var name, age;
  return _regeneratorRuntime().wrap(function generator$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        _context.next = 2;
        return 'hello';
      case 2:
        name = _context.sent;
        _context.next = 5;
        return name;
      case 5:
        age = _context.sent;
        _context.next = 8;
        return age;
      case 8:
        return _context.abrupt("return", 'over');
      case 9:
      case "end":
        return _context.stop();
    }
  }, _marked);
}
```
生成的代码如上，接下来我们将详细的讲解。
首先是`_regeneratorRuntime`函数，因为代码过长我给省略了，而且里面很多代码我们可以省略，接下来我们就结合上下文使用情况，来把用到的内容简单实现一下,其执行返回了`mark`和`wrap`两个函数。

`mark`比较简单就是把传进来的函数修改了其`__proto__`指向，并添加`Symbol.toStringTag`等等,再将起返回,这里我们直接返回传递进来的函数即可。
```js
function _regeneratorRuntime(){
  function mark(gen){
    return gen
  }
  function wrap(){
    ...
  }
  return {mark,warp}
}
```

`wrap`我们发现其接收一个回调函数，并且给其传递了一个`_context`参数。_context上有`prev`,`next`,`sent`,`abrupt`,`stop`。
```js

function _regeneratorRuntime(){
  function mark(gen){
    return gen
  }
  function wrap(innerFn,self){
    let _context = {
      next:0,
      prev:0,
      done:false,
      sent:null,
      abrupt:function(type,arg){
        let record ={}
        record.type = type;
        record.arg = arg;
        return this.complete(record)
      },
      complete:function(record){
        if(record.type ==='return'){
          this.returnValue = record.value;
          this.next= "end"
        }
        return record.arg
      },
      stop:function(){
        this.done =true;
        return this.returnValue
      }
    }
    return {
      next(v){
        _context.sent = v;
        let value =  innerFn(_context);
        return {value,done:_context.done}
      }
    }
  
  }
  return {mark,warp}
}
```
`warp`函数主要是创建了一个`context`用来存储当前的一些状态和值等,return了一个对象里面有next方法，我们调用的next方法就是他，每次调用都记录传递过来的参数，然后调用generator函数,并把上下文的值传递出去</br>
`generator$`函数就是将之前的状态做了一个拆分,用`switch`来做一个分割，`while(1)`是一个状态机，表示里面的代码会走多次,当`switch`里return了就跳出这个循环了。