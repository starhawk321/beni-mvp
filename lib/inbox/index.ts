// Inbox-shaped views of FHIR data, ready for the inbox/findings surfaces.
// FHIR resources stay as the source of truth; this layer just reshapes them
// for the UI + audit engine + reconciliation pipeline.

export type {
  InboxItem,
  InboxItemKind,
  InboxEOB,
  InboxEOBAmounts,
  InboxEOBDenial,
  InboxReconciliationKey,
} from './types'

export {
  toInboxEOB,
  toInboxEOBs,
  aggregateInboxItems,
} from './from-fhir'
