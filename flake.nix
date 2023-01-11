{
  description = "Flake that configures Netease Music Sync";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.11";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    {
      packages = nixpkgs.lib.mapAttrs
        (system: pkgs: {
          default = import ./default.nix { inherit pkgs; };
        })
        nixpkgs.legacyPackages;
      nixosModules.default = import ./nixos/module.nix { inherit self; };
    } // flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          flakePkgs = self.packages.${system};
        in
        {
          devShells.default = import ./shell.nix { inherit pkgs flakePkgs; };
        }
      );
}
