import 'dotenv/config';
import nease from 'NeteaseCloudMusicApi';
import { Pool } from './models/Pool';
import path from 'path';

const cookie = process.env.COOKIE;
const baseDir = process.env.DIR;
const playlists = process.env.PLAYLISTS.split(',');

(async () => {
  // 坏诶，是 anyScript
  // const uid = (await nease.login_status({ cookie }) as any).body.data.account.id;
  const detail = await nease.song_detail({ cookie, ids: '1420502946' });
  const song = detail.body.songs[0];
  console.log(song);
  const download = (await nease.song_download_url({ cookie, id: song.id })).body.data as any;
  const pool = new Pool(path.join(baseDir, 'pool'));
  await pool.download(song.id, download.url, download.type, song.name, song.ar.map(ar => ar.name), song.al.name, song.al.picUrl);
})();
