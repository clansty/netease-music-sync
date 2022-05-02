import 'dotenv/config';
import nease from 'NeteaseCloudMusicApi';
import Pool from './models/Pool';
import path from 'path';
import PlayList from './models/PlayList';

const cookie = process.env.COOKIE;
const baseDir = process.env.DIR;
const playlists = process.env.PLAYLISTS.split(',');

(async () => {
  // 坏诶，是 anyScript
  const pool = new Pool(path.join(baseDir, 'pool'));
  const playlist = new PlayList(
    (await nease.playlist_detail({ id: playlists[0], cookie })).body.playlist, baseDir, pool);
  await playlist.syncSongs();
})();
