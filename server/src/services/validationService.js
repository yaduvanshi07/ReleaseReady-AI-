/**
 * Deterministic Release Readiness Validation Service.
 * Validates releases according to strict business rules without relying on LLM availability.
 */
export class ValidationService {
  /**
   * Evaluates the readiness of a release package.
   * @param {Object} release Release object with items and evidence
   * @returns {Object} Structured validation results
   */
  static validate(release) {
    if (!release) {
      return {
        isReady: false,
        score: 0,
        missingRequired: ['Release package does not exist.'],
        optionalSuggestions: [],
        risks: [],
        checks: []
      };
    }

    const items = Array.isArray(release.items) ? release.items : [];
    const evidence = Array.isArray(release.evidence) ? release.evidence : [];

    const checks = [];
    const missingRequired = [];
    const optionalSuggestions = [];
    const risks = [];

    // 1. Release Metadata Checks
    const hasName = Boolean(release.name && release.name.trim().length >= 3);
    checks.push({
      id: 'META_NAME',
      category: 'Metadata',
      label: 'Release Name',
      passed: hasName,
      message: hasName ? 'Release name is specified.' : 'Release name is missing or too short.'
    });
    if (!hasName) missingRequired.push('Release name is required (min 3 characters).');

    const hasVersion = Boolean(release.version && release.version.trim().length >= 1);
    checks.push({
      id: 'META_VERSION',
      category: 'Metadata',
      label: 'Version Identifier',
      passed: hasVersion,
      message: hasVersion ? `Version identifier (${release.version}) is specified.` : 'Version identifier is missing.'
    });
    if (!hasVersion) missingRequired.push('Version identifier is required (e.g. v1.2.0).');

    const hasDescription = Boolean(release.description && release.description.trim().length >= 10);
    checks.push({
      id: 'META_DESC',
      category: 'Metadata',
      label: 'Release Description',
      passed: hasDescription,
      message: hasDescription ? 'Release description provided.' : 'Adding a high-level release description is recommended.'
    });
    if (!hasDescription) optionalSuggestions.push('Add an executive overview description for better context.');

    const hasOwner = Boolean(release.owner && release.owner.trim().length >= 2);
    if (!hasOwner) optionalSuggestions.push('Assign a designated release owner/contact.');

    // 2. Section 1: Completed Features
    const features = items.filter(i => i.category === 'feature');
    const hasFeatures = features.length > 0;
    checks.push({
      id: 'SEC_FEATURES',
      category: 'Features',
      label: 'Completed Features',
      passed: hasFeatures,
      message: hasFeatures ? `${features.length} feature(s) documented.` : 'No completed features documented.'
    });
    if (!hasFeatures) missingRequired.push('At least one completed feature item is required.');

    // 3. Section 2: Bug Fixes
    const bugFixes = items.filter(i => i.category === 'bug_fix');
    const hasBugFixes = bugFixes.length > 0;
    checks.push({
      id: 'SEC_BUG_FIXES',
      category: 'Bug Fixes',
      label: 'Bug Fixes',
      passed: hasBugFixes,
      message: hasBugFixes ? `${bugFixes.length} bug fix(es) documented.` : 'No bug fixes listed. If this release has no bug fixes, document explicitly.'
    });
    if (!hasBugFixes) {
      optionalSuggestions.push('If this release contains no bug fixes, add a note indicating no bug fixes are included.');
    }

    // 4. Section 3: Changed Behaviour
    const changedBehaviors = items.filter(i => i.category === 'changed_behavior');
    const hasChangedBehaviors = changedBehaviors.length > 0;
    checks.push({
      id: 'SEC_CHANGED_BEHAVIOR',
      category: 'Behavior Changes',
      label: 'Changed Behaviour & Breaking Changes',
      passed: true,
      message: hasChangedBehaviors 
        ? `${changedBehaviors.length} changed behavior item(s) documented.` 
        : 'No behavior changes listed.'
    });
    if (hasChangedBehaviors) {
      risks.push({
        type: 'BEHAVIOR_CHANGE',
        message: `${changedBehaviors.length} behavior change(s) present. Ensure client backward compatibility is verified.`
      });
    }

    // 5. Section 4: QA Summary & Evidence
    const hasQaSummary = Boolean(release.qaSummary && release.qaSummary.trim().length >= 15);
    const hasQaEvidence = evidence.length > 0;
    const passedEvidence = evidence.filter(e => e.status === 'passed');
    const failedEvidence = evidence.filter(e => e.status === 'failed');
    const partialEvidence = evidence.filter(e => e.status === 'partial' || e.status === 'blocked');

    checks.push({
      id: 'SEC_QA_SUMMARY',
      category: 'QA & Evidence',
      label: 'QA Summary',
      passed: hasQaSummary,
      message: hasQaSummary ? 'QA summary text provided.' : 'QA summary is missing or lacks sufficient detail (min 15 characters).'
    });
    if (!hasQaSummary) missingRequired.push('QA summary description is required with testing methodology and results.');

    checks.push({
      id: 'SEC_QA_EVIDENCE',
      category: 'QA & Evidence',
      label: 'Structured QA Evidence Records',
      passed: hasQaEvidence,
      message: hasQaEvidence ? `${evidence.length} QA evidence record(s) supplied.` : 'No structured QA evidence records supplied.'
    });
    if (!hasQaEvidence) {
      missingRequired.push('At least one structured QA evidence record (test suite, manual test, benchmark) is required.');
    } else {
      if (failedEvidence.length > 0) {
        risks.push({
          type: 'FAILED_QA_EVIDENCE',
          message: `${failedEvidence.length} QA evidence item(s) marked as FAILED (${failedEvidence.map(e => e.code || e.title).join(', ')}). Requires immediate attention.`
        });
      }
      if (partialEvidence.length > 0) {
        risks.push({
          type: 'PARTIAL_QA_EVIDENCE',
          message: `${partialEvidence.length} QA evidence item(s) marked as Partial/Blocked (${partialEvidence.map(e => e.code || e.title).join(', ')}).`
        });
      }
    }

    // 6. Section 5: Known Limitations
    const limitations = items.filter(i => i.category === 'known_limitation');
    checks.push({
      id: 'SEC_LIMITATIONS',
      category: 'Limitations',
      label: 'Known Limitations',
      passed: true,
      message: limitations.length > 0 ? `${limitations.length} limitation(s) noted.` : 'No limitations noted.'
    });
    if (limitations.length > 0) {
      risks.push({
        type: 'DOCUMENTED_LIMITATION',
        message: `${limitations.length} known limitation(s) declared for this release.`
      });
    }

    // 7. Section 6: Migration / Configuration Notes
    const migrationNotes = items.filter(i => i.category === 'migration_note');
    checks.push({
      id: 'SEC_MIGRATION',
      category: 'Operations',
      label: 'Migration & Config Notes',
      passed: true,
      message: migrationNotes.length > 0 ? `${migrationNotes.length} migration/config note(s) documented.` : 'No migration steps required.'
    });
    if (migrationNotes.length > 0) {
      risks.push({
        type: 'MIGRATION_REQUIRED',
        message: `${migrationNotes.length} migration/configuration procedure(s) required prior to launch.`
      });
    }

    // 8. Section 7: Affected User Groups
    const userGroups = items.filter(i => i.category === 'affected_user_group');
    const hasUserGroups = userGroups.length > 0;
    checks.push({
      id: 'SEC_USER_GROUPS',
      category: 'Stakeholders',
      label: 'Affected User Groups',
      passed: hasUserGroups,
      message: hasUserGroups ? `${userGroups.length} user group(s) identified.` : 'No affected user groups specified.'
    });
    if (!hasUserGroups) missingRequired.push('Identify at least one affected user group (e.g. Enterprise users, Mobile clients, Admin users).');

    // Calculate deterministic readiness score (0 - 100)
    const passedCount = checks.filter(c => c.passed).length;
    const totalChecks = checks.length;
    const baseScore = Math.round((passedCount / totalChecks) * 100);
    const penalty = (failedEvidence.length * 20) + (missingRequired.length * 10);
    const score = Math.max(0, Math.min(100, baseScore - (failedEvidence.length > 0 ? 30 : 0)));

    const isReady = missingRequired.length === 0 && failedEvidence.length === 0;

    return {
      isReady,
      score,
      totalChecks,
      passedChecksCount: passedCount,
      missingRequired,
      optionalSuggestions,
      risks,
      checks
    };
  }
}
