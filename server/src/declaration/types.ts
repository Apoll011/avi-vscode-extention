// declaration/types.ts
import { ConfigFunctions } from '../types';

export interface DeclarationRegistry {
  configEntries: ConfigFunctions[];
}

export interface SymbolInfo {
  name: string;
  line: number;
  character: number;
}