
export interface ConfigFunctions {
  functionName: string;
  argumentPosition: number;
  configPath: string;
  descriptionTemplate?: string;
  parser: (value: any) => string[];
}
