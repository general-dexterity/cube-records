{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShell {
  packages = [
    pkgs.nodejs_22
    pkgs.corepack_22
  ];

  shellHook = ''
    export PATH="node_modules/.bin:$PATH"
  '';
}
