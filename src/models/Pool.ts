// 所有的歌曲本地文件放在 pool 里面，文件名为 id。然后从 pool 软链接到歌单文件夹
import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';
import id3 from 'node-id3';
import MetaFlac from 'metaflac-js2';

export default class Pool {
  public constructor(public readonly dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public exists(id: string | number, type?: string) {
    if (!type) {
      const TYPES = ['flac', 'mp3', 'wav', 'wma', 'm4a', 'aac', 'ogg', 'ape', 'opus', 'aiff'];
      for (const possibleType of TYPES) {
        if (!fs.existsSync(path.join(this.dir, `${id}.${possibleType}`))) continue;
        type = possibleType;
        break;
      }
    }
    if (!type) return null;
    const fileAbsPath = path.join(this.dir, `${id}.${type.toLowerCase()}`);
    if (!fs.statSync(fileAbsPath).size) {
      console.log('删除空文件', fileAbsPath);
      fs.unlinkSync(fileAbsPath);
      return null;
    }
    return type;
  }

  public async download(id: string | number, url: string, type: string,
                        title: string, artists: string[], album: string, picUrl: string) {
    const fileAbsPath = path.join(this.dir, `${id}.${type.toLowerCase()}`);
    if (this.exists(id, type))
      return;
    try {
      const fileStream = fs.createWriteStream(fileAbsPath);
      const file = await fetch(url);
      // @ts-ignore @types/node 该 18 了
      await file.body.pipeTo(Writable.toWeb(fileStream));
    }
    catch (e) {
      console.error('下载失败', e.message);
      // 删除下载失败的文件
      fs.unlinkSync(fileAbsPath);
      // 同步的模块还需要处理下载失败，跳过链接
      throw e;
    }

    // 写入元数据
    try {
      switch (type.toLowerCase()) {
        case 'mp3': {
          const orig = id3.read(fileAbsPath);
          const tags: id3.Tags = {};
          // 优先使用原先的
          if (!orig.title) {
            tags.title = title;
          }
          if (!orig.artist) {
            tags.artist = artists.join('/');
          }
          if (!orig.album) {
            tags.album = album;
          }
          if (!orig.image) {
            const image = await fetch(picUrl);
            tags.image = {
              mime: image.headers.get('content-type'),
              type: { id: 3, name: 'front cover' },
              description: undefined,
              imageBuffer: Buffer.from(await image.arrayBuffer()),
            };
          }
          id3.update(tags, fileAbsPath);
          break;
        }
        case 'flac': {
          // AnyScript 坏，没别的库好用了😭
          const flac = new MetaFlac(fileAbsPath);
          if (!flac.getTag('TITLE')) {
            flac.setTag('TITLE=' + title);
          }
          if (!flac.getTag('ARTIST')) {
            flac.setTag('ARTIST=' + artists.join('/'));
          }
          if (!flac.getTag('ALBUM')) {
            flac.setTag('ALBUM=' + album);
          }
          const image = await fetch(picUrl);
          // macOS 显示不了 flac 的封面，是 macOS 的问题
          flac.importPicture(Buffer.from(await image.arrayBuffer()));
          flac.save();
          break;
        }
      }
    }
    catch (e) {
      console.error('写入元数据失败', e.message);
    }
  }
}
