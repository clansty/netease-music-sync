import 'dotenv/config';
import nease from 'NeteaseCloudMusicApi';
import Pool from './models/Pool';
import path from 'path';
import PlayList from './models/PlayList';
import sleep from 'sleep-promise';

const cookie = process.env.COOKIE;
const baseDir = process.env.DIR;
const playlistIds = process.env.PLAYLISTS.split(',');

(async () => {
  // 坏诶，是 anyScript
  const pool = new Pool(path.join(baseDir, 'pool'));
  const playlists: PlayList[] = [];
  for (const playlistId of playlistIds) {
    const playlist = new PlayList(
      (await nease.playlist_detail({ id: playlistId, cookie })).body.playlist, baseDir, pool);
    playlists.push(playlist);
  }
  console.log('初始化成功');
  while (true) {
    for (const playlist of playlists) {
      await playlist.syncSongs();
    }
    await sleep(1000 * 60 * 60);
  }
})();
