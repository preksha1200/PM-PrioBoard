import { describe, it, expect } from 'vitest';
import { parseStructuredText, parseCSV, formatExportFilename } from './parser';

describe('Parser Functions', () => {
  describe('parseStructuredText', () => {
    it('parses simple titles', () => {
      const input = 'Simple idea\nAnother idea';
      const result = parseStructuredText(input);
      
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Simple idea');
      expect(result[1].title).toBe('Another idea');
    });

    it('parses structured format with all fields', () => {
      const input = 'Test idea | I:2 | C:0.8 | E:1.5 | R:1000 | T:ui,feature';
      const result = parseStructuredText(input);
      
      expect(result).toHaveLength(1);
      const idea = result[0];
      expect(idea.title).toBe('Test idea');
      expect(idea.impact).toBe(2);
      expect(idea.confidence).toBe(0.8);
      expect(idea.effort).toBe(1.5);
      expect(idea.reach).toBe(1000);
      expect(idea.tags).toEqual(['ui', 'feature']);
    });

    it('parses partial structured format', () => {
      const input = 'Partial idea | I:3 | E:2';
      const result = parseStructuredText(input);
      
      expect(result).toHaveLength(1);
      const idea = result[0];
      expect(idea.title).toBe('Partial idea');
      expect(idea.impact).toBe(3);
      expect(idea.effort).toBe(2);
      expect(idea.confidence).toBeUndefined();
      expect(idea.reach).toBeUndefined();
    });

    it('handles invalid values gracefully', () => {
      const input = 'Invalid | I:invalid | C:2.0 | E:-1';
      const result = parseStructuredText(input);
      
      expect(result).toHaveLength(1);
      const idea = result[0];
      expect(idea.title).toBe('Invalid');
      expect(idea.impact).toBeUndefined(); // invalid impact ignored
      expect(idea.confidence).toBeUndefined(); // >1 confidence ignored
      expect(idea.effort).toBeUndefined(); // negative effort ignored
    });

    it('sets provenance for parsed fields', () => {
      const input = 'Test | I:2 | C:0.8';
      const result = parseStructuredText(input);
      
      expect(result[0].provenance?.impact).toBe('user');
      expect(result[0].provenance?.confidence).toBe('user');
    });
  });

  describe('parseCSV', () => {
    it('parses valid CSV with headers', () => {
      const csv = `title,impact,confidence,effort,reach,tags
"Test idea",2,0.8,1.5,1000,"ui,feature"
"Another idea",1,0.9,0.5,500,"backend"`;
      
      const result = parseCSV(csv);
      
      expect(result.success).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      
      const firstIdea = result.success[0];
      expect(firstIdea.title).toBe('Test idea');
      expect(firstIdea.impact).toBe(2);
      expect(firstIdea.confidence).toBe(0.8);
      expect(firstIdea.effort).toBe(1.5);
      expect(firstIdea.reach).toBe(1000);
      expect(firstIdea.tags).toEqual(['ui', 'feature']);
    });

    it('handles CSV with quoted fields containing commas', () => {
      const csv = `title,notes,tags
"Complex idea","This has, commas in it","ui,feature,complex"`;
      
      const result = parseCSV(csv);
      
      expect(result.success).toHaveLength(1);
      const idea = result.success[0];
      expect(idea.title).toBe('Complex idea');
      expect(idea.notes).toBe('This has, commas in it');
      expect(idea.tags).toEqual(['ui', 'feature', 'complex']);
    });

    it('handles empty CSV gracefully', () => {
      const result = parseCSV('');
      expect(result.success).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
    });

    it('handles CSV with only headers', () => {
      const csv = 'title,impact,confidence,effort';
      const result = parseCSV(csv);
      expect(result.success).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
    });

    it('reports validation errors', () => {
      const csv = `title,impact,confidence,effort
"",2,0.8,1.5
"Valid idea",2,0.8,0`;
      
      const result = parseCSV(csv);
      
      expect(result.success).toHaveLength(0);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].row).toBe(1);
      expect(result.errors[1].row).toBe(2);
    });
  });

  describe('formatExportFilename', () => {
    it('formats CSV filename correctly', () => {
      // Mock date to ensure consistent testing
      const mockDate = new Date('2024-01-15');
      const originalToISOString = Date.prototype.toISOString;
      Date.prototype.toISOString = () => mockDate.toISOString();
      
      const filename = formatExportFilename('ICE', 'csv');
      expect(filename).toBe('pm-prioboard-ice-2024-01-15.csv');
      
      // Restore original method
      Date.prototype.toISOString = originalToISOString;
    });

    it('formats Markdown filename correctly', () => {
      const mockDate = new Date('2024-01-15');
      const originalToISOString = Date.prototype.toISOString;
      Date.prototype.toISOString = () => mockDate.toISOString();
      
      const filename = formatExportFilename('RICE', 'md');
      expect(filename).toBe('pm-prioboard-rice-2024-01-15.md');
      
      Date.prototype.toISOString = originalToISOString;
    });
  });
});
