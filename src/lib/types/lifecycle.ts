import { MaterialEventType } from "@prisma/client";

// Material info displayed in lifecycle view
export interface MaterialInfo {
  id: string;
  code: string;
  name: string;
  serialNumber: string | null;
  partNo: string;
  category: { code: string; name: string };
  unit: { code: string; name: string };
  status: { code: string; name: string; color: string | null };
}

// Extended material info for goods-history view
export interface MaterialInfoExtended extends MaterialInfo {
  nameEn: string | null;
  manufacturer: string | null;
  location: string | null;
  stockAge: string | null;
  supplierWarranty: string | null;
  serviceWarranty: string | null;
  chassisPn: string | null;
  chassisSn: string | null;
  origin: string | null;
  originAsPerCustomer: string | null;
  originOnDocs: string | null;
  warrantyCount: number | null;
  lifespan: string | null;
}

// Current location/installation info
export interface LocationInfo {
  type: "warehouse" | "installed" | "unknown";
  name: string;
  slotInfo?: string | null;
  installedAt?: string;
  installedBy?: { id: string; name: string };
}

// Single lifecycle event DTO
export interface MaterialEventDto {
  id: string;
  eventType: MaterialEventType;
  eventDate: string;
  actorId: string;
  actorName: string;
  referenceType: string;
  referenceId: string;
  referenceCode: string;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// Pagination info
export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
}

// Main lifecycle response
export interface MaterialLifecycleResponse {
  material: MaterialInfo;
  currentLocation: LocationInfo;
  timeline: MaterialEventDto[];
  pagination: PaginationInfo;
}

// Event logging input for internal use
export interface CreateMaterialEventInput {
  materialId: string;
  eventType: MaterialEventType;
  eventDate: Date;
  actorId: string;
  actorName: string;
  referenceType: string;
  referenceId: string;
  referenceCode: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}
