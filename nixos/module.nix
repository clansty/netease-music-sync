{ self }:
{ pkgs, config, ... }:

with pkgs.lib;
{
  imports = [
    ./service.nix
  ];
  options.services.netease-music-sync = {
    enable = mkEnableOption "Enables Netease Music Sync service";
    package = mkOption {
      type = types.package;
      default = self.packages.${pkgs.system}.default;
    };
    cookie = mkOption {
      type = types.str;
    };
    download-cookie = mkOption {
      type = types.str;
      default = "";
    };
    download-dir = mkOption {
      type = types.str;
    };
    playlists = mkOption {
      type = types.str;
    };
    telegram-token = mkOption {
      type = types.str;
    };
    telegram-channels = mkOption {
      type = types.str;
    };
    telegram-api-base = mkOption {
      type = types.str;
      default = "https://api.telegram.org";
    };
  };
}
