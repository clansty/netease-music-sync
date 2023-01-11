{ pkgs, flakePkgs }:
pkgs.mkShell {
  buildInputs = with pkgs; with flakePkgs; [
    yarn
    nodejs-18_x
  ];
}
