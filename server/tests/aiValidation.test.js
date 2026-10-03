import { describe, it, expect } from 'vitest';
import { aiReleaseAnalysisResponseSchema } from '../src/validators/aiResponseSchema.js';
import { CitationValidator } from '../src/ai/citationValidator.js';
import { GeminiProvider } from '../src/ai/geminiProvider.js';

describe('AI Response Schema & Cross-Version Citation Validation', () => {
  it('validates a correct AI response payload matching the schema', () => {
    const validAiResponse = {
      technicalSummary: 'Technical overview citing [REL-001].',
      stakeholderSummary: 'Stakeholder summary.',
      impactClassifications: [
        {
          itemCode: 'REL-001',
          impact: 'High',
          explanation: 'Core payment change.',
          supportingSources: ['REL-001']
        }
      ],
      missingInformation: [
        {
          fieldOrTopic: 'Rollback plan',
          issueType: 'confirmed_omission',
          description: 'No rollback instructions.',
          whyImportant: 'High risk change.',
          suggestedAction: 'Document rollback steps.'
        }
      ],
      qaEvidenceAnalysis: [
        {
          claimText: 'Zero regression errors',
          supportStatus: 'supported',
          citedEvidenceCodes: ['QA-001'],
          explanation: 'Verified in QA-001 suite.',
          confidence: 'High'
        },
        {
          claimText: 'Sub-millisecond latency',
          supportStatus: 'not_supported',
          citedEvidenceCodes: [],
          explanation: 'The supplied QA evidence does not establish this claim.'
        },
        {
          claimText: 'Handles 100k concurrent users',
          supportStatus: 'partially_supported',
          citedEvidenceCodes: ['QA-002'],
          explanation: 'Benchmark tested up to 50k users only.'
        },
        {
          claimText: 'Works offline without internet',
          supportStatus: 'contradicted',
          citedEvidenceCodes: ['QA-003'],
          explanation: 'QA-003 explicitly states server connectivity is required.'
        },
        {
          claimText: 'Complies with localized GDPR rules',
          supportStatus: 'unable_to_assess',
          citedEvidenceCodes: [],
          explanation: 'No compliance audit evidence supplied in this release package.'
        }
      ],
      risksAndLimitations: [
        {
          description: 'Legacy API deprecation',
          affectedTarget: 'Third-party integrations',
          sourceCodes: ['REL-002'],
          consequence: 'Breaking change for v1 clients',
          origin: 'documented',
          suggestedFollowUp: 'Send email blast'
        }
      ],
      statements: [
        {
          statementType: 'technical_summary',
          content: 'Technical summary statement [REL-001].',
          sourceIdentifiers: ['REL-001']
        }
      ]
    };

    const parsed = aiReleaseAnalysisResponseSchema.safeParse(validAiResponse);
    expect(parsed.success).toBe(true);
    expect(parsed.data.qaEvidenceAnalysis.length).toBe(5);
  });

  it('rejects malformed AI response payloads (invalid enum values or missing required fields)', () => {
    const invalidPayload = {
      technicalSummary: '', // empty
      stakeholderSummary: 'Summary',
      impactClassifications: [
        {
          itemCode: 'REL-001',
          impact: 'Catastrophic', // Invalid enum! Must be Low/Moderate/High/Unknown
          explanation: 'Invalid impact level'
        }
      ]
    };

    const parsed = aiReleaseAnalysisResponseSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it('rejects cross-version evidence references belonging to a different release', () => {
    // Release A (current release being evaluated)
    const releaseA = {
      id: 'rel_version_A',
      items: [
        { code: 'REL-001', category: 'feature', title: 'Feature in Release A' }
      ],
      evidence: [
        { code: 'QA-001', type: 'test_suite', title: 'QA Suite for Release A' }
      ]
    };

    // AI hallucinates or references codes from Release B (REL-999, QA-777)
    const aiResponseWithCrossVersionCitations = {
      technicalSummary: 'Summary referencing REL-001 and REL-999 from Release B',
      stakeholderSummary: 'Stakeholder summary',
      impactClassifications: [
        {
          itemCode: 'REL-001',
          impact: 'Moderate',
          explanation: 'Standard feature',
          supportingSources: ['REL-001', 'REL-999'] // REL-999 is not in release A
        }
      ],
      missingInformation: [],
      qaEvidenceAnalysis: [
        {
          claimText: 'Passed legacy tests',
          supportStatus: 'supported',
          citedEvidenceCodes: ['QA-001', 'QA-777'], // QA-777 is not in release A
          explanation: 'Claims support'
        }
      ],
      risksAndLimitations: [],
      statements: [
        {
          statementType: 'technical_summary',
          content: 'Statement citing foreign code',
          sourceIdentifiers: ['REL-001', 'REL-999', 'QA-777']
        }
      ]
    };

    const result = CitationValidator.validateCitations(aiResponseWithCrossVersionCitations, releaseA);

    // Cross-version references stripped from valid list and quarantined in invalid list
    expect(result.impactClassifications[0].supportingSources).toEqual(['REL-001']);
    expect(result.impactClassifications[0].invalidSources).toEqual(['REL-999']);

    expect(result.qaEvidenceAnalysis[0].citedEvidenceCodes).toEqual(['QA-001']);
    expect(result.qaEvidenceAnalysis[0].invalidEvidenceCodes).toEqual(['QA-777']);

    expect(result.statements[0].sourceIdentifiers).toEqual(['REL-001']);
    expect(result.statements[0].hasInvalidCitation).toBe(true);
  });

  it('GeminiProvider throws descriptive error when unconfigured', async () => {
    const unconfiguredProvider = new GeminiProvider('', 'gemini-2.5-flash');
    expect(unconfiguredProvider.isConfigured()).toBe(false);

    await expect(unconfiguredProvider.generateAnalysis('test prompt')).rejects.toThrow(
      /Gemini API key is not configured/i
    );
  });
});
