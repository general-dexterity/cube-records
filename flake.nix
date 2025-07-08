{
  description = "Cube Records development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            duckdb
            corepack_22
            nodejs_22
            typescript
          ];

          shellHook = ''
            export PATH="node_modules/.bin:$PATH"
            echo "Cube Records development environment"
            echo "Node.js: $(node --version)"
            echo "pnpm: $(pnpm --version 2>/dev/null || echo 'not installed - run corepack enable')"
            echo "DuckDB: $(duckdb --version)"
          '';
        };
      });
}