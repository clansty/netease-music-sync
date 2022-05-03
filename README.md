# Netease Sync

自动将网易云的歌单同步到本地

## 存储方式

所有本地有的音乐以 ID 为名称保存在 `pool` 文件夹中，并在歌单文件夹中维护以 `歌手 - 歌名.{mp3,flac}` 为名，到 `pool` 中文件的软链接

## 咕咕

- [x] 下载新增音乐
- [x] 删除已删除的音乐
- [x] 支持多个歌单
- [ ] 歌灰了自动将本地有的文件（如果有）上传到音乐云盘
- [x] Arch Linux 包部署
- [ ] Docker 部署
- [ ] 自带一个 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 或者 [YesPlayMusic](https://github.com/qier222/YesPlayMusic)，用本地文件作为缓存

## 使用方法

### Arch Linux

1. 首先安装 `netease-music-sync` [AUR](https://aur.archlinux.org/packages/netease-music-sync) [凌莞源](https://pacman.ltd/x86_64/netease-music-sync)

   ```bash
   yay -S netease-music-sync
   ```

2. 运行 `netease-login` 获取 cookies

3. 编辑 `/etc/netease-music-sync.conf`，填入相关信息

   ```bash
   sudo vi /etc/netease-music-sync.conf
   ```

   歌单 ID 获取方法：在手机上分享歌单，URL 里就有 ID。或者在网页上打开，地址栏也有

4. 启用服务

   ```bash
   sudo systemctl enable --now netease-music-sync.service
   ```

#### 以指定用户身份运行

如果你想要以指定用户身份运行同步程序，比如说写入文件要以特定的用户/组身份，可以在启用服务之前这样操作

```bash
sudo systemctl edit netease-music-sync.service
```

在编辑区域增加以下内容

```ini
[Service]
User=你需要的用户名
```
