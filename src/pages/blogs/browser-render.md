---
title: 浏览器如何渲染页面，以及什么是重绘与重排
description:
date: 2023-2-10 15:09:00
---

[[toc]]

# 浏览器如何渲染页面，以及什么是重绘与重排

当浏览器的网络线程接收到html的请求时，会生成一个渲染任务，并将其交给放到渲染主线程的消息队列。

在事件机制的作用，渲染主线程会将其取出，并开始执行渲染任务。

渲染任务具体流程为`parse(解析)`,`style computer(样式计算)`,`layout(布局)`,`layer(分层)`,`point(绘制)`,`tiling(分块)`,`rester(光栅化)`,`draw(画)`

每一步会将其处理的结果传递给下一步，整个构成了浏览器渲染流程。

### parse

- 首先进行的第一个阶段是`html parse`,也就是在我们请求到html的资源后，需要对html的内容进行解析。
- 在开始解析前，首先会对外部的css和js进行下载。
- 在渲染过程中如果遇见`link`标签，如果没css文件还未下载完成，渲染主线程不会等待，会继续解析后续的html。如果遇见`script`标签(未加sync和defer)，由于其可能会导致dom的变化，所以会等待js文件的加载，然后执行它，所以其会阻碍html的解析。
- 最终会生成`dom tree`和`cssOM tree`,`cssOM tree`包含浏览器默认样式，外部样式，内部样式，行内样式。

### style computer

比如我们在css里写了一个`line-height:100%`,在这一步将其转化为具体的px值。当这一部完成就会生成一个带有样式的`dom tree`
```css
 div {
   line-height:100%
 }
```

### layout

在这一部会根据dom tree的信息生成具体节点的宽高，相对包含块等信息。当然如果一个dom设置了`display:none`在这一步是不会生成layout信息的。

### layer

为了提高重新绘制的效率，浏览器会对布局信息进行分成，这样会某一层的信息改变，不会对其他层产生影响。所谓的层，其实就是堆叠上下文(如设置`z-index`,`opacity`,`will-change`等)。

### point

在这一步主要是产生指令集，描述着每一层的内容要如何绘制出来。完成绘制后会讲内容传递给合成线程，再由合成线程完成剩下的内容

### 合成线程

剩下的`tiling`,`rester`,`draw`都会在合成线程中完成，具体的内容就是将指令转化为位图(每一个像素格对应的颜色和排列)，以及如何渲染，缩放等(transform),然后再交给GPU，由GPU进程产生系统调用，提交给GPU硬件，完成屏幕程像工作。
由于在这一步，不会影响渲染主线程，所以通过transform属性产生的变化也不会影响渲染主线程，拥有更好的性能。

### reflow和repaint

在了解上面的知识点后，我们再来讲下什么是重排与重绘。

#### reflow
 
重排指某一个元素的大小，位置，内容，字体大小等发生变化，需要重新计算布局树，所以会引发layout。

同时获取某个元素的位置信息等，浏览器为了保证准确性会进行布局计算，也会导致重排(如果一次取多个值，不会重复产生重排，因为浏览器会产生快照，从快照中进行返回)。由于发生在layout节点，所以重排也必然导致重绘。

#### repaint

当页面的文档流没发生变化，可见样式发生变化时(如颜色，背景颜色等)，这样会再根据分层信息重新绘制指令集，再进行成像。