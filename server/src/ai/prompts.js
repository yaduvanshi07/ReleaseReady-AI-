/**
 * Prompts and system instructions for ReleaseReady AI analysis.
 */

export const SYSTEM_INSTRUCTION = `
You are the AI engine of ReleaseReady AI, a software release communication and readiness assistant.
Your goal is to analyze release packages and provide evidence-backed, factual, and strictly traceable summaries.

CRITICAL CONSTRAINTS:
1. TRACEABILITY: You must ONLY cite real item codes (e.g. REL-001, REL-002) and QA evidence codes (e.g. QA-001, QA-002) provided in the source package. NEVER invent new identifiers.
2. EVIDENCE RIGOR: When analyzing QA evidence, classify claims accurately:
   - "supported": Evidence directly proves the claim.
   - "partially_supported": Evidence provides partial proof but leaves gaps.
   - "not_supported": The supplied QA evidence does not establish this claim (do NOT say it's false unless contradicted).
   - "contradicted": Evidence explicitly conflicts with the claim.
   - "unable_to_assess": Insufficient context to determine.
3. NEVER INVENT: Do not hallucinate test executions, metrics, performance numbers, or features not in the source text.
4. IMPACT CLASSIFICATION: Use 'Low', 'Moderate', 'High', or 'Unknown'. If context is missing, classify as 'Unknown'.
5. NO AUTOMATIC APPROVAL OR DEPLOYMENT: You are an advisory review assistant. You never approve a release for production or trigger deployment.
6. OUTPUT FORMAT: Respond ONLY with valid, parseable JSON matching the requested schema. Do not enclose in markdown blocks if requested as pure JSON, or use proper JSON format.
`;

/**
 * Builds the analysis prompt with structured release data.
 * @param {Object} release Full release package
 */
export function buildReleaseAnalysisPrompt(release) {
  const itemsText = (release.items || []).map(item => 
    `[${item.code}] Category: ${item.category} | Title: ${item.title} | Description: ${item.description || 'N/A'}`
  ).join('\n');

  const evidenceText = (release.evidence || []).map(ev => 
    `[${ev.code}] Type: ${ev.type} | Title: ${ev.title} | Status: ${ev.status} | Details: ${ev.details}`
  ).join('\n');

  return `
Analyze the following release package and produce a comprehensive structured readiness analysis.

=== RELEASE METADATA ===
Release Name: ${release.name}
Version: ${release.version}
Description: ${release.description || 'N/A'}
Release Owner: ${release.owner || 'Unassigned'}
QA Summary: ${release.qaSummary || 'N/A'}

=== DOCUMENTED RELEASE ITEMS ===
${itemsText || 'None'}

=== SUPPLIED QA EVIDENCE RECORDS ===
${evidenceText || 'None'}

=== REQUIRED JSON OUTPUT STRUCTURE ===
You must return a single JSON object with these keys:
{
  "technicalSummary": "Comprehensive technical summary for developers and QA engineers citing [REL-xxx] and [QA-xxx] codes.",
  "stakeholderSummary": "Plain-English, non-technical summary explaining what changed, why it matters, affected users, and any actions needed.",
  "impactClassifications": [
    {
      "itemCode": "REL-001",
      "impact": "High", // One of: "Low", "Moderate", "High", "Unknown"
      "explanation": "Detailed explanation of technical/business impact.",
      "supportingSources": ["REL-001"],
      "uncertainties": "Any unknown side-effects or risks.",
      "suggestedReview": "Recommendation for engineering or QA review."
    }
  ],
  "missingInformation": [
    {
      "fieldOrTopic": "Name of section or feature",
      "issueType": "confirmed_omission", // One of: "confirmed_omission", "possible_omission", "clarification_needed"
      "description": "Specific detail that is missing or unclear.",
      "whyImportant": "Why this missing detail matters for release safety.",
      "suggestedAction": "What the release author should provide."
    }
  ],
  "qaEvidenceAnalysis": [
    {
      "claimText": "Release claim being evaluated",
      "supportStatus": "supported", // One of: "supported", "partially_supported", "not_supported", "contradicted", "unable_to_assess"
      "citedEvidenceCodes": ["QA-001"],
      "explanation": "Precise analysis of how the evidence supports or fails to establish the claim.",
      "suggestedCorrection": "Suggested wording or follow-up test needed.",
      "confidence": "High"
    }
  ],
  "risksAndLimitations": [
    {
      "description": "Identified risk or known limitation",
      "affectedTarget": "Affected systems or user groups",
      "sourceCodes": ["REL-005"],
      "consequence": "Potential impact if unmitigated",
      "origin": "documented", // One of: "documented", "ai_identified", "potential_concern"
      "suggestedFollowUp": "Action required before or during release"
    }
  ],
  "statements": [
    {
      "statementType": "technical_summary", // "technical_summary" | "stakeholder_summary" | "impact_finding" | "qa_claim" | "risk_limitation"
      "content": "Discrete evidence-backed statement with citation.",
      "sourceIdentifiers": ["REL-001"]
    }
  ]
}
`;
}
