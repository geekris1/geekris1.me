---
title: pnpm初上手
description:
date: 2022-09-12 09:30:21
---
[[toc]]
## pnpm 初上手

最近看 vue 用了 pnpm 来做 monorepo。所有我们简单看看是如何做的

### 创建 packages

首先我们现在跟目录创建一个`packages`的文件夹,里面可以放上我们不同的包,然后再创建一个`pnpm-workspace.yaml`的文件

```
├── package.json
├── packages
│   ├── reactivety
│   ├── runtime-core
│   └── shares
└── pnpm-workspace.yaml
```

`pnpm-workspace.yaml` 文件中内容如下

```yaml
packages:
  - packages/*
```

`packages:` 代表定义工作空间根目录，`- packages/*`代表`packages`目录下的所有文件。

这样就做好绑定了

### 全局安装包

比如以上代码都依赖`typescript`,这时候可以把`typescript`装到全局 ，在后面加上`-w`即可

```
pnpm install typescript -w
```

### 单个文件装包

如上，我只想在`reactivety`中装`lodash`包，可以使用`--filter`

```
pnpm install lodash --filter reactivety
```

### 装 workspace 内的包

通常我们写的时候包可能是还未发布的，我们这时候如果想相互引用可以这样写`包名@workspace`.

比如想在`reactivety`引用`shares`

```
pnpm install shares@workspace --filter reactivety
```
