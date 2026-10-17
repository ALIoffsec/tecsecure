import type { RequestStatus } from "@prisma/client";

const transitions: Record<RequestStatus, readonly RequestStatus[]> = {
  NEW: ["UNDER_REVIEW", "CONTACTED", "REJECTED", "CANCELLED"],
  UNDER_REVIEW: ["CONTACTED", "INSPECTION_REQUIRED", "QUOTATION_SENT", "REJECTED", "CANCELLED"],
  CONTACTED: ["INSPECTION_REQUIRED", "QUOTATION_SENT", "APPROVED", "REJECTED", "CANCELLED"],
  INSPECTION_REQUIRED: ["QUOTATION_SENT", "REJECTED", "CANCELLED"],
  QUOTATION_SENT: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: []
};

export function canTransitionRequest(from: RequestStatus, to: RequestStatus, isCustomer: boolean): boolean {
  if (isCustomer && to !== "CANCELLED") return false;
  return transitions[from].includes(to);
}
