// 所有的歌曲本地文件放在 pool 里面，文件名为 id。然后从 pool 软链接到歌单文件夹
import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';
import id3 from 'node-id3';

export class Pool {
  public constructor(public readonly dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public exists(id: string | number) {
    if (fs.existsSync(path.join(this.dir, id + '.flac'))) {
      return id + '.flac';
    }
    if (fs.existsSync(path.join(this.dir, id + '.mp3'))) {
      return id + '.mp3';
    }
    if (fs.existsSync(path.join(this.dir, id + '.wav'))) {
      return id + '.wav';
    }
    if (fs.existsSync(path.join(this.dir, id + '.wma'))) {
      return id + '.wma';
    }
    if (fs.existsSync(path.join(this.dir, id + '.m4a'))) {
      return id + '.m4a';
    }
    if (fs.existsSync(path.join(this.dir, id + '.aac'))) {
      return id + '.aac';
    }
    if (fs.existsSync(path.join(this.dir, id + '.ogg'))) {
      return id + '.ogg';
    }
    if (fs.existsSync(path.join(this.dir, id + '.ape'))) {
      return id + '.ape';
    }
    if (fs.existsSync(path.join(this.dir, id + '.opus'))) {
      return id + '.opus';
    }
    if (fs.existsSync(path.join(this.dir, id + '.aiff'))) {
      return id + '.aiff';
    }
  }

  public async download(id: string | number, url: string, type: string,
                        title: string, artists: string[], album: string, picUrl: string) {
    const fileAbsPath = path.join(this.dir, `${id}.${type.toLowerCase()}`);
    if (fs.existsSync(fileAbsPath))
      return;
    const fileStream = fs.createWriteStream(fileAbsPath);
    const file = await fetch(url);
    // @ts-ignore @types/node 该 18 了
    await file.body.pipeTo(Writable.toWeb(fileStream));

    // 写入元数据
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
        console.log(tags);
        id3.update(tags, fileAbsPath);
        break;
      }
    }
  }
}
