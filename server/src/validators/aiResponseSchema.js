import { z } from 'zod';

export const impactClassificationSchema = z.object({
  itemCode: z.string(),
  impact: z.enum(['Low', 'Moderate', 'High', 'Unknown']),
  explanation: z.string(),
  supportingSources: z.array(z.string()).default([]),
  uncertainties: z.string().optional(),
  suggestedReview: z.string().optional()
});

export const missingInformationItemSchema = z.object({
  fieldOrTopic: z.string(),
  issueType: z.enum(['confirmed_omission', 'possible_omission', 'clarification_needed']),
  description: z.string(),
  whyImportant: z.string(),
  suggestedAction: z.string()
});

export const qaClaimAnalysisSchema = z.object({
  claimId: z.string().optional(),
  claimText: z.string(),
  supportStatus: z.enum([
    'supported',
    'partially_supported',
    'not_supported',
    'contradicted',
    'unable_to_assess'
  ]),
  citedEvidenceCodes: z.array(z.string()).default([]),
  explanation: z.string(),
  suggestedCorrection: z.string().optional(),
  confidence: z.string().optional()
});

export const riskLimitationSchema = z.object({
  description: z.string(),
  affectedTarget: z.string(),
  sourceCodes: z.array(z.string()).default([]),
  consequence: z.string(),
  origin: z.enum(['documented', 'ai_identified', 'potential_concern']),
  suggestedFollowUp: z.string()
});

export const aiGeneratedStatementSchema = z.object({
  statementType: z.enum([
    'technical_summary',
    'stakeholder_summary',
    'impact_finding',
    'qa_claim',
    'risk_limitation',
    'general'
  ]),
  content: z.string().min(1),
  sourceIdentifiers: z.array(z.string()).default([])
});

export const aiReleaseAnalysisResponseSchema = z.object({
  technicalSummary: z.string().min(1),
  stakeholderSummary: z.string().min(1),
  impactClassifications: z.array(impactClassificationSchema).default([]),
  missingInformation: z.array(missingInformationItemSchema).default([]),
  qaEvidenceAnalysis: z.array(qaClaimAnalysisSchema).default([]),
  risksAndLimitations: z.array(riskLimitationSchema).default([]),
  statements: z.array(aiGeneratedStatementSchema).default([])
});
