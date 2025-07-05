export interface CliArgs {
  baseUrl: string;
  watch: boolean;
  delay: number;
  output: string;
  exclude: string;
  viewsOnly: boolean;
}

export interface TypeGeneratorOptions {
  baseUrl: string;
  watch: boolean;
  watchDelay: number;
  exclude: string[];
  output: string;
}
