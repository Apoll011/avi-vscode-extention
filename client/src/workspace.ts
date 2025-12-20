// ============================================================================
// Core Extension Implementation
// ============================================================================

import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { SkillWorkspace, Manifest, AviFile, Intent, Entity, LangFile, ConstantsConfig, SettingsConfig } from './types';

export async function detectSkillWorkspace(workspaceFolder: vscode.WorkspaceFolder): Promise<SkillWorkspace | null> {
  const manifestPath = path.join(workspaceFolder.uri.fsPath, 'manifest.yaml');
  
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = yaml.load(manifestContent) as Manifest;

    // Validate entry file exists
    const entryPath = path.join(workspaceFolder.uri.fsPath, manifest.entry);
    if (!fs.existsSync(entryPath)) {
      vscode.window.showErrorMessage(`Entry file ${manifest.entry} not found`);
      return null;
    }

    const entryFile: AviFile = {
      path: entryPath,
      content: fs.readFileSync(entryPath, 'utf8')
    };

    // Load all .avi files
    const aviFiles = await loadAviFiles(workspaceFolder.uri.fsPath);
    
    // Load intents
    const intents = await loadIntents(workspaceFolder.uri.fsPath);
    
    // Load entities
    const entities = await loadEntities(workspaceFolder.uri.fsPath);
    
    // Load responses
    const responses = await loadResponses(workspaceFolder.uri.fsPath);
    
    // Load configs
    const constants = await loadConstants(workspaceFolder.uri.fsPath);
    const settings = await loadSettings(workspaceFolder.uri.fsPath);

    return new SkillWorkspace(
      workspaceFolder.uri.fsPath,
      manifest,
      entryFile,
      aviFiles,
      intents,
      entities,
      responses,
      constants,
      settings
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to load skill workspace: ${error}`);
    return null;
  }
}

async function loadAviFiles(rootPath: string): Promise<AviFile[]> {
  const files: AviFile[] = [];
  const pattern = new vscode.RelativePattern(rootPath, '**/*.avi');
  const uris = await vscode.workspace.findFiles(pattern);
  
  for (const uri of uris) {
    files.push({
      path: uri.fsPath,
      content: fs.readFileSync(uri.fsPath, 'utf8')
    });
  }
  
  return files;
}

async function loadIntents(rootPath: string): Promise<Intent[]> {
  const intents: Intent[] = [];
  const intentDir = path.join(rootPath, 'intent', 'intents');
  
  if (!fs.existsSync(intentDir)) return intents;
  
  const files = fs.readdirSync(intentDir).filter(f => f.endsWith('.intent'));
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(intentDir, file), 'utf8');
      const intent = yaml.load(content) as Intent;
      intents.push(intent);
    } catch (error) {
      console.error(`Failed to load intent ${file}:`, error);
    }
  }
  
  return intents;
}

async function loadEntities(rootPath: string): Promise<Entity[]> {
  const entities: Entity[] = [];
  const entityDir = path.join(rootPath, 'intent', 'entities');
  
  if (!fs.existsSync(entityDir)) return entities;
  
  const files = fs.readdirSync(entityDir).filter(f => f.endsWith('.entity'));
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(entityDir, file), 'utf8');
      const entity = yaml.load(content) as Entity;
      entities.push(entity);
    } catch (error) {
      console.error(`Failed to load entity ${file}:`, error);
    }
  }
  
  return entities;
}

async function loadResponses(rootPath: string): Promise<LangFile[]> {
  const responses: LangFile[] = [];
  const responseDir = path.join(rootPath, 'responses');
  
  if (!fs.existsSync(responseDir)) return responses;
  
  const files = fs.readdirSync(responseDir).filter(f => f.endsWith('.lang'));
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(responseDir, file), 'utf8');
      const langFile = yaml.load(content) as LangFile;
      responses.push(langFile);
    } catch (error) {
      console.error(`Failed to load response ${file}:`, error);
    }
  }
  
  return responses;
}

async function loadConstants(rootPath: string): Promise<ConstantsConfig | undefined> {
  const constantsPath = path.join(rootPath, 'config', 'const.config');
  
  if (!fs.existsSync(constantsPath)) return undefined;
  
  try {
    const content = fs.readFileSync(constantsPath, 'utf8');
    return yaml.load(content) as ConstantsConfig;
  } catch (error) {
    console.error('Failed to load constants:', error);
    return undefined;
  }
}

async function loadSettings(rootPath: string): Promise<SettingsConfig | undefined> {
  const settingsPath = path.join(rootPath, 'config', 'settings.config');
  
  if (!fs.existsSync(settingsPath)) return undefined;
  
  try {
    const content = fs.readFileSync(settingsPath, 'utf8');
    return yaml.load(content) as SettingsConfig;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return undefined;
  }
}
