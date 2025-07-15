import * as fs from 'fs/promises';
import { Stats } from 'fs';
import * as path from 'path';

/**
 * Utility functions for safe JSON file operations
 * All paths are relative to the backend/data directory
 */

const DATA_ROOT = path.join(__dirname, '../../data');

/**
 * Read JSON file from the data directory
 */
export async function readJsonFile(relativePath: string): Promise<any> {
  try {
    const fullPath = path.join(DATA_ROOT, relativePath);
    console.log(`[FileOps] Reading: ${fullPath}`);
    
    const fileContent = await fs.readFile(fullPath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      console.log(`[FileOps] File not found: ${relativePath}`);
      throw new Error(`File not found: ${relativePath}`);
    }
    console.error(`[FileOps] Error reading ${relativePath}:`, error);
    throw new Error(`Error reading file: ${relativePath}`);
  }
}

/**
 * Write JSON file to the data directory
 */
export async function writeJsonFile(relativePath: string, data: any): Promise<void> {
  try {
    const fullPath = path.join(DATA_ROOT, relativePath);
    console.log(`[FileOps] Writing: ${fullPath}`);
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(fullPath, jsonString, 'utf8');
    
    console.log(`[FileOps] Successfully wrote: ${relativePath}`);
  } catch (error) {
    console.error(`[FileOps] Error writing ${relativePath}:`, error);
    throw new Error(`Error writing file: ${relativePath}`);
  }
}

/**
 * List all survey files, optionally filtered by orderId
 */
export async function listSurveyFiles(orderId?: string): Promise<string[]> {
  try {
    const surveysDir = path.join(DATA_ROOT, 'surveys');
    console.log(`[FileOps] Listing survey files in: ${surveysDir}`);
    
    // Ensure surveys directory exists
    try {
      await fs.access(surveysDir);
    } catch {
      await fs.mkdir(surveysDir, { recursive: true });
      return [];
    }
    
    const files = await fs.readdir(surveysDir);
    const surveyFiles = files.filter(file => 
      file.startsWith('survey-') && file.endsWith('.json')
    );
    
    if (orderId) {
      const filtered = surveyFiles.filter(file => 
        file.includes(`survey-${orderId}-`)
      );
      console.log(`[FileOps] Found ${filtered.length} files for order ${orderId}`);
      return filtered;
    }
    
    console.log(`[FileOps] Found ${surveyFiles.length} survey files`);
    return surveyFiles;
  } catch (error) {
    console.error(`[FileOps] Error listing survey files:`, error);
    throw new Error('Error listing survey files');
  }
}

/**
 * Delete a survey file
 */
export async function deleteSurveyFile(filename: string): Promise<void> {
  try {
    const fullPath = path.join(DATA_ROOT, 'surveys', filename);
    console.log(`[FileOps] Deleting: ${fullPath}`);
    
    await fs.unlink(fullPath);
    console.log(`[FileOps] Successfully deleted: ${filename}`);
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      console.log(`[FileOps] File already deleted: ${filename}`);
      return; // File doesn't exist, which is fine
    }
    console.error(`[FileOps] Error deleting ${filename}:`, error);
    throw new Error(`Error deleting file: ${filename}`);
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(relativePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(DATA_ROOT, relativePath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file stats (modification time, etc.)
 */
export async function getFileStats(relativePath: string): Promise<Stats> {
  try {
    const fullPath = path.join(DATA_ROOT, relativePath);
    return await fs.stat(fullPath);
  } catch (error) {
    console.error(`[FileOps] Error getting stats for ${relativePath}:`, error);
    throw new Error(`Error getting file stats: ${relativePath}`);
  }
}

/**
 * Generate survey file path
 */
export function getSurveyFilePath(orderId: string, status: 'inprogress' | 'completed', timestamp?: string): string {
  if (status === 'inprogress') {
    return `surveys/survey-${orderId}-inprogress.json`;
  } else {
    const ts = timestamp || new Date().toISOString().replace(/[:.]/g, '-');
    return `surveys/survey-${orderId}-${ts}.json`;
  }
}