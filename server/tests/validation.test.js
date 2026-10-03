import { describe, it, expect } from 'vitest';
import { ValidationService } from '../src/services/validationService.js';

describe('ValidationService (Deterministic Release Readiness)', () => {
  it('detects missing release name and version', () => {
    const emptyRelease = {
      name: '',
      version: '',
      items: [],
      evidence: []
    };

    const result = ValidationService.validate(emptyRelease);
    expect(result.isReady).toBe(false);
    expect(result.missingRequired).toContain('Release name is required (min 3 characters).');
    expect(result.missingRequired).toContain('Version identifier is required (e.g. v1.2.0).');
    expect(result.missingRequired).toContain('At least one completed feature item is required.');
  });

  it('passes validation when all required sections and evidence are present', () => {
    const validRelease = {
      name: 'User Authentication Service',
      version: 'v1.0.0',
      description: 'Production release of OAuth2 login and RBAC permissions.',
      qaSummary: 'Passed all 50 automated security and regression test suites on staging.',
      items: [
        { code: 'REL-001', category: 'feature', title: 'OAuth2 Login', description: 'Google and GitHub SSO' },
        { code: 'REL-002', category: 'bug_fix', title: 'Session timeout bug fix', description: 'Fixed token expiry race' },
        { code: 'REL-003', category: 'affected_user_group', title: 'All registered users', description: 'Web client users' }
      ],
      evidence: [
        { code: 'QA-001', type: 'test_suite', title: 'OAuth E2E Suite', details: '50 tests passed', status: 'passed' }
      ]
    };

    const result = ValidationService.validate(validRelease);
    expect(result.isReady).toBe(true);
    expect(result.missingRequired.length).toBe(0);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('identifies failed QA evidence as a critical release risk', () => {
    const failingRelease = {
      name: 'Billing Gateway',
      version: 'v2.1.0',
      qaSummary: 'Regression suite executed with 1 critical failure.',
      items: [
        { code: 'REL-001', category: 'feature', title: 'Payment processing', description: 'Stripe integration' },
        { code: 'REL-002', category: 'affected_user_group', title: 'Billing Admins', description: 'Finance team' }
      ],
      evidence: [
        { code: 'QA-001', type: 'test_suite', title: 'Stripe 3DS Check', details: 'Failed due to timeout on sandbox', status: 'failed' }
      ]
    };

    const result = ValidationService.validate(failingRelease);
    expect(result.isReady).toBe(false);
    expect(result.risks.some(r => r.type === 'FAILED_QA_EVIDENCE')).toBe(true);
  });
});
