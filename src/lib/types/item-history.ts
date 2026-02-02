import { TransactionStatus, ReferenceType, MaterialEventType } from "@prisma/client";
import type { MaterialInfo, MaterialInfoExtended, PaginationInfo } from "./lifecycle";

// Transaction event step
export interface TransactionEventStep {
  id: string;
  eventType: MaterialEventType;
  eventDate: string;
  actorName: string;
  stepOrder: number | null;
  stepTitle: string | null;
  description: string;
}

// Transaction DTO for history
export interface MaterialTransactionDto {
  id: string;
  title: string;
  status: TransactionStatus;
  quantity: number;
  referenceType: ReferenceType;
  referenceId: string;
  counterpartyName: string | null;
  outboundPurpose: { code: string; name: string } | null;
  inboundType: { code: string; name: string } | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  events?: TransactionEventStep[];
}

// Statistics for item history
export interface ItemHistoryStatistics {
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  totalInbound: number;
  totalOutbound: number;
  ageInDays: number;
  ageDisplay: { value: number; unit: string };
}

// Main history response
export interface MaterialHistoryResponse {
  material: MaterialInfo | MaterialInfoExtended;
  statistics: ItemHistoryStatistics;
  transactions: MaterialTransactionDto[];
  pagination: PaginationInfo;
}

// Single transaction detail response
export interface MaterialTransactionDetailResponse {
  transaction: MaterialTransactionDto;
  material: MaterialInfo;
}
