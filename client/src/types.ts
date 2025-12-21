// ============================================================================
// Domain Models
// ============================================================================

export interface Manifest {
  id: string;
  name: string;
  description: string;
  entry: string;
  capabilities: string[];
  permissions: string[];
  author?: string;
  version: string;
}

export interface Setting {
  value: any;
  vtype: string;
  description?: string;
  ui?: string;
  required?: boolean;
  min?: number;
  max?: number;
  enum_?: string[];
  group?: string;
  advanced?: boolean;
}

export interface SettingsConfig {
  settings: Record<string, Setting>;
}

export interface ConstantsConfig {
  constants: Record<string, string>;
}

export interface Entity {
  type: 'entity';
  name: string;
  automatically_extensible: boolean;
  values: string[];
}

export interface Intent {
  type: 'intent';
  name: string;
  utterances: string[];
}

export interface LangFile {
  code: string;
  lang: Record<string, string>;
}

export interface AviFile {
  path: string;
  content: string;
}

export class SkillWorkspace {
  constructor(
    public rootPath: string,
    public manifest: Manifest,
    public entryFile: AviFile,
    public aviFiles: AviFile[] = [],
    public intents: Intent[] = [],
    public entities: Entity[] = [],
    public responses: LangFile[] = [],
    public constants?: ConstantsConfig,
    public settings?: SettingsConfig
  ) {}
}

export interface IntentResponse {
  input: string;
  intent: {
    intentName: string | null;
    probability: number;
  } | null;
  slots: Array<{
    rawValue: string;
    value: {
      kind: string;
      value: any;
      grain?: string;
      precision?: string;
    };
    entity: string;
    slotName: string;
    range: {
      start: number;
      end: number;
    };
  }>;
}

export interface TestHistory {
  utterance: string;
  intent: string | null;
  confidence: number;
  timestamp: number;
}
