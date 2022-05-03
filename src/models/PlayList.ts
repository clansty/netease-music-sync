import path from 'path';
import fs from 'fs';
import nease from 'NeteaseCloudMusicApi';
import Pool from './Pool';

const cookie = process.env.COOKIE;

export default class PlayList {
  public readonly id: number;
  public readonly name: string;
  public readonly dir: string;

  constructor(info: any, baseDir: string, private readonly pool: Pool) {
    this.name = info.name;
    this.id = info.id;
    this.dir = path.join(baseDir, this.name);
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  public async getAllSongs() {
    const res = await nease.playlist_track_all({ id: this.id, cookie });
    return res.body.songs as any[];
  }

  public linkSong(fileName: string, poolFile: string) {
    return fs.symlinkSync(`../pool/${poolFile}`, path.join(this.dir, fileName));
  }

  public unlinkSong(fileName: string) {
    return fs.unlinkSync(path.join(this.dir, fileName));
  }

  public localExists(fileName: string) {
    return fs.existsSync(path.join(this.dir, fileName));
  }

  public async syncSongs() {
    console.log('同步歌单:', this.name);
    const songs = await this.getAllSongs();
    // 这个用来在最后对比删除已经删除了的歌的链接
    const fileNamesInPlaylist: string[] = [];
    for (const song of songs) {
      const title = song.name;
      const id = song.id;
      // pc 那个适配云盘项目
      const artists: string[] = song.pc?.ar ? [song.pc.ar] : song.ar.map(ar => ar.name);
      const album = song.pc?.alb || song.al.name;
      const picUrl = song.al.picUrl;
      let fileNameBeforeExt = `${artists.join(' ')} - ${title}`.replace(/[\/\\]/g, '_');
      if(fileNameBeforeExt.length>200){
        fileNameBeforeExt = `${artists[0]} 等${artists.length}只 - ${title}`.replace(/[\/\\]/g, '_');
      }

      try {
        const type = this.pool.exists(id);
        if (type) {
          const fileName = `${fileNameBeforeExt}.${type}`;
          fileNamesInPlaylist.push(fileName);
          if (this.localExists(fileName)) continue;
          console.log('链接:', fileName);
          this.linkSong(fileName, `${id}.${type}`);
        }
        else {
          const download = (await nease.song_download_url({ cookie, id: song.id })).body.data as any;
          const url = download.url;
          const type = download.type.toLowerCase();
          const fileName = `${fileNameBeforeExt}.${type}`;
          fileNamesInPlaylist.push(fileName);
          console.log('下载:', fileName);
          await this.pool.download(id, url, type, title, artists, album, picUrl);
          this.linkSong(fileName, `${id}.${type}`);
        }
      }
      catch (e) {
        console.log('处理失败', fileNameBeforeExt, e.message);
      }
    }
    const filesInDir = fs.readdirSync(this.dir);
    for (const i of filesInDir) {
      if (fileNamesInPlaylist.includes(i)) continue;
      console.log('删除:', i);
      this.unlinkSong(i);
    }
    console.log('同步完成:', this.name);
  }
}
