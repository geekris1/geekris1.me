---
title: js中的隐式类型转换
description:
date: 2023-03-19 17:18:00
---

[[toc]]

# js中的隐式类型转换

```js
{} + []
[] + {}
'1' + 100
'1' - 100
+ '100'
'1' == 1
alert([1,2,3])
```
我们经常会看见如上一些涉及到js中隐式类型转换的题。 所谓的隐式转换大致分为如下几种类型，下面我们将分别将一下几种转换过程。
- 值类型到值类型
- 值类型到引用类型
- 引用类型到值类型


## 值类型到值类型
如果一个类型转换的结果是值类型，它大概有三种结果`number`,`string`,`boolean`，下面我们将分别讲述这三种情况。

### Number
由于能转换为Number的情况实在是太多了，我们会先列举一些比较常见的情况，然后会列出一个表来供大家参考。


首先我们来讲一下string转换为number，其大致分为三种情况
- 如果是一个空字符串('')，将被转化为0
- 如果字符串中是一个有效数字('-1.1'),会将其转换为数字(-1.1)
- 如果字符串中含有非数字 ('1aaa'),将会被转化为NaN


除此之外，其他的类型转换到number，更像一个查表的过程，其结果比较具有唯一性，我们接下来将列举一个表来展示

| 值    | 转换后    | 备注   |
| ---- | ---- | ---- |
|  true    |   1   |      |
|    false  |  0   |      |
|    null  |  0   |      |
|    undefined  |  NaN   |      |
|    function |  NaN   |      |
|    symbol |  Error   |  Cannot convert a Symbol value to a number   |
|    date  |  对应时间戳   |      |
|    bigint |  对应数字   |  100n => 100    |
|    []  |  0   |   以下内容具体为啥后面会讲到  |
|    [1]  |  1   |      |
|    ['1']  |  1   |      |
|    [1,0]  |  NaN   |      |
|   `{}`  |  NaN   |   所有对象都是NaN   |

### String

对于转换到string来说，大部分情况下都是用一对单/双引号对其内容进行包裹，比如
- `String(null)`=>`'null'`
- `String(function(){})`=>`'function(){}'`
- `String(Symbol(1))`=>`'symbol(1)'`
- `100n` => `'100'` **(BigInt这里没有后面的n)**

除此之外array和objet转换会有些特殊
- object 总是会转换成 `[object Object]`
- array等同于调用join方法。如String([1,2,3]) => '1,2,3'
 
### Boolean
对于boolean来说，只有这5个值:0,NaN,'',null,undefined,会被转换为false，其余都会被转换为true
## 值类型到引用类型
值类型转换到引用类型这种情况，在实际项目中基本遇不到。只所以要讲这个是因为它于引用类型到值类型的结果有一定的关系。其转换大致有两种方式
```js
Object(1) // Number {1}

new Number(1) // Number {1}
```
值类型通过这种方式转换出来的值，其都会有一个私有槽`[[PrimitiveValue]]`属性,其值和值类型数据一致,如下图。
<img  src='/type-conversions/type-conversions-1.jpg'/>

## 引用类型到值类型
> 在上文中，对于`[]`,`{}`转换为number，string等，我们都给出过其结论，但是其中间具体发生了啥，我们在这一节，将进行详细的讲解。

关于引用类型到值类型大致分为三个步骤
- 是否有Symbol.toPrimitive属性(通常需要自己设置)，如果有则调用，返回值类型，会取值类型的结果，返回引用类型会报错
- 调用valueOf，是否能返回值类型
- 调用toString方法
我们可以写一个列子来验证这一点
```js
let x = {
  [Symbol.toPrimitive]() { console.log(1); return 1 },
  valueOf() { console.log(2); return 2 },
  toString() { console.log(3); return 3 }
}

let y = x + 1; 
console.log(y)
```
以上代码会先打印1，然后打印2，说明其优先走了Symbol.toPrimitive。我们可以依次注释Symbol.toPrimitive和valueOf相关代码，再打印看看。接下来我们将具体讨论不同类型值的转换结果(以下讨论为没有自定义Symbol.toPrimitive,valueOf和toString属性)。

### 包装类
在上述内容中，我们讲过值类型到引用类型的转换，其可以通过Object(x)或者new Number(x)这种形式转换，通过这种类型转换的值，我们可以称呼其为包装类。其转换流程会先调用valueOf方法。这是valueOf会返回数据本身，所以如下代码
```js
let x= Object(1);
x.valueOf() // 1
```
### Array
在array转换的过程中，会优先调用valueOf方法，valueOf方法总是会返回数组本身，所以其不是值类型。然后会接着调用toString方法，toString方法大致效果和join方法一致
```js
let x = [1,2,3]
x.toString() // 1,2,3
1 + x; // '11,2,3'
```
上述例子中`1 + x`其结果是'11,2,3'，大致转换流程如下
- 调用valueOf，返回为引用类型，接着走toString
- 调用toString，返回 '1,2,3'
- 1 + '1,2,3'，输入字符串拼接，返回'11,2,3'
### Object
object和array流程一样，valueOf也总是返回对象本身，所以会接着调用toString方法。object的toString方法会返回`[object Object]`

### 其他情况
在上面我们讲了array和object的转换过程，会优先调用valueOf再调用toString，但这个顺序也不是绝对的，接下来我们将分析一些其他的情况
#### 预设非number
如果一个运算没办法确定类型，那么类型转换前，它的运算数会被预设成number，对于预设是number的值，会先调用valueOf再调用toString。有一些情况下我们是明确知道其需要转化为一个string类型，则会优先调用toString方法，然后再是valueOf。比如
```js
let x = {
  valueOf() { console.log('1'); return "1" },
  toString() { console.log('2'); return {} }
}

String(x) 
// 先打印2，再打印1，String(x)的返回值为'1'
```
除此之外还有`alert`和`Date`等方法，也都会优先调用toString然后再是valueOf。

## 结语

在讲转换为number时，有列出一个表，上面列举了一些数组和对象转换成number的情况，看了上述内容，不知道你是否知道其原因，可以尝试说下其转换的过程。
| 值    | 转换后    | 备注   |
| ---- | ---- | ---- |
|    []  |  0   |   以下内容具体为啥后面会讲到  |
|    [1]  |  1   |      |
|    ['1']  |  1   |      |
|    [1,0]  |  NaN   |      |
|   `{}`  |  NaN   |   所有对象都是NaN   |

除此之外在开头也列举了一些类型转换的题，又部分是与本内容相关的，也有不相关的，接下来我们再额外补充一点知识。
```js
{} + []
[] + {}
'1' + 100
'1' - 100
+ '100'
'1' == 1
alert([1,2,3])
```
在`{} + []`中，因为js中自动补全分号的机制，前面的{}会被当作成一个块级作用域，并自动补全;号，所以其代码你可以看作`{};+[]`。`+[]`是一个正值表达式，这句话等同于`Number([])`，所以其结果是0。</br></br>
在`'1' - 100`。在js中加号有拼接字符的作用，但是减号并没有，所以值两边都需要是number类型，`'1' - 100`等同于`1-100`所以是-99。</br></br>
除此之外相信其他的题，你都能知道答案了。