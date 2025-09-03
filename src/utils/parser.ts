import type { Idea, ImpactLevel, CSVRow, ImportResult, ValidationError } from '../types';
import { validateIdea } from '../score';
import { generateId } from './persistence';

/**
 * Parse structured paste format: "Title | I:2 | C:0.8 | E:1.5 | R:600 | T:feature,ui"
 */
export function parseStructuredText(text: string): Partial<Idea>[] {
  const lines = text.split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    const idea: Partial<Idea> = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      provenance: {}
    };
    
    // Check if line contains structured format
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      idea.title = parts[0];
      
      // Parse structured parts
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        
        if (part.startsWith('I:')) {
          const impact = parseFloat(part.substring(2));
          if (isValidImpact(impact)) {
            idea.impact = impact as ImpactLevel;
            idea.provenance!.impact = 'user';
          }
        } else if (part.startsWith('C:')) {
          const confidence = parseFloat(part.substring(2));
          if (confidence >= 0 && confidence <= 1) {
            idea.confidence = confidence;
            idea.provenance!.confidence = 'user';
          }
        } else if (part.startsWith('E:')) {
          const effort = parseFloat(part.substring(2));
          if (effort > 0) {
            idea.effort = effort;
            idea.provenance!.effort = 'user';
          }
        } else if (part.startsWith('R:')) {
          const reach = parseInt(part.substring(2));
          if (reach > 0) {
            idea.reach = reach;
            idea.provenance!.reach = 'user';
          }
        } else if (part.startsWith('T:')) {
          const tags = part.substring(2).split(',').map(t => t.trim()).filter(t => t);
          if (tags.length > 0) {
            idea.tags = tags;
          }
        }
      }
    } else {
      // Simple title-only format
      idea.title = line;
    }
    
    return idea;
  });
}

/**
 * Parse CSV content for import
 */
export function parseCSV(csvContent: string): ImportResult {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    return { success: [], errors: [{ row: 0, errors: [{ field: 'title', message: 'CSV must have headers and at least one data row' }] }] };
  }
  
  const headers = parseCSVRow(lines[0]);
  const success: Idea[] = [];
  const errors: Array<{ row: number; errors: ValidationError[] }> = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i]);
    const rowData: CSVRow = { title: '' };
    
    // Map values to headers
    headers.forEach((header, index) => {
      if (values[index]) {
        rowData[header.toLowerCase() as keyof CSVRow] = values[index];
      }
    });
    
    try {
      const idea = csvRowToIdea(rowData);
      const validationErrors = validateIdea(idea, 'RICE'); // Use RICE for most comprehensive validation
      
      if (validationErrors.length === 0) {
        success.push(idea as Idea);
      } else {
        errors.push({
          row: i,
          errors: validationErrors.map(msg => ({ field: 'title' as keyof Idea, message: msg }))
        });
      }
    } catch (error) {
      errors.push({
        row: i,
        errors: [{ field: 'title' as keyof Idea, message: error instanceof Error ? error.message : 'Invalid row data' }]
      });
    }
  }
  
  return { success, errors };
}

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function csvRowToIdea(row: CSVRow): Partial<Idea> {
  const idea: Partial<Idea> = {
    id: generateId(),
    title: row.title || '',
    notes: row.notes || undefined,
    createdAt: new Date().toISOString(),
    provenance: {}
  };
  
  if (row.reach) {
    const reach = parseInt(row.reach);
    if (!isNaN(reach) && reach > 0) {
      idea.reach = reach;
      idea.provenance!.reach = 'user';
    }
  }
  
  if (row.impact) {
    const impact = parseFloat(row.impact);
    if (isValidImpact(impact)) {
      idea.impact = impact as ImpactLevel;
      idea.provenance!.impact = 'user';
    }
  }
  
  if (row.confidence) {
    const confidence = parseFloat(row.confidence);
    if (!isNaN(confidence) && confidence >= 0 && confidence <= 1) {
      idea.confidence = confidence;
      idea.provenance!.confidence = 'user';
    }
  }
  
  if (row.effort) {
    const effort = parseFloat(row.effort);
    if (!isNaN(effort) && effort > 0) {
      idea.effort = effort;
      idea.provenance!.effort = 'user';
    }
  }
  
  if (row.tags) {
    const tags = row.tags.split(',').map(t => t.trim()).filter(t => t);
    if (tags.length > 0) {
      idea.tags = tags;
    }
  }
  
  return idea;
}

function isValidImpact(value: number): boolean {
  return [0.25, 0.5, 1, 2, 3].includes(value);
}

/**
 * Format filename for export
 */
export function formatExportFilename(model: string, format: 'csv' | 'md'): string {
  const date = new Date().toISOString().split('T')[0];
  return `pm-prioboard-${model.toLowerCase()}-${date}.${format}`;
}
