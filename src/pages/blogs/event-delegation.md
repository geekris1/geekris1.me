---
title: js中的事件委托
description:
date: 2022-10-10 17:18:00
---

[[toc]]

# js中的事件委托

## 什么是事件委托

如下图所示，当一个元素触发事件时，会先从document往下先捕获事件，然后再从当前元素向上依次执行同名的事件(如果有的话)。
<img src='/event-delegation.jpg' />

## 事件委托初体验

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
 
接下来我们给父元素添加一个捕获阶段的事件
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