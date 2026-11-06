# 主页精选内容清单

个人主页的 Research 精选内容统一维护在 Obsidian Vault 根目录的 `content/_homepage.md`。该文件只作为构建清单，不生成 Quartz 页面，也不会进入目录、反向链接、关系图、搜索、RSS、站点地图或内容索引。

## 添加条目

每个条目使用一个包含别名的二级 Wiki Link 标题：

```md
## [[研究/空间结构|漫画纸面中的动态空间结构]]

bind:: research
appearance:: text
summary:: 关于漫画分镜、视线组织与空间运动关系的研究笔记。
tags:: 漫画, 空间
order:: 10
enabled:: true
```

需要封面的样式必须使用本 Vault 中的附件：

```md
## [[项目/研究工具|研究工具]]

bind:: projects
appearance:: browser
summary:: 用于管理研究资料的工具页面。
cover:: [[附件/research-tool.png]]
tags:: 工具, 项目
order:: 20
```

字段规则：

- `bind` 必填：`research`、`blog`、`pokemon`、`projects`。
- `appearance` 必填：`text`、`gallery`、`book`、`browser`、`disc`。
- `summary` 必填，必须是非空单行文本。
- `order` 必填，必须是整数。输出按 `order`、最终 `href` 排序。
- `tags` 可选，以英文逗号或中文逗号分隔。
- `enabled` 可选，默认 `true`；改为 `false` 可暂时移除条目。
- `cover` 对 `gallery`、`book`、`browser`、`disc` 必填；`text` 可选。
- 不允许填写 `id`、坐标、尺寸、视差、动画、随机位置或任何未定义字段。

永久移除条目时删除其整个 `##` 区块；临时移除时设置 `enabled:: false`。

## 链接解析与构建

文档 Wiki Link 使用 Quartz 当前的 shortest 规则：完整相对路径优先，只有文件名时必须能唯一匹配。构建使用 Quartz 已解析且实际发布的文档集合；草稿、无法解析或歧义链接会导致构建失败。最终 URL 使用 Quartz 文档 slug，并在当前 Quartz 已发布 `slug`/`permalink` 别名时优先使用该公开路径。

封面 Wiki Link 在 Quartz 已纳入构建的附件中解析，支持嵌套目录、中文、空格和别名显示文本。JSON 只写入 `/research/` 开头的编码后公开 URL，不写本地路径或 Wiki Link。

Quartz 本地 emitter `plugins/homepage-feed/` 在每次构建中读取、校验清单，并生成 `public/homepage-feed.json`。`npm run check:homepage-feed` 会验证 feed、页面与索引隔离，以及每个文档和附件 URL 对应真实构建产物。

## 本地验证

```powershell
npm test
npx quartz build
npm run check:homepage-feed
```
