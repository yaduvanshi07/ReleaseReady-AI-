import { ValidationService } from './validationService.js';

export class BriefService {
  /**
   * Generates a comprehensive final release brief from a snapshot or current release state.
   * @param {Object} release Full release package
   * @param {Array} [statements] Array of reviewed statements
   * @param {Object} [snapshotMeta] Optional snapshot metadata
   */
  static generateBrief(release, statements = [], snapshotMeta = null) {
    if (!release) {
      throw new Error('Release data is required to generate a brief.');
    }

    const items = Array.isArray(release.items) ? release.items : [];
    const evidence = Array.isArray(release.evidence) ? release.evidence : [];

    const features = items.filter(i => i.category === 'feature');
    const bugFixes = items.filter(i => i.category === 'bug_fix');
    const changedBehaviors = items.filter(i => i.category === 'changed_behavior');
    const limitations = items.filter(i => i.category === 'known_limitation');
    const migrations = items.filter(i => i.category === 'migration_note');
    const userGroups = items.filter(i => i.category === 'affected_user_group');

    // Categorize statement reviews
    const acceptedStatements = statements.filter(s => s.reviewState === 'accepted');
    const editedStatements = statements.filter(s => s.reviewState === 'edited');
    const rejectedStatements = statements.filter(s => s.reviewState === 'rejected');
    const pendingStatements = statements.filter(s => s.reviewState === 'generated' || s.reviewState === 'needs_review');
    const staleStatements = statements.filter(s => s.isStale);

    // Deterministic readiness check
    const validation = ValidationService.validate(release);

    // Select latest summaries from accepted/edited statements or latest analysis
    const techStmt = statements.find(s => s.statementType === 'technical_summary' && s.reviewState !== 'rejected');
    const technicalSummary = techStmt ? techStmt.currentContent : (release.latestAnalysis?.technicalSummary || 'Technical summary not yet generated.');

    const stakeStmt = statements.find(s => s.statementType === 'stakeholder_summary' && s.reviewState !== 'rejected');
    const stakeholderSummary = stakeStmt ? stakeStmt.currentContent : (release.latestAnalysis?.stakeholderSummary || 'Stakeholder summary not yet generated.');

    const executiveSummary = release.description || `${release.name} (${release.version}) containing ${features.length} new features, ${bugFixes.length} bug fixes, and ${evidence.length} validated QA test runs.`;

    const isFullyReviewed = statements.length > 0 && pendingStatements.length === 0 && staleStatements.length === 0;

    const briefData = {
      releaseName: release.name,
      version: release.version,
      releaseDate: release.releaseDate || 'TBD',
      owner: release.owner || 'Unassigned',
      isSnapshot: Boolean(snapshotMeta),
      snapshotVersionLabel: snapshotMeta?.versionLabel || null,
      generatedAt: new Date().toISOString(),
      validationScore: validation.score,
      isDeterministicReady: validation.isReady,
      isFullyReviewed,
      executiveSummary,
      technicalSummary,
      stakeholderSummary,
      sections: {
        completedFeatures: features,
        bugFixes: bugFixes,
        changedBehavior: changedBehaviors,
        knownLimitations: limitations,
        migrationNotes: migrations,
        affectedUserGroups: userGroups,
        qaSummary: release.qaSummary || 'No QA summary recorded.',
        qaEvidence: evidence
      },
      reviewSummary: {
        totalStatements: statements.length,
        acceptedCount: acceptedStatements.length,
        editedCount: editedStatements.length,
        rejectedCount: rejectedStatements.length,
        pendingCount: pendingStatements.length,
        staleCount: staleStatements.length,
        statements
      },
      risksAndWarnings: [
        ...validation.risks.map(r => typeof r === 'string' ? r : r.message),
        ...validation.missingRequired.map(m => `Missing Required: ${m}`),
        ...(staleStatements.length > 0 ? [`${staleStatements.length} statement(s) are flagged as stale due to source changes.`] : [])
      ]
    };

    // Format markdown representation
    const markdown = this.formatMarkdown(briefData);

    return {
      briefData,
      markdown
    };
  }

  /**
   * Generates a clean, print-friendly markdown document of the release brief.
   * @param {Object} briefData
   */
  static formatMarkdown(briefData) {
    return `# Release Brief: ${briefData.releaseName} (${briefData.version})
**Release Date:** ${briefData.releaseDate} | **Owner:** ${briefData.owner} | **Generated:** ${new Date(briefData.generatedAt).toLocaleString()}
**Readiness Score:** ${briefData.validationScore}/100 | **Human Review Status:** ${briefData.isFullyReviewed ? 'COMPLETED & VERIFIED' : 'PENDING REVIEW'}

---

## 1. Executive Summary
${briefData.executiveSummary}

---

## 2. Technical Summary (For Engineering & QA)
${briefData.technicalSummary}

---

## 3. Stakeholder Summary (For Clients & Product Teams)
${briefData.stakeholderSummary}

---

## 4. Completed Features
${briefData.sections.completedFeatures.length === 0 ? '*No features listed.*' : briefData.sections.completedFeatures.map(f => `- **[${f.code}] ${f.title}**: ${f.description || 'No description'}`).join('\n')}

---

## 5. Bug Fixes
${briefData.sections.bugFixes.length === 0 ? '*No bug fixes listed.*' : briefData.sections.bugFixes.map(b => `- **[${b.code}] ${b.title}**: ${b.description || 'No description'}`).join('\n')}

---

## 6. Changed Behavior & Breaking Changes
${briefData.sections.changedBehavior.length === 0 ? '*No behavior changes listed.*' : briefData.sections.changedBehavior.map(c => `- **[${c.code}] ${c.title}**: ${c.description || 'No description'}`).join('\n')}

---

## 7. QA Summary & Test Evidence
**QA Summary:** ${briefData.sections.qaSummary}

### Verified Evidence Records:
${briefData.sections.qaEvidence.length === 0 ? '*No QA evidence recorded.*' : briefData.sections.qaEvidence.map(e => `- **[${e.code}] [Status: ${e.status.toUpperCase()}] ${e.title}** (${e.type})\n  *Details:* ${e.details}`).join('\n')}

---

## 8. Known Risks, Limitations & Migration Notes
### Known Limitations:
${briefData.sections.knownLimitations.length === 0 ? '*None documented.*' : briefData.sections.knownLimitations.map(l => `- **[${l.code}] ${l.title}**: ${l.description}`).join('\n')}

### Migration & Operational Notes:
${briefData.sections.migrationNotes.length === 0 ? '*No database or infrastructure migrations required.*' : briefData.sections.migrationNotes.map(m => `- **[${m.code}] ${m.title}**: ${m.description}`).join('\n')}

### Affected User Groups:
${briefData.sections.affectedUserGroups.length === 0 ? '*None specified.*' : briefData.sections.affectedUserGroups.map(u => `- **[${u.code}] ${u.title}**: ${u.description}`).join('\n')}

---

## 9. Warnings & Unresolved Issues
${briefData.risksAndWarnings.length === 0 ? '✅ All deterministic checks passed. No unresolved warnings.' : briefData.risksAndWarnings.map(w => `- ⚠️ ${w}`).join('\n')}

---

## 10. Human Review Audit Summary
- **Total Statements:** ${briefData.reviewSummary.totalStatements}
- **Accepted:** ${briefData.reviewSummary.acceptedCount} | **Edited:** ${briefData.reviewSummary.editedCount} | **Rejected:** ${briefData.reviewSummary.rejectedCount} | **Pending:** ${briefData.reviewSummary.pendingCount}
- **Stale Statements:** ${briefData.reviewSummary.staleCount}
`;
  }
}
