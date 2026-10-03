/**
 * Validates citations in AI-generated statements against authentic release item and evidence IDs.
 */
export class CitationValidator {
  /**
   * Validates and sanitizes citations in an AI analysis response.
   * @param {Object} aiResponse Parsed AI response matching aiReleaseAnalysisResponseSchema
   * @param {Object} release Full release package
   * @returns {Object} Validated and annotated response
   */
  static validateCitations(aiResponse, release) {
    const validCodes = new Set();

    // Collect valid release item codes
    if (Array.isArray(release.items)) {
      for (const item of release.items) {
        if (item.code) validCodes.add(item.code.toUpperCase());
      }
    }

    // Collect valid QA evidence codes
    if (Array.isArray(release.evidence)) {
      for (const ev of release.evidence) {
        if (ev.code) validCodes.add(ev.code.toUpperCase());
      }
    }
    validCodes.add('QA-SUMMARY');

    const sanitizedClassifications = (aiResponse.impactClassifications || []).map(item => {
      const validSources = (item.supportingSources || []).filter(src => validCodes.has(src.toUpperCase()));
      const invalidSources = (item.supportingSources || []).filter(src => !validCodes.has(src.toUpperCase()));
      return {
        ...item,
        supportingSources: validSources,
        invalidSources: invalidSources.length > 0 ? invalidSources : undefined
      };
    });

    const sanitizedQaClaims = (aiResponse.qaEvidenceAnalysis || []).map(claim => {
      const validEvCodes = (claim.citedEvidenceCodes || []).filter(src => validCodes.has(src.toUpperCase()));
      const invalidEvCodes = (claim.citedEvidenceCodes || []).filter(src => !validCodes.has(src.toUpperCase()));
      return {
        ...claim,
        citedEvidenceCodes: validEvCodes,
        invalidEvidenceCodes: invalidEvCodes.length > 0 ? invalidEvCodes : undefined
      };
    });

    const sanitizedStatements = (aiResponse.statements || []).map(stmt => {
      const validSources = (stmt.sourceIdentifiers || []).filter(src => validCodes.has(src.toUpperCase()));
      const invalidSources = (stmt.sourceIdentifiers || []).filter(src => !validCodes.has(src.toUpperCase()));
      return {
        ...stmt,
        sourceIdentifiers: validSources,
        hasInvalidCitation: invalidSources.length > 0
      };
    });

    return {
      ...aiResponse,
      impactClassifications: sanitizedClassifications,
      qaEvidenceAnalysis: sanitizedQaClaims,
      statements: sanitizedStatements,
      validSourcePool: Array.from(validCodes)
    };
  }
}
