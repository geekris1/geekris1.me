---
title: 快速上手echarts，绘制各种图表
description:
date: 2023-02-13 19:55:00
---

[[toc]]
 
 # 快速上手echarts，绘制各种图表

> 本文适合你在初入手echarts时阅读，观看完本文后，你将了解如何快速的配置一个与你想要的图表非常接近的options，同时随着时间的积累，你将对其配置越来越熟悉。

如果你初次使用echarts，进入其官网查看了api列表，多多少少都会有一点劝退的感觉。实际上如果你了解了一些图表大的区域，通过查看demo，再通过官方提供的[术语速查手册
](https://echarts.apache.org/zh/cheat-sheet.html)，是能够让你快速入手echarts的。</br>
接下来让我们开始吧。

## 如何创建一个echarts图表
首先我们先在项目里引入echarts的资源(可以使用npm安装也可以通过cdn引入)
，这里将使用npm安装引入。
```js
npm install echarts -S
```
然后我们先在html里创建一个div，当作容器。

```html
<div id="container"></div>
```
然后我们获取上面的dom，再初始化echarts实例并设置options，即可绘制出一个图表。
```js
import * as echarts from 'echarts';

// 如果你使用的是框架，建议使用ref，不然当图表组件复用时会产生问题。
const container = document.getElementById('container')

const myEcharts = echarts.init(container)

myEcharts.setOption(options) // ⬅️
```
上面的例子，并没有给出`options`具体的值，这也是echarts中最具挑战的一部分，如何根据我们想要的图表样式和功能，配置出其options对象，将是下文的重点。

## echarts的options都有哪些内容
<img  src='/echarts/echarts-legend.png'/>
如上图所示，我们可以先记住几个最重要的字段，这将覆盖你大部分的开发场景

```js
const options ={
  legend:{...}, // 图例 灰框部分
  xAxis:{...}, // x轴部分 绿色部分
  yAxis:{...}, // y轴部分 红色部分
  series:[{...}], // 图表内容 黄色部分
}
```
其中series是个数组，你可以放多个图表，比如你要放一个柱图和折线图
```js
const options ={
  series:[
    {type:"bar",...},
    {type:"line",...}
  ], // 图表内容
}
```

## 如何拼凑出符合你需求的options
在了解一些options基础的值后，接下来我们讲下如何快速的拼凑出你想要的options。
比如我们要画出如下的图表
<EchartsDemo demo='0'></EchartsDemo>
### 查看demo

首先我们可以在[echarts示例](https://echarts.apache.org/examples/zh/index.html)里寻找与你的需求最接近的图表，
我们通过查看官网的实例，很容易查看到这两个图是跟我们的需求最像的。如下图所示，红色框的demo提供了图例和标注，蓝色框的demo提供了中心圆是空的。
<img  src='/echarts/echarts-demo-1.png'/>
我们先点进红色demo里，如下图所示，发现图例部分，跟我们需求不一样(看过上面我们知道图例是legend)，但是还多出一部分类似title的，我们并不知道是啥，这时候我们可以在左侧，注释掉一部分代码，来验证那一部分是它。
<img  src='/echarts/echarts-demo-2.png'/>
如下图所示，在我们注释掉demo，部分的内容后，我们发现多出来的一部分不见了。
<img  src='/echarts/echarts-demo-3.png'/>
同理，我们也可以通过注释legend内的值，来查看其是什么效果。
最终在我们注释完legend内的值后，我们得到了这样的options

```js
option = {
  // title: {
  //   text: 'Referer of a Website',
  //   subtext: 'Fake Data',
  //   left: 'center'
  // },
  legend: {
  //  orient: 'vertical',
  //  left: 'left'
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: 'Search Engine' },
        { value: 735, name: 'Direct' },
        { value: 580, name: 'Email' },
        { value: 484, name: 'Union Ads' },
        { value: 300, name: 'Video Ads' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
};
```
这时候我们的图表是这样的
<EchartsDemo demo='1'></EchartsDemo>

### demo对比
接下来，我们需要需要完成饼图中间空着的部分。我们现在进入蓝色框的demo里。
<img  src='/echarts/echarts-demo-1.png'/>
我们第一种方式是可以对比下两个demo的区别。如下图所示，我们会发现第一多了红色框部分(legend设置了top和left值)。另外在series里(蓝色框选部分)也多了很多属性。
<img  src='/echarts/echarts-demo-4.png'/>
接下来我我们可以先逐一注释掉series里的值，看下那一条是控制饼图中间是空心的。</br>试下来之后我们发现是这个值

```js
 radius: ['40%', '70%'],
```
将其替换之后，我们的图表变成了这样
<EchartsDemo demo='2'></EchartsDemo>
如果仔细观察的话，可以发现我们的legend太贴近元素顶部了，其实上看蓝色框demo里options会发现他设置了legends.top属性，我们可以拿出来试一试，发现就变成了这样
<EchartsDemo demo='0'></EchartsDemo>
这样我们的图表就完成了。

### 查看术语速查手册
查看demo，一般能帮我们大致完成图表的功能，但是更细致的样式是无法完成的。这时候我们可以通过官网提供的[术语速查手册
](https://echarts.apache.org/zh/cheat-sheet.html)，来查看我们想要修改部分对应的api。</br>
比如我们想将某个柱状图的y轴，添加`人`单位
<img  src='/echarts/echarts-demo-5.png'/>
如下图，首先我们点击y轴的标注，通过左侧上面的内容，我们知道需要修改`yAxis.axisLabel`的配置，然后再点击左侧的`查看配置项手册`,跳转到对应的设置列表
<img  src='/echarts/echarts-demo-6.png'/>
我们将api缩小的范围，到这里就结束了。接下来，我们就只能一个一个点，来查看哪一个是修改标注单位的值。
在一番查阅后，我们发现`axisLabel.formatter`这个值可以修改。

<img src='/echarts/echarts-demo-7.png'/>

## 总结
以上只是帮你能够快速的配置出你想要的图表，如果想有深入的了解，还需要日积月累。当遇见需要对比或者查看的api时，可多查看文档，加深记忆。