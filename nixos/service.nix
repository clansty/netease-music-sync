{ pkgs, lib, config, ... }:

let
  cfg = config.services.netease-music-sync;
in
{
  config = lib.mkIf cfg.enable {
    users = {
      users.netease-music-sync = {
        isSystemUser = true;
        createHome = true;
        home = "/var/lib/netease-music-sync";
        group = "netease-music-sync";
        description = "netease-music-sync service";
      };

      groups.netease-music-sync = { };
    };

    systemd.services.netease-music-sync = {
      description = "自动将网易云的歌单同步到本地";
      path = [ cfg.package ];
      wantedBy = [ "multi-user.target" ];
      after = [ "network-online.target" ];
      environment = {
        COOKIE = cfg.cookie;
        DOWNLOAD_COOKIE = cfg.download-cookie;
        DIR = cfg.download-dir;
        PLAYLISTS = cfg.playlists;
        TELEGRAM_CHANNELS = cfg.telegram-channels;
        TELEGRAM_TOKEN = cfg.telegram-token;
      };
      serviceConfig = {
        User = "netease-music-sync";
        Group = "netease-music-sync";
        Restart = "on-failure";
        ExecStart = "${cfg.package}/bin/netease-music-sync --experimental-fetch";
        WorkingDirectory = "${cfg.package}/libexec/netease-music-sync";
      };
    };
  };
}
