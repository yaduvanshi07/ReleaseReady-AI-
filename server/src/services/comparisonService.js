/**
 * Deterministic Version Comparison Service.
 * Compares two snapshots or historical releases to accurately compute added, removed, and modified items.
 */
export class ComparisonService {
  /**
   * Compares two release snapshots (base vs target).
   * @param {Object} baseSnapshot Version A (earlier)
   * @param {Object} targetSnapshot Version B (later)
   */
  static compare(baseSnapshot, targetSnapshot) {
    if (!baseSnapshot || !targetSnapshot) {
      throw new Error('Both base and target versions must be provided for comparison.');
    }

    const baseData = baseSnapshot.snapshotData || baseSnapshot;
    const targetData = targetSnapshot.snapshotData || targetSnapshot;

    const baseRelease = baseData.release || baseData;
    const targetRelease = targetData.release || targetData;

    const baseItems = Array.isArray(baseData.items) ? baseData.items : [];
    const targetItems = Array.isArray(targetData.items) ? targetData.items : [];

    const baseEvidence = Array.isArray(baseData.evidence) ? baseData.evidence : [];
    const targetEvidence = Array.isArray(targetData.evidence) ? targetData.evidence : [];

    // 1. Compare Release Items
    const itemDiff = this.diffCollections(
      baseItems,
      targetItems,
      (item) => item.code || item.id || `${item.category}:${item.title}`,
      (base, target) => {
        const changes = [];
        if (base.title !== target.title) {
          changes.push({ field: 'title', from: base.title, to: target.title });
        }
        if ((base.description || '') !== (target.description || '')) {
          changes.push({ field: 'description', from: base.description || '', to: target.description || '' });
        }
        if (base.category !== target.category) {
          changes.push({ field: 'category', from: base.category, to: target.category });
        }
        return changes;
      }
    );

    // 2. Compare QA Evidence Records
    const evidenceDiff = this.diffCollections(
      baseEvidence,
      targetEvidence,
      (ev) => ev.code || ev.id || ev.title,
      (base, target) => {
        const changes = [];
        if (base.title !== target.title) {
          changes.push({ field: 'title', from: base.title, to: target.title });
        }
        if (base.details !== target.details) {
          changes.push({ field: 'details', from: base.details, to: target.details });
        }
        if (base.status !== target.status) {
          changes.push({ field: 'status', from: base.status, to: target.status });
        }
        if (base.type !== target.type) {
          changes.push({ field: 'type', from: base.type, to: target.type });
        }
        return changes;
      }
    );

    // 3. Compare Metadata
    const metadataChanges = [];
    if (baseRelease.name !== targetRelease.name) {
      metadataChanges.push({ field: 'name', from: baseRelease.name, to: targetRelease.name });
    }
    if (baseRelease.version !== targetRelease.version) {
      metadataChanges.push({ field: 'version', from: baseRelease.version, to: targetRelease.version });
    }
    if ((baseRelease.description || '') !== (targetRelease.description || '')) {
      metadataChanges.push({ field: 'description', from: baseRelease.description || '', to: targetRelease.description || '' });
    }
    if ((baseRelease.qaSummary || '') !== (targetRelease.qaSummary || '')) {
      metadataChanges.push({ field: 'qaSummary', from: baseRelease.qaSummary || '', to: targetRelease.qaSummary || '' });
    }

    // Compute summary metrics
    const totalChanges = itemDiff.added.length + itemDiff.removed.length + itemDiff.modified.length +
                         evidenceDiff.added.length + evidenceDiff.removed.length + evidenceDiff.modified.length +
                         metadataChanges.length;

    return {
      baseVersion: baseSnapshot.versionLabel || baseRelease.version || 'Base',
      targetVersion: targetSnapshot.versionLabel || targetRelease.version || 'Target',
      hasDifferences: totalChanges > 0,
      totalChanges,
      metadataChanges,
      itemDiff: {
        added: itemDiff.added,
        removed: itemDiff.removed,
        modified: itemDiff.modified,
        unchanged: itemDiff.unchanged,
        summary: {
          addedCount: itemDiff.added.length,
          removedCount: itemDiff.removed.length,
          modifiedCount: itemDiff.modified.length,
          unchangedCount: itemDiff.unchanged.length
        }
      },
      evidenceDiff: {
        added: evidenceDiff.added,
        removed: evidenceDiff.removed,
        modified: evidenceDiff.modified,
        unchanged: evidenceDiff.unchanged,
        summary: {
          addedCount: evidenceDiff.added.length,
          removedCount: evidenceDiff.removed.length,
          modifiedCount: evidenceDiff.modified.length,
          unchangedCount: evidenceDiff.unchanged.length
        }
      }
    };
  }

  /**
   * Helper that diffs two lists of entities by key and field comparator.
   */
  static diffCollections(baseList, targetList, keyFn, changeDetectorFn) {
    const baseMap = new Map();
    const targetMap = new Map();

    for (const item of baseList) {
      baseMap.set(keyFn(item), item);
    }
    for (const item of targetList) {
      targetMap.set(keyFn(item), item);
    }

    const added = [];
    const removed = [];
    const modified = [];
    const unchanged = [];

    // Check targets for added or modified
    for (const [key, targetItem] of targetMap.entries()) {
      if (!baseMap.has(key)) {
        added.push(targetItem);
      } else {
        const baseItem = baseMap.get(key);
        const changes = changeDetectorFn(baseItem, targetItem);
        if (changes.length > 0) {
          modified.push({
            key,
            item: targetItem,
            baseItem,
            changes
          });
        } else {
          unchanged.push(targetItem);
        }
      }
    }

    // Check base for removed
    for (const [key, baseItem] of baseMap.entries()) {
      if (!targetMap.has(key)) {
        removed.push(baseItem);
      }
    }

    return { added, removed, modified, unchanged };
  }
}
