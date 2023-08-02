import path from "path";
import fs from "fs";
import nease from "NeteaseCloudMusicApi";
import Pool from "./Pool";
import { Level } from "level";
import bot from "../providers/bot";

const cookie = process.env.COOKIE;
const downloadCookie = process.env.DOWNLOAD_COOKIE || cookie;
const storePath = process.env.STORE || path.join(process.env.HOME, ".netease-music-sync");

export default class PlayList {
  public readonly id: number;
  public readonly name: string;
  public readonly dir: string;
  private readonly telegramMessageIdMap: Level<string, number>;
  private readonly telegramChannelId: number;

  constructor(info: any, baseDir: string, private readonly pool: Pool) {
    this.name = info.name;
    this.id = info.id;
    this.dir = path.join(baseDir, this.name);
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
    if (!fs.existsSync(storePath)) {
      fs.mkdirSync(storePath, { recursive: true });
    }
    this.telegramMessageIdMap = new Level(path.join(storePath, this.id.toString()));
    if (process.env.TELEGRAM_CHANNELS) {
      const configs = process.env.TELEGRAM_CHANNELS.split(",");
      const configForThisPlayList = configs.find((it) => it.startsWith(`${this.id}:`));
      if (configForThisPlayList) {
        this.telegramChannelId = Number(configForThisPlayList.split(":")[1]);
      }
    }
  }

  private async getAllSongs() {
    const res = await nease.playlist_track_all({ id: this.id, cookie });
    return res.body.songs as any[];
  }

  private linkSong(fileName: string, poolFile: string) {
    return fs.symlinkSync(`../pool/${poolFile}`, path.join(this.dir, fileName));
  }

  private unlinkSong(fileName: string) {
    return fs.unlinkSync(path.join(this.dir, fileName));
  }

  private localExists(fileName: string) {
    return fs.existsSync(path.join(this.dir, fileName));
  }

  private async uploadToChannel(fileName: string, title: string, performer: string, thumb: string, duration: number) {
    try {
      await this.telegramMessageIdMap.get(fileName);
      return;
    } catch {}
    try {
      console.log("上传到 Telegram:", fileName);
      const result = await bot.sendAudio(this.telegramChannelId, path.join(this.dir, fileName), {
        title,
        performer,
        // @ts-ignore
        thumb,
        duration,
      });
      await this.telegramMessageIdMap.put(fileName, result.message_id);
    } catch (error) {
      console.error("无法上传:", fileName, error.message);
    }
  }

  private async deleteFromChannel(fileName: string) {
    let messageId: number;
    try {
      messageId = await this.telegramMessageIdMap.get(fileName);
    } catch {}
    try {
      await bot.deleteMessage(this.telegramChannelId, messageId);
      await this.telegramMessageIdMap.del(fileName);
    } catch (error) {
      console.error("无法从 Telegram 删除:", fileName, error.message);
    }
  }

  public async syncSongs() {
    console.log("同步歌单:", this.name);
    await this.telegramMessageIdMap.open();
    const songs = await this.getAllSongs();
    // 这个用来在最后对比删除已经删除了的歌的链接
    const fileNamesInPlaylist: string[] = [];
    for (const song of songs) {
      const title = song.name;
      const id = song.id;
      // pc 那个适配云盘项目
      const artists: string[] = song.pc?.ar ? [song.pc.ar] : song.ar.map((ar) => ar.name);
      const album = song.pc?.alb || song.al.name;
      const picUrl = song.al.picUrl;
      const durationMs = song.dt;
      let fileNameBeforeExt = `${artists.join(" ")} - ${title}`.replace(/[\/\\]/g, "_");
      if (fileNameBeforeExt.length > 100) {
        fileNameBeforeExt = `${artists[0]} 等${artists.length}只 - ${title}`.replace(/[\/\\]/g, "_");
      }

      try {
        const type = this.pool.exists(id);
        let fileName: string;
        if (type) {
          fileName = `${fileNameBeforeExt}.${type}`;
          fileNamesInPlaylist.push(fileName);
          if (!this.localExists(fileName)) {
            console.log("链接:", fileName);
            this.linkSong(fileName, `${id}.${type}`);
          }
        } else {
          const download = (
            await nease.song_download_url({
              cookie: song.pc ? cookie : downloadCookie,
              id: song.id,
            })
          ).body.data as any;
          if (!download.type) {
            console.log("灰了或者需要会员，无法下载:", fileNameBeforeExt);
            continue;
          }
          const url = download.url;
          const type = download.type.toLowerCase();
          fileName = `${fileNameBeforeExt}.${type}`;
          fileNamesInPlaylist.push(fileName);
          console.log("下载:", fileName);
          await this.pool.download(id, url, type, title, artists, album, picUrl);
          this.linkSong(fileName, `${id}.${type}`);
        }
        if (this.telegramChannelId) {
          await this.uploadToChannel(fileName, title, artists.join(" "), picUrl, Math.floor(durationMs / 1000));
        }
      } catch (e) {
        console.log("处理失败", fileNameBeforeExt, e.message);
      }
    }
    const filesInDir = fs.readdirSync(this.dir);
    for (const i of filesInDir) {
      if (fileNamesInPlaylist.includes(i)) continue;
      console.log("删除:", i);
      this.unlinkSong(i);
      if (this.telegramChannelId) {
        await this.deleteFromChannel(i);
      }
    }
    console.log("同步完成:", this.name);
  }
}
