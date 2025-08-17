+++
date = '2025-08-16T23:30:00-04:00'
draft = true
title = 'Markdown学习指南'
tags = ["学习", "教程", "Markdown", "语法"]
categories = ["教程"]
description = "完整的Markdown语法学习指南，包含所有常用语法和Hugo特殊用法"
readingTime = 15

[cover]
image = ""
alt = "Markdown语法学习"
caption = "Markdown语法完全指南"
relative = false
hidden = false
hiddenInList = false
hiddenInSingle = false

ShowToc = true
+++

# Markdown 学习指南

这是一个完整的 Markdown 语法学习指南，包含了所有常用的语法和 Hugo 特殊用法。

---

## 📝 基础语法

### 1. 标题 (Headers)

```markdown
# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题
```

### 2. 文本格式

```markdown
**粗体文本**
_斜体文本_
**_粗斜体文本_**
~~删除线文本~~
`行内代码`
```

### 3. 列表

#### 无序列表

```markdown
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2
- 项目 3
```

#### 有序列表

```markdown
1. 第一项
2. 第二项
   1. 子项 2.1
   2. 子项 2.2
3. 第三项
```

### 4. 链接和图片

```markdown
[链接文本](URL)
![图片描述](图片URL)

例如：
[百度](https://www.baidu.com)
![头像](/images/avatar.jpg)
```

### 5. 引用

```markdown
> 这是一个引用
>
> 可以有多行
>
> > 还可以嵌套引用
```

### 6. 代码块

#### 行内代码

```markdown
使用 `code` 来标记行内代码
```

#### 代码块

````markdown
```python
def hello_world():
    print("Hello, World!")
```
````

### 7. 表格

```markdown
| 列 1   | 列 2   | 列 3   |
| ------ | ------ | ------ |
| 内容 1 | 内容 2 | 内容 3 |
| 内容 4 | 内容 5 | 内容 6 |
```

### 8. 分割线

```markdown
---
或者
---

或者

---
```

---

## 🎨 高级语法

### 1. 任务列表

```markdown
- [x] 已完成任务
- [ ] 未完成任务
- [ ] 另一个任务
```

### 2. 脚注

```markdown
这里是一个脚注[^1]。

[^1]: 这是脚注的内容。
```

### 3. 定义列表

```markdown
术语 1
: 定义 1

术语 2
: 定义 2
```

### 4. 数学公式 (如果支持)

```markdown
行内公式：$E = mc^2$

块级公式：

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

---

## 🚀 Hugo 特殊语法

### 1. 短代码 (Shortcodes)

#### 图片短代码

```markdown
{{< figure src="/images/photo.jpg" title="图片标题" caption="图片说明" >}}
```

#### 音乐播放器

```markdown
{{< bgm src="/music/song.mp3" title="歌曲标题" artist="艺术家" >}}
{{< music src="/music/song.mp3" title="音乐标题" autoplay="false" loop="true" >}}
{{< playlist title="播放列表" list='[{"src":"/music/song1.mp3","title":"歌曲1"}]' >}}
```

#### 折叠内容

```markdown
{{< details "点击展开" >}}
这是折叠的内容
{{< /details >}}
```

### 2. Hugo 函数

```markdown
{{ .Title }} - 页面标题
{{ .Content }} - 页面内容
{{ .Date }} - 发布日期
{{ .URL }} - 页面 URL
{{ .Permalink }} - 完整链接
```

### 3. 条件语句

```markdown
{{ if .IsPage }}
这是页面内容
{{ else }}
这是列表页面
{{ end }}
```

---

## 📚 实用技巧

### 1. 转义字符

```markdown
\* 显示星号而不是斜体
\[ 显示方括号而不是链接
\` 显示反引号而不是代码
```

### 2. HTML 混合使用

```markdown
<details>
<summary>点击展开</summary>
<p>这是HTML内容</p>
</details>
```

### 3. 表情符号

```markdown
:smile: :heart: :thumbsup: :rocket:
```

---

## 🔧 常用模板

### 1. 文章模板

```markdown
+++
date = '2025-08-16T23:30:00-04:00'
draft = false
title = '文章标题'
tags = ["标签1", "标签2", "标签3"]
categories = ["分类"]
description = "文章描述"
readingTime = 5

[cover]
image = "/images/cover.jpg"
alt = "封面图片描述"
caption = "图片说明"
relative = false
hidden = false
hiddenInList = false
hiddenInSingle = false

ShowToc = true
+++

# 文章标题

文章内容...
```

### 2. 链接模板

```markdown
{{< link href="https://example.com" title="链接标题" >}}
```

---

## 📖 学习资源

- [Markdown 官方文档](https://daringfireball.net/projects/markdown/)
- [GitHub Markdown 指南](https://docs.github.com/cn/github/writing-on-github)
- [Hugo 文档](https://gohugo.io/documentation/)

---

## 💡 小贴士

1. **保持简洁**：Markdown 的优势在于简洁易读
2. **一致性**：在整个文档中保持格式一致
3. **预览**：经常预览效果，确保格式正确
4. **练习**：多练习，熟能生巧

---

**记住**：Markdown 是一种标记语言，重点是内容而不是格式。掌握基础语法后，您就能快速创建美观的文档了！
