import { flattenPageNodes } from '@/lib/lexical/utils/document-composer/node-utils';
import { nodesToFountain } from '@/lib/lexical/utils/document-composer/fountain';

// A guided demo starts from its fixture on every load, never a device backup.
export const documentKey = content => JSON.stringify(flattenPageNodes(content.root.children));
export const draftText = content => nodesToFountain(content.root.children);
export function draftDifferences(local, cloud, limit = 12) {
  const localLines = local.split('\n').filter(line => line.trim()), cloudLines = cloud.split('\n').filter(line => line.trim());
  const inLocal = new Set(localLines), inCloud = new Set(cloudLines);
  return { onlyLocal: localLines.filter(line => !inCloud.has(line)).slice(0, limit), onlyCloud: cloudLines.filter(line => !inLocal.has(line)).slice(0, limit) };
}
export const listRecoveryDrafts = async () => [];
export const writeRecoveryDraft = async () => {};
export const removeRecoveryDraft = async () => {};
export const recoveryQuery = (owner, projectId) => ({
  queryKey: ['preview-draft-recovery', owner, projectId],
  queryFn: listRecoveryDrafts,
});
