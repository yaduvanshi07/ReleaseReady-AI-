import { ReviewRepository } from '../repositories/reviewRepository.js';

/**
 * Service for detecting generated statements that become stale when underlying source items or QA evidence change.
 */
export class StaleDetectionService {
  /**
   * Evaluates statements for staleness based on a list of changed source identifiers.
   * @param {string} releaseId
   * @param {string[]} changedSourceCodes List of changed item codes (e.g. ['REL-001', 'QA-002'])
   * @param {ReviewRepository} [reviewRepo]
   */
  static evaluateStaleness(releaseId, changedSourceCodes, reviewRepo = null) {
    if (!changedSourceCodes || changedSourceCodes.length === 0) {
      return { affectedCount: 0, staleStatementIds: [] };
    }

    const repo = reviewRepo || new ReviewRepository();
    const statements = repo.getStatementsByReleaseId(releaseId);

    const changedSet = new Set(changedSourceCodes);
    const staleStatements = [];

    for (const stmt of statements) {
      const sources = Array.isArray(stmt.sourceIdentifiers) ? stmt.sourceIdentifiers : [];

      // Check if any source identifier used by this statement is in the changed set
      const matchingChangedSources = sources.filter(src => changedSet.has(src));

      if (matchingChangedSources.length > 0) {
        const reason = `Source evidence/item (${matchingChangedSources.join(', ')}) was updated or removed.`;
        staleStatements.push({ id: stmt.id, reason });
      }
    }

    // Mark affected statements in database
    for (const item of staleStatements) {
      repo.markStatementsStale([item.id], item.reason);
    }

    return {
      affectedCount: staleStatements.length,
      staleStatementIds: staleStatements.map(s => s.id),
      details: staleStatements
    };
  }
}
