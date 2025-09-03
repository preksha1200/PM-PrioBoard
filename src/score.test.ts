import { describe, it, expect } from 'vitest';
import { 
  scoreICE, 
  scoreRICE, 
  calculateScore, 
  getIdeaStatus, 
  sortIdeasByScore,
  calculateMedians,

  validateIdea
} from './score';
import type { Idea } from './types';

describe('Scoring Functions', () => {
  const sampleIdea: Idea = {
    id: '1',
    title: 'Test Idea',
    impact: 2,
    confidence: 0.8,
    effort: 1.5,
    reach: 1000,
    createdAt: new Date().toISOString()
  };

  describe('scoreICE', () => {
    it('calculates ICE score correctly', () => {
      const score = scoreICE(sampleIdea);
      expect(score).toBeCloseTo(1.067, 2); // (2 * 0.8) / 1.5
    });

    it('returns null for invalid effort', () => {
      const invalidIdea = { ...sampleIdea, effort: 0 };
      expect(scoreICE(invalidIdea)).toBeNull();
    });

    it('applies weights correctly', () => {
      const weights = { reach: 1, impact: 2, confidence: 1, effort: 1 };
      const score = scoreICE(sampleIdea, weights);
      expect(score).toBeCloseTo(2.133, 2); // (2^2 * 0.8) / 1.5
    });
  });

  describe('scoreRICE', () => {
    it('calculates RICE score correctly', () => {
      const score = scoreRICE(sampleIdea);
      expect(score).toBeCloseTo(1066.67, 2); // (1000 * 2 * 0.8) / 1.5
    });

    it('returns null for missing reach', () => {
      const noReachIdea = { ...sampleIdea, reach: undefined };
      expect(scoreRICE(noReachIdea)).toBeNull();
    });

    it('returns null for invalid reach', () => {
      const invalidReachIdea = { ...sampleIdea, reach: 0 };
      expect(scoreRICE(invalidReachIdea)).toBeNull();
    });

    it('applies weights correctly', () => {
      const weights = { reach: 1, impact: 2, confidence: 1, effort: 1 };
      const score = scoreRICE(sampleIdea, weights);
      expect(score).toBeCloseTo(2133.33, 2); // (1000 * 2^2 * 0.8) / 1.5
    });
  });

  describe('calculateScore', () => {
    it('uses ICE model correctly', () => {
      const score = calculateScore(sampleIdea, 'ICE');
      expect(score).toBeCloseTo(1.067, 2);
    });

    it('uses RICE model correctly', () => {
      const score = calculateScore(sampleIdea, 'RICE');
      expect(score).toBeCloseTo(1066.67, 2);
    });
  });

  describe('getIdeaStatus', () => {
    it('returns valid for complete idea', () => {
      expect(getIdeaStatus(sampleIdea, 'ICE')).toBe('valid');
      expect(getIdeaStatus(sampleIdea, 'RICE')).toBe('valid');
    });

    it('returns invalid for zero effort', () => {
      const invalidIdea = { ...sampleIdea, effort: 0 };
      expect(getIdeaStatus(invalidIdea, 'ICE')).toBe('invalid');
      expect(getIdeaStatus(invalidIdea, 'RICE')).toBe('invalid');
    });

    it('returns incomplete for RICE without reach', () => {
      const incompleteIdea = { ...sampleIdea, reach: undefined };
      expect(getIdeaStatus(incompleteIdea, 'ICE')).toBe('valid');
      expect(getIdeaStatus(incompleteIdea, 'RICE')).toBe('incomplete');
    });
  });

  describe('sortIdeasByScore', () => {
    const ideas: Idea[] = [
      { ...sampleIdea, id: '1', impact: 1, score: 0.5 },
      { ...sampleIdea, id: '2', impact: 3, score: 2.0 },
      { ...sampleIdea, id: '3', impact: 2, score: 1.0 }
    ];

    it('sorts by score descending', () => {
      const sorted = sortIdeasByScore(ideas, 'ICE');
      expect(sorted[0].id).toBe('2'); // highest score
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1'); // lowest score
    });

    it('tie-breaks by higher impact', () => {
      const tiedIdeas: Idea[] = [
        { ...sampleIdea, id: '1', impact: 1, effort: 1, score: 1.0 },
        { ...sampleIdea, id: '2', impact: 2, effort: 1, score: 1.0 }
      ];
      const sorted = sortIdeasByScore(tiedIdeas, 'ICE');
      expect(sorted[0].id).toBe('2'); // higher impact wins
    });

    it('tie-breaks by lower effort when impact is same', () => {
      const tiedIdeas: Idea[] = [
        { ...sampleIdea, id: '1', impact: 2, effort: 2, score: 1.0 },
        { ...sampleIdea, id: '2', impact: 2, effort: 1, score: 1.0 }
      ];
      const sorted = sortIdeasByScore(tiedIdeas, 'ICE');
      expect(sorted[0].id).toBe('2'); // lower effort wins
    });
  });

  describe('calculateMedians', () => {
    const ideas: Idea[] = [
      { ...sampleIdea, id: '1', effort: 1, impact: 1 },
      { ...sampleIdea, id: '2', effort: 2, impact: 2 },
      { ...sampleIdea, id: '3', effort: 3, impact: 3 }
    ];

    it('calculates medians correctly', () => {
      const medians = calculateMedians(ideas, 'ICE');
      expect(medians.effort).toBe(2);
      expect(medians.impact).toBe(2);
    });

    it('returns defaults for empty array', () => {
      const medians = calculateMedians([], 'ICE');
      expect(medians.effort).toBe(1);
      expect(medians.impact).toBe(1);
    });
  });

  describe('validateIdea', () => {
    it('validates complete idea', () => {
      const errors = validateIdea(sampleIdea, 'ICE');
      expect(errors).toHaveLength(0);
    });

    it('requires title', () => {
      const noTitle = { ...sampleIdea, title: '' };
      const errors = validateIdea(noTitle, 'ICE');
      expect(errors).toContain('Title is required');
    });

    it('validates effort > 0', () => {
      const invalidEffort = { ...sampleIdea, effort: 0 };
      const errors = validateIdea(invalidEffort, 'ICE');
      expect(errors).toContain('Effort must be greater than 0');
    });

    it('validates confidence range', () => {
      const invalidConfidence = { ...sampleIdea, confidence: 1.5 };
      const errors = validateIdea(invalidConfidence, 'ICE');
      expect(errors).toContain('Confidence must be between 0 and 1');
    });

    it('validates reach for RICE model', () => {
      const noReach = { ...sampleIdea, reach: 0 };
      const errors = validateIdea(noReach, 'RICE');
      expect(errors).toContain('Reach must be greater than 0 for RICE model');
    });
  });
});
