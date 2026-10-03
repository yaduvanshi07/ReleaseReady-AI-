import { z } from 'zod';

export const releaseItemCategorySchema = z.enum([
  'feature',
  'bug_fix',
  'changed_behavior',
  'known_limitation',
  'migration_note',
  'affected_user_group'
]);

export const releaseItemSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  category: releaseItemCategorySchema,
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().optional().default(''),
  displayOrder: z.number().int().optional().default(0)
});

export const qaEvidenceStatusSchema = z.enum([
  'passed',
  'failed',
  'partial',
  'blocked',
  'in_progress'
]);

export const qaEvidenceTypeSchema = z.enum([
  'test_suite',
  'manual_test',
  'performance_metric',
  'security_scan',
  'user_acceptance',
  'other'
]);

export const qaEvidenceSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  type: qaEvidenceTypeSchema,
  title: z.string().min(1, 'Evidence title is required').max(300),
  details: z.string().min(1, 'Evidence details are required'),
  status: qaEvidenceStatusSchema
});

export const createReleaseSchema = z.object({
  name: z.string().min(1, 'Release name is required').max(200),
  version: z.string().min(1, 'Version identifier is required').max(50),
  description: z.string().optional().default(''),
  releaseDate: z.string().optional().default(''),
  owner: z.string().optional().default(''),
  qaSummary: z.string().optional().default(''),
  items: z.array(releaseItemSchema).optional().default([]),
  evidence: z.array(qaEvidenceSchema).optional().default([])
});

export const updateReleaseSchema = createReleaseSchema.partial();

export const createSnapshotSchema = z.object({
  versionLabel: z.string().min(1, 'Version label is required').max(50),
  changelogSummary: z.string().optional().default('')
});

export const reviewStatementSchema = z.object({
  reviewState: z.enum(['generated', 'edited', 'accepted', 'rejected', 'needs_review']),
  currentContent: z.string().min(1, 'Content cannot be empty').optional(),
  notes: z.string().optional()
});
