---
title: 从0实现zustand
description:
date: 2023-02-21 13:20:00
---
[[toc]]
# 从0实现zustand
 
 > 本文所使用zustand版本为4.3.3

 zustand是目前在react非常火的一个状况管理库。对于为啥火，我的理解是使用起来非常简单，同时包含log,immer等中间件和react devtool的支持。同时其实代码量非常少，主要依靠的是官方提供的`useSyncExternalStoreExports`来做rerender。接下来我们就看下其如何使用和实现的。

 ## 简单上手

 首先我们创建一个`store.ts`文件。从zustand中引入create方法，create方法接收一个回调函数，其retuen value会当作state来存储，并且这个回调函数会接收一个setState的方法，调用setState的方法可以修改state的值，同时在外部调用useState会返回state的值。这里我们创建了一个count的值，和一个add函数，每次调用add函数count都会+1
 ```js
// store.ts
import { create } from 'zustand'

export const useStore = create((setState) => ({
  count: 0,
  add: () => { setState((state) => { return { count: state.count + 1 } }) }
  }
))
 ```
然后我们创建一个App.tsx。在里面引入useState并调用，同时创建一个button按钮每次点击调用add方法，并引入一个Count组件。
```js
import { useStore } from "./store";
function App(){
  // 这里返回的是上门回调函数的返回值
  const {count,add} = useStore()
  return <div>
    <button onClick ={()=>{
      add()
    }}>
    +
    </button>
    <Count></Count>
  </div>
}
```
接下来在创建一个Count.tsx，在这个组件里我们从store里取出count值并展示
```js
import { useStore } from "./store";
function Count(){
  const {count} = useStore()
  return <div>
    count is: {count}
  </div>
}
```
其完整代码如下
```js 
import ReactDOM from 'react-dom/client'
import { create } from 'zustand'
// store.ts
const useStore = create((setState) => ({
  count: 0,
  add: () => { setState((state) => { return { count: state.count + 1 } }) }
  }
))
// App.tsx
function App(){
  const {count,add} = useStore()
  return <div>
    <button onClick ={()=>{
      add()
    }}>
    +
    </button>
    <Count></Count>
  </div>
}
// Count.tsx
function Count(){
  const {count} = useStore()
  return <div>
    count is: {count}
  </div>
}

// mount
ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
```
> 你可以点击下面的按钮来进行体验，其实现就是上面的代码。

<Zustand></Zustand>

## zustand的实现

首先我们先创建一个create函数并接收一个createState的值，在内部我们会调用`createStore`方法并把createState传递过去，createStore会返回一个对象，包含getstate,setState等方法，除此之外还会有一些别的处理，我们稍后再说，我们先进入到`createStore`的实现。
```js
function create(createState){
  const api = createStore(createState)
}
```
createStore的实现由于代码量比较大，我将在每一个代码前一行用注释描述在做啥
```js
function createStore(createState) {
  // 存储state的值
  let state;
  // 基于发布订阅 后面会往里存些方法 调用达到更新
  const listeners = new Set()
  // 修改state值的方法
  const setState = (partial) => {
    // 判断修改的值是不是一个函数 是就把当前的state传递进去 不是函数则直接取返回的值
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    // 这里主要判断当前的state和更新的state是不是一样的 
    // 比如你return state这里就不用触发更新
    // Object.is和===基本相同 但有两点不同
    // 1. NaN!==NaN  2. -0 !== 0 
    if (!Object.is(state, nextState)) {
      // 进入这里就代表要更新了
      // 所以当前的state就成了上一次的state(previonsState)
      const previonsState = state;
      // 判断nextState是不是一个对象 
      // 是就 进行合并
      // 不是就以nextState为最新的state
      state = typeof nextState !== 'object' ? nextState : Object.assign({}, state, nextState);
      // 这里会遍历 set调用更新的函数 
      // 并且把当前的state和上一次的state传进去做一个比较
      // 至于listener值何时添加到set中的 我们后面再讲
      listeners.forEach(listener => listener(state, previonsState))
    }
  }
  // getState 直接返回 state即可
  const getState = () => state
  // 这里就是一个订阅事件 每次调用把值存到set里 并返回销毁的函数
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener)
    }
  }
  // 讲方法进行整合
  const api = { getState, setState, subscribe }
  // 这里会把 set get 传过去 
  // 后面更新值的话就可以调用set方法
  state = createState(setState, getState, api)
  // 返回api这个对象 里面有get set subscribe等方法
  return api
}
```
这里`createStore`就讲完了，我们再回到create函数。我们在create函数里添加了一个useBoundStore的变量，它是一个函数，函数内部调用了useStore方法，并将useStore的return值返回。接下来用了Object.assign把api上的值当作属性挂到了useBoundStore的函数上，然后将useBoundStore函数返回，我们接下来讲一下useStore的实现。
```js
function create(createState) {
  const api = createStore(createState) 
  const useBoundStore = (seletor, equalityFn) => useStore(api, seletor, equalityFn)
  Object.assign(useBoundStore, api)
  return useBoundStore
}
```

useStore主要借助了官方的`use-sync-external-store/shim/with-selector`提供的`useSyncExternalStoreWithSelector`这个方法，第一个参数接收第一个订阅的函数，会把调用更新的方法传递过去，后面接收的都是getState这个方法，最后一个参数提供的是`equalityFn`，一个比较state是否变化的函数,同时`useSyncExternalStoreWithSelector`会返回getState调用后的值
```js
function useStore(api, selector = api.getState, equalityFn) {
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getState,
    selector,
    equalityFn
  );
  return slice
}
```

## 结语
这样我们最简单的zustand实现就完成了。其实除了以上的内容，zustand还有middleware,包括`log`,`immer`,`persist`,以及对`react devtools`的支持等等，感兴趣的都可以去看看，其实并不难。