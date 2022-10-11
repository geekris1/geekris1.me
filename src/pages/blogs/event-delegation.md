---
title: js中的事件委托
description:
date: 2022-10-10 17:18:00
---

[[toc]]

# js中的事件委托

## 什么是事件委托

当一个dom事件触发时会经过三个阶段
- 事件捕获阶段
- 目标阶段
- 冒泡阶段

(下图有错，实际上是从window开始) 
<img src='/event-delegation.jpg' />

所谓的事件委托就是利用事件冒泡的机制,将多个子元素的事件，放到父元素来处理，这样我们可以减少事件的绑定，也可以达到函数的复用
## 事件委托体验

### 事件冒泡
```html
<body>
  <div onclick="parent()">
    parent
    // !如果你使用这段代码 请给这个children方法修改个名字 
    <div onclick="children()">children</div>
  </div>
  <script>
    function parent() {
      console.log('parent');
    }
    function children() {
      console.log('children');
    }
  </script>
</body>
```
如上图代码，当我们点击text为children的这个元素时，打印的值分别为:`children`和`parent`

**你可以点击下面左侧列表的元素，右侧列表会按照事件执行顺序打印值** 

<EventDelegation event='1'></EventDelegation> 
 
 ### 事件捕获
接下来我们给父元素添加一个捕获阶段的事件，添加捕获阶段的事件有两种写法
```js
 addEventListener("click",()=>{},true)
 // or
 addEventListener("click",()=>{},{"capture":true})
```
 

```html
<body>
  <div id="parent" onclick="parent()">
    parent
    // !如果你使用这段代码 请给这个children方法修改个名字 
    <div onclick="children()">children</div>
  </div>
  <script>
    function parent() {
      console.log('parent');
    }
    function children() {
      console.log('children');
    }
    parent..addEventListener(
      "click",
      () => {console.log('parent-capture')},{ capture: true }
    )
  </script>
</body>
```

<EventDelegation event='2'></EventDelegation> 
 
### target 和 currentTarget
上面都是只有一个子元素的情况,如果我有多个子元素该如何区分呢?</br>
这时候我们可以用到`e.target`这个属性，与之接近的还有`currentTarget`属性。

- target 指向触发事件元素
- currentTarget 指向绑定事件的元素


```html
  <body>
    <div id="p">
      <div>1</div>
      <div>2</div>
      <div>3</div>
    </div>
  </body>
  <script>
    p.addEventListener("click", function (e) {
      console.log(e.target.innerText);
    });
  </script>
```

<EventDelegation1></EventDelegation1> 
 

### stopPropagation
如果不想要事件进行冒泡，我们可以用`stopPropagation`方法来阻止冒泡
``` html
  <body>
    <div id="p">
      <div id="c">1</div>
    </div>
  </body>
  <script>
    p.addEventListener("click", function (e) {
      console.log(e.target.innerText);
    });
    c.addEventListener("click", function (e) {
      e.stopPropagation();
      console.log(1)
    });
    c.addEventListener("click", function (e) {
      console.log(2)
    });
    c.addEventListener("click", function (e) {
      console.log(3);
    });
  </script>
```
<EventDelegation2 event="stopPropagation"></EventDelegation2> 

### stopImmediatePropagation
上面的代码，你会发现虽然父元素的事件没有执行，但是给触发事件的这个元素，绑定多个事件时，其他的事件还是会执行。</br>
如果不想其他的事件执行,我们可以用`stopImmediatePropagation`这个方法，这样就不会打印出`3`了
```html
<body>
    <div id="p">
      <div id="c">1</div>
    </div>
  </body>
  <script>
    p.addEventListener("click", function (e) {
      console.log(e.target.innerText);
    });
    c.addEventListener("click", function (e) {
      console.log(1);
    });
    c.addEventListener("click", function (e) {
      e.stopImmediatePropagation();
      console.log(2);
    });
    c.addEventListener("click", function (e) {
      console.log(3);
    });
  </script>
```

<EventDelegation2 event="stopImmediatePropagation"></EventDelegation2> 