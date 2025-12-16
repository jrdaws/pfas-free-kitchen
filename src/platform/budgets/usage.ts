export type UsageBudget = {
  orgId: string;
  monthlyUsdCap: number;
  currentMonthUsd: number;
};

export function withinBudget(b: UsageBudget, spendUsd: number) {
  return (b.currentMonthUsd + spendUsd) <= b.monthlyUsdCap;
}
