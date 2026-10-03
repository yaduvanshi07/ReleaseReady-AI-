import { describe, it, expect } from 'vitest';
import { BriefService } from '../src/services/briefService.js';

describe('BriefService (Release Brief Compilation)', () => {
  it('compiles full structured release brief and print-ready markdown', () => {
    const release = {
      name: 'CloudSync Service',
      version: 'v2.4.0',
      description: 'Major background file synchronization upgrade.',
      releaseDate: '2026-10-15',
      owner: 'Core Platform Team',
      qaSummary: 'Verified under network partition and high-latency conditions. 45 automated suites passed.',
      items: [
        { code: 'REL-001', category: 'feature', title: 'Delta Sync Protocol', description: 'Synchronizes binary diffs only' },
        { code: 'REL-002', category: 'bug_fix', title: 'Fix file lock conflict on Windows', description: 'Handles sharing violations gracefully' },
        { code: 'REL-003', category: 'changed_behavior', title: 'Default sync interval set to 30s', description: 'Reduced from 60s' },
        { code: 'REL-004', category: 'known_limitation', title: 'Files over 2GB require ChunkedTransfer', description: 'Single-stream sync capped at 2GB' },
        { code: 'REL-005', category: 'migration_note', title: 'Database schema migration v4 required', description: 'Run npm run db:migrate' },
        { code: 'REL-006', category: 'affected_user_group', title: 'Desktop app users', description: 'Windows and macOS clients' }
      ],
      evidence: [
        { code: 'QA-001', type: 'test_suite', title: 'Partition Chaos Suite', details: 'All 12 chaos test scenarios passed', status: 'passed' },
        { code: 'QA-002', type: 'benchmark', title: 'Delta Sync Benchmark', details: '85% bandwidth reduction verified', status: 'passed' }
      ]
    };

    const statements = [
      {
        id: 'STMT-001',
        statementType: 'technical_summary',
        originalContent: 'Delta sync protocol optimizes bandwidth [REL-001].',
        currentContent: 'Delta sync protocol optimizes network bandwidth by 85% [REL-001, QA-002].',
        reviewState: 'accepted',
        isStale: false
      },
      {
        id: 'STMT-002',
        statementType: 'stakeholder_summary',
        originalContent: 'Users experience faster sync speeds.',
        currentContent: 'Users experience up to 5x faster file syncing with reduced data consumption.',
        reviewState: 'accepted',
        isStale: false
      }
    ];

    const { briefData, markdown } = BriefService.generateBrief(release, statements);

    expect(briefData.releaseName).toBe('CloudSync Service');
    expect(briefData.version).toBe('v2.4.0');
    expect(briefData.isDeterministicReady).toBe(true);
    expect(briefData.isFullyReviewed).toBe(true);
    expect(briefData.technicalSummary).toContain('Delta sync protocol optimizes network bandwidth');
    expect(briefData.stakeholderSummary).toContain('Users experience up to 5x faster file syncing');
    expect(briefData.sections.completedFeatures.length).toBe(1);
    expect(briefData.sections.bugFixes.length).toBe(1);
    expect(briefData.sections.changedBehavior.length).toBe(1);
    expect(briefData.sections.knownLimitations.length).toBe(1);
    expect(briefData.sections.migrationNotes.length).toBe(1);
    expect(briefData.sections.affectedUserGroups.length).toBe(1);
    expect(briefData.sections.qaEvidence.length).toBe(2);

    expect(markdown).toContain('# Release Brief: CloudSync Service (v2.4.0)');
    expect(markdown).toContain('## 1. Executive Summary');
    expect(markdown).toContain('## 2. Technical Summary');
    expect(markdown).toContain('## 3. Stakeholder Summary');
    expect(markdown).toContain('## 4. Completed Features');
    expect(markdown).toContain('## 7. QA Summary & Test Evidence');
    expect(markdown).toContain('[REL-001]');
    expect(markdown).toContain('[QA-001]');
  });

  it('flags unreviewed or stale statements in the generated brief', () => {
    const release = {
      name: 'Minimal Release',
      version: 'v1.0.0',
      items: [],
      evidence: []
    };

    const statements = [
      {
        id: 'STMT-001',
        statementType: 'technical_summary',
        originalContent: 'Some claim',
        currentContent: 'Some claim',
        reviewState: 'generated',
        isStale: true,
        staleReason: 'Source REL-001 was updated'
      }
    ];

    const { briefData, markdown } = BriefService.generateBrief(release, statements);
    expect(briefData.isFullyReviewed).toBe(false);
    expect(briefData.reviewSummary.staleCount).toBe(1);
    expect(briefData.risksAndWarnings.some(w => w.includes('stale'))).toBe(true);
    expect(markdown).toContain('PENDING REVIEW');
  });
});
