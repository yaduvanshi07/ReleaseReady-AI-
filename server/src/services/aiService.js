import crypto from 'crypto';
import { GeminiProvider } from '../ai/geminiProvider.js';
import { buildReleaseAnalysisPrompt } from '../ai/prompts.js';
import { aiReleaseAnalysisResponseSchema } from '../validators/aiResponseSchema.js';
import { CitationValidator } from '../ai/citationValidator.js';
import { getDb } from '../database/db.js';
import { ReviewRepository } from '../repositories/reviewRepository.js';

export class AiService {
  constructor(geminiProvider = null, db = null) {
    this.geminiProvider = geminiProvider || new GeminiProvider();
    this.db = db || getDb();
    this.reviewRepo = new ReviewRepository(this.db);
  }

  /**
   * Performs full AI analysis for a release package.
   * @param {Object} release Full release package
   */
  async analyzeRelease(release) {
    if (!release) {
      throw new Error('Release package is required for analysis.');
    }

    const prompt = buildReleaseAnalysisPrompt(release);
    const aiResult = await this.geminiProvider.generateAnalysis(prompt);

    // Validate structured response schema with Zod
    const validation = aiReleaseAnalysisResponseSchema.safeParse(aiResult.parsedJson);
    if (!validation.success) {
      console.error('AI Response Validation Failed:', validation.error.format());
      throw new Error(`AI generated response did not match expected schema: ${validation.error.issues.map(i => i.message).join(', ')}`);
    }

    // Verify citations against authentic release item and evidence codes
    const validatedData = CitationValidator.validateCitations(validation.data, release);

    const analysisId = `ai_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const insertAnalysis = this.db.prepare(`
      INSERT INTO ai_analyses (
        id, release_id, raw_response, technical_summary, stakeholder_summary,
        impact_classifications, missing_information, qa_evidence_analysis,
        risks_and_limitations, model_used, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAnalysis.run(
      analysisId,
      release.id,
      aiResult.rawText,
      validatedData.technicalSummary,
      validatedData.stakeholderSummary,
      JSON.stringify(validatedData.impactClassifications),
      JSON.stringify(validatedData.missingInformation),
      JSON.stringify(validatedData.qaEvidenceAnalysis),
      JSON.stringify(validatedData.risksAndLimitations),
      aiResult.modelUsed,
      'completed',
      now
    );

    // Prepare statement items from summaries, claims, and findings
    const statementsToSave = [];

    // Technical summary statements
    statementsToSave.push({
      statementType: 'technical_summary',
      content: validatedData.technicalSummary,
      sourceIdentifiers: validatedData.statements
        .filter(s => s.statementType === 'technical_summary')
        .flatMap(s => s.sourceIdentifiers)
    });

    // Stakeholder summary statements
    statementsToSave.push({
      statementType: 'stakeholder_summary',
      content: validatedData.stakeholderSummary,
      sourceIdentifiers: validatedData.statements
        .filter(s => s.statementType === 'stakeholder_summary')
        .flatMap(s => s.sourceIdentifiers)
    });

    // QA Claim evaluation statements
    for (const claim of validatedData.qaEvidenceAnalysis) {
      statementsToSave.push({
        statementType: 'qa_claim',
        content: `Claim: "${claim.claimText}" -> Assessment: ${claim.supportStatus.toUpperCase()}. ${claim.explanation}`,
        sourceIdentifiers: claim.citedEvidenceCodes || []
      });
    }

    // Impact classifications statements
    for (const impact of validatedData.impactClassifications) {
      statementsToSave.push({
        statementType: 'impact_finding',
        content: `[${impact.itemCode}] Impact: ${impact.impact} - ${impact.explanation}`,
        sourceIdentifiers: impact.supportingSources || [impact.itemCode]
      });
    }

    // Risks and limitations statements
    for (const risk of validatedData.risksAndLimitations) {
      statementsToSave.push({
        statementType: 'risk_limitation',
        content: `Risk (${risk.origin}): ${risk.description} (Consequence: ${risk.consequence})`,
        sourceIdentifiers: risk.sourceCodes || []
      });
    }

    const savedStatements = this.reviewRepo.saveGeneratedStatements(release.id, analysisId, statementsToSave);

    return {
      analysisId,
      releaseId: release.id,
      technicalSummary: validatedData.technicalSummary,
      stakeholderSummary: validatedData.stakeholderSummary,
      impactClassifications: validatedData.impactClassifications,
      missingInformation: validatedData.missingInformation,
      qaEvidenceAnalysis: validatedData.qaEvidenceAnalysis,
      risksAndLimitations: validatedData.risksAndLimitations,
      statements: savedStatements,
      createdAt: now
    };
  }
}
