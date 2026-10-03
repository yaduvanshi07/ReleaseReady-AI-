import { describe, it, expect } from 'vitest';
import { ComparisonService } from '../src/services/comparisonService.js';

describe('ComparisonService (Version Diffing)', () => {
  it('accurately identifies added, removed, and modified items', () => {
    const baseSnapshot = {
      versionLabel: 'v1.0.0',
      snapshotData: {
        release: { name: 'App', version: 'v1.0.0', qaSummary: 'Base summary' },
        items: [
          { code: 'REL-001', category: 'feature', title: 'Login with Email', description: 'Original login' },
          { code: 'REL-002', category: 'bug_fix', title: 'Fix CSS button glitch', description: 'Button style' }
        ],
        evidence: [
          { code: 'QA-001', type: 'test_suite', title: 'E2E Login Tests', details: 'All passed', status: 'passed' }
        ]
      }
    };

    const targetSnapshot = {
      versionLabel: 'v1.1.0',
      snapshotData: {
        release: { name: 'App', version: 'v1.1.0', qaSummary: 'Updated summary' },
        items: [
          { code: 'REL-001', category: 'feature', title: 'Login with Email & Phone', description: 'Updated login' }, // Modified
          { code: 'REL-003', category: 'feature', title: 'Dark Mode Support', description: 'New theme' } // Added (REL-002 removed)
        ],
        evidence: [
          { code: 'QA-001', type: 'test_suite', title: 'E2E Login Tests', details: 'All passed', status: 'passed' }, // Unchanged
          { code: 'QA-002', type: 'manual_test', title: 'Dark Mode Verification', details: 'Manual tests passed', status: 'passed' } // Added
        ]
      }
    };

    const diff = ComparisonService.compare(baseSnapshot, targetSnapshot);

    expect(diff.hasDifferences).toBe(true);
    expect(diff.itemDiff.added.length).toBe(1);
    expect(diff.itemDiff.added[0].code).toBe('REL-003');

    expect(diff.itemDiff.removed.length).toBe(1);
    expect(diff.itemDiff.removed[0].code).toBe('REL-002');

    expect(diff.itemDiff.modified.length).toBe(1);
    expect(diff.itemDiff.modified[0].item.code).toBe('REL-001');
    expect(diff.itemDiff.modified[0].changes.some(c => c.field === 'title')).toBe(true);

    expect(diff.evidenceDiff.added.length).toBe(1);
    expect(diff.evidenceDiff.added[0].code).toBe('QA-002');
    expect(diff.evidenceDiff.unchanged.length).toBe(1);
    expect(diff.evidenceDiff.unchanged[0].code).toBe('QA-001');
  });
});
