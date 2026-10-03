import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initializeSchema } from '../src/database/schema.js';
import { CitationValidator } from '../src/ai/citationValidator.js';
import { AiService } from '../src/services/aiService.js';

describe('AI Workflow & Citation Verification', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
  });

  it('strips or flags hallucinated citation codes not present in the release package', () => {
    const release = {
      items: [
        { code: 'REL-001', category: 'feature', title: 'Payment feature' },
        { code: 'REL-002', category: 'bug_fix', title: 'Login fix' }
      ],
      evidence: [
        { code: 'QA-001', type: 'test_suite', title: 'Payment test suite', details: 'passed', status: 'passed' }
      ]
    };

    const aiResponseWithHallucination = {
      technicalSummary: 'Summary text',
      stakeholderSummary: 'Stakeholder summary text',
      impactClassifications: [
        {
          itemCode: 'REL-001',
          impact: 'High',
          explanation: 'Payment is critical.',
          supportingSources: ['REL-001', 'REL-999_HALLUCINATED']
        }
      ],
      missingInformation: [],
      qaEvidenceAnalysis: [
        {
          claimText: '100% test coverage',
          supportStatus: 'not_supported',
          citedEvidenceCodes: ['QA-001', 'QA-888_FAKE'],
          explanation: 'The supplied QA evidence does not establish this claim.'
        }
      ],
      risksAndLimitations: [],
      statements: [
        {
          statementType: 'technical_summary',
          content: 'Statement 1',
          sourceIdentifiers: ['REL-001', 'INVALID-ID']
        }
      ]
    };

    const validated = CitationValidator.validateCitations(aiResponseWithHallucination, release);

    expect(validated.impactClassifications[0].supportingSources).toEqual(['REL-001']);
    expect(validated.impactClassifications[0].invalidSources).toEqual(['REL-999_HALLUCINATED']);

    expect(validated.qaEvidenceAnalysis[0].citedEvidenceCodes).toEqual(['QA-001']);
    expect(validated.qaEvidenceAnalysis[0].invalidEvidenceCodes).toEqual(['QA-888_FAKE']);

    expect(validated.statements[0].sourceIdentifiers).toEqual(['REL-001']);
    expect(validated.statements[0].hasInvalidCitation).toBe(true);
  });

  it('runs complete AiService with a mock provider and saves structured records', async () => {
    // Insert release into db
    db.prepare(`
      INSERT INTO releases (id, name, version, qa_summary, created_at, updated_at)
      VALUES ('rel_ai_test', 'AI Test Release', 'v1.0.0', 'Passed all QA suites', datetime('now'), datetime('now'))
    `).run();

    db.prepare(`
      INSERT INTO release_items (id, release_id, code, category, title, created_at, updated_at)
      VALUES ('i1', 'rel_ai_test', 'REL-001', 'feature', 'Test Feature', datetime('now'), datetime('now'))
    `).run();

    db.prepare(`
      INSERT INTO qa_evidence (id, release_id, code, type, title, details, status, created_at, updated_at)
      VALUES ('e1', 'rel_ai_test', 'QA-001', 'test_suite', 'Test QA Suite', 'Passed 10/10 tests', 'passed', datetime('now'), datetime('now'))
    `).run();

    const mockProvider = {
      isConfigured: () => true,
      generateAnalysis: async () => ({
        rawText: '{"dummy": true}',
        parsedJson: {
          technicalSummary: 'Technical summary for v1.0.0 with REL-001 [REL-001].',
          stakeholderSummary: 'Stakeholder summary for users.',
          impactClassifications: [
            {
              itemCode: 'REL-001',
              impact: 'Moderate',
              explanation: 'Standard feature impact.',
              supportingSources: ['REL-001']
            }
          ],
          missingInformation: [
            {
              fieldOrTopic: 'Rollback Plan',
              issueType: 'possible_omission',
              description: 'No explicit rollback instructions given.',
              whyImportant: 'Ensures operational stability.',
              suggestedAction: 'Document rollback strategy.'
            }
          ],
          qaEvidenceAnalysis: [
            {
              claimText: 'Feature passes test suite',
              supportStatus: 'supported',
              citedEvidenceCodes: ['QA-001'],
              explanation: 'Supported directly by test suite QA-001.',
              confidence: 'High'
            }
          ],
          risksAndLimitations: [],
          statements: [
            {
              statementType: 'technical_summary',
              content: 'Technical summary for v1.0.0 with REL-001 [REL-001].',
              sourceIdentifiers: ['REL-001']
            }
          ]
        },
        modelUsed: 'mock-gemini-2.5-flash'
      })
    };

    const aiService = new AiService(mockProvider, db);
    const release = {
      id: 'rel_ai_test',
      name: 'AI Test Release',
      version: 'v1.0.0',
      items: [{ code: 'REL-001', category: 'feature', title: 'Test Feature' }],
      evidence: [{ code: 'QA-001', type: 'test_suite', title: 'Test QA Suite', details: 'Passed 10/10 tests', status: 'passed' }]
    };

    const result = await aiService.analyzeRelease(release);

    expect(result.technicalSummary).toContain('Technical summary');
    expect(result.impactClassifications.length).toBe(1);
    expect(result.qaEvidenceAnalysis[0].supportStatus).toBe('supported');

    // Verify DB records with parameterized query
    const analysisRow = db.prepare('SELECT * FROM ai_analyses WHERE release_id = ?').get('rel_ai_test');
    expect(analysisRow).toBeDefined();
    expect(analysisRow.model_used).toBe('mock-gemini-2.5-flash');

    const statements = db.prepare('SELECT * FROM generated_statements WHERE release_id = ?').all('rel_ai_test');
    expect(statements.length).toBeGreaterThan(0);
  });
});
