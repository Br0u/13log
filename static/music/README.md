# 音乐文件说明

这个文件夹用于存放博客文章的背景音乐文件。

## 支持的音乐格式

- MP3 (.mp3) - 推荐，兼容性最好
- OGG (.ogg) - 开源格式，文件较小
- WAV (.wav) - 无损格式，文件较大

## 使用方法

### 1. 在文章中添加背景音乐

```markdown
{{< bgm src="/music/song.mp3" title="歌曲标题" artist="艺术家" >}}
```

### 2. 添加音乐播放器

```markdown
{{< music src="/music/song.mp3" title="音乐标题" autoplay="false" loop="true" controls="true" >}}
```

### 3. 添加播放列表

```markdown
{{< playlist title="我的歌单" list='[{"src":"/music/song1.mp3","title":"歌曲1","artist":"艺术家1","duration":"3:45"}]' >}}
```

## 注意事项

- 音乐文件路径以 `/music/` 开头
- 建议音乐文件大小控制在 5MB 以内
- 确保音乐文件有合法的使用权限
- 考虑用户体验，避免自动播放

## 示例音乐文件

- `philosophy.mp3` - 思考时的背景音乐
- `romance.mp3` - 浪漫主题音乐
- `nature.mp3` - 自然主题音乐
