/**
 * Add/remove dashboard metrics here.
 *
 * This file intentionally contains the metric definitions used by the UI.
 * More complicated metrics can be added to lib/analytics.ts and then exposed here.
 */

export type MetricDefinition = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

export const metricConfig: MetricDefinition[] = [
  {
    id: "totalUsers",
    label: "Users",
    description: "Unique users seen in the selected period",
    enabled: true,
  },
  {
    id: "dailyActiveUsers",
    label: "DAU",
    description: "Unique users active today",
    enabled: true,
  },
  {
    id: "weeklyActiveUsers",
    label: "WAU",
    description: "Unique users active in the last 7 days",
    enabled: true,
  },
  {
    id: "onboardingRate",
    label: "Onboarding",
    description: "Users completing onboarding",
    enabled: true,
  },
  {
    id: "planRate",
    label: "First plan",
    description: "Users generating a plan",
    enabled: true,
  },
  {
    id: "checkinRate",
    label: "First check-in",
    description: "Users completing a daily check-in",
    enabled: true,
  },
  {
    id: "d1",
    label: "D1 retention",
    description: "Users returning one day after signup",
    enabled: true,
  },
  {
    id: "d7",
    label: "D7 retention",
    description: "Users returning seven days after signup",
    enabled: true,
  },
  {
    id: "d30",
    label: "D30 retention",
    description: "Users returning thirty days after signup",
    enabled: true,
  },
];
