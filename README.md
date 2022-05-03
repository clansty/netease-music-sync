# Netease Sync

自动将网易云的歌单同步到本地

## 存储方式

所有本地有的音乐以 ID 为名称保存在 `pool` 文件夹中，并在歌单文件夹中维护以 `歌手 - 歌名.{mp3,flac}` 为名，到 `pool` 中文件的软链接

## 咕咕

- [x] 下载新增音乐
- [x] 删除已删除的音乐
- [x] 支持多个歌单
- [ ] 歌灰了自动将本地有的文件（如果有）上传到音乐云盘
- [ ] Arch Linux 包部署
- [ ] Docker 部署
- [ ] 自带一个 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 或者 [YesPlayMusic](https://github.com/qier222/YesPlayMusic)，用本地文件作为缓存
