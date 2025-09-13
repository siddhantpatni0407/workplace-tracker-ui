// src/types/leavePolicy.ts
export type LeavePolicyDTO = {
  policyId?: number;
  policyCode: string;
  policyName: string;
  defaultAnnualDays: number;
  description?: string | null;
};
