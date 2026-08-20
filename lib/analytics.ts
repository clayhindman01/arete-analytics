import { supabase } from "./supabase";

export type AnalyticsEvent = {
  id: string;
  user_id: string | null;
  event_name: string;
  properties: Record<string, unknown> | null;
  created_at: string;
};

export async function fetchEvents(days = 30): Promise<AnalyticsEvent[]> {
  if (!supabase) {
    throw new Error("Supabase environment variables are missing.");
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("analytics_events")
    .select("id,user_id,event_name,properties,created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw error;
  console.log("Fetched events:", data);
  return (data ?? []) as AnalyticsEvent[];
}

export function uniqueUsers(events: AnalyticsEvent[]) {
  return new Set(events.map((e) => e.user_id).filter(Boolean)).size;
}

export function uniqueUsersForEvent(events: AnalyticsEvent[], name: string) {
  return new Set(
    events.filter((e) => e.event_name === name).map((e) => e.user_id).filter(Boolean)
  ).size;
}

export function eventCount(events: AnalyticsEvent[], name: string) {
  return events.filter((e) => e.event_name === name).length;
}

export function dailySeries(
  events: AnalyticsEvent[],
  eventName: string,
  days: number
) {
  const result: { date: string; count: number }[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);

    const users = new Set(
      events
        .filter(
          (e) =>
            e.event_name === eventName &&
            e.created_at.slice(0, 10) === key
        )
        .map((e) => e.user_id)
        .filter(Boolean)
    );

    result.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: users.size,
    });
  }

  return result;
}

export function eventDailyCount(
  events: AnalyticsEvent[],
  eventName: string,
  days: number
) {
  const result: { date: string; count: number }[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);

    result.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: events.filter(
        (e) => e.event_name === eventName && e.created_at.slice(0, 10) === key
      ).length,
    });
  }

  return result;
}

export function adherenceSeries(events: AnalyticsEvent[], days: number) {
  const result: { date: string; adherence: number }[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);

    let planned = 0;
    let completed = 0;

    events
      .filter(
        (e) =>
          e.event_name === "daily_plan_completed" &&
          e.created_at.slice(0, 10) === key
      )
      .forEach((e) => {
        const p = e.properties ?? {};
        planned += Number(p.task_count ?? p.tasks_planned ?? 0);
        completed += Number(p.completed_count ?? p.tasks_completed ?? 0);
      });

    result.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      adherence: planned ? Math.round((completed / planned) * 100) : 0,
    });
  }

  return result;
}

export function retention(
  events: AnalyticsEvent[],
  daysAfter: number
): number | null {
  const signups = events.filter((e) => e.event_name === "sign_up_completed");
  if (!signups.length) return null;

  let eligible = 0;
  let retained = 0;

  const openedByUser = new Map<string, Set<string>>();

  events.forEach((e) => {
    if (!e.user_id) return;
    if (!openedByUser.has(e.user_id)) openedByUser.set(e.user_id, new Set());
    openedByUser.get(e.user_id)!.add(e.created_at.slice(0, 10));
  });

  signups.forEach((signup) => {
    if (!signup.user_id) return;
    const signupDate = new Date(signup.created_at);
    const target = new Date(signupDate);
    target.setDate(target.getDate() + daysAfter);

    if (target > new Date()) return;
    eligible++;
    console.log(signup, eligible)

    const targetKey = target.toISOString().slice(0, 10);
    if (openedByUser.get(signup.user_id)?.has(targetKey)) retained++;
  });

  return eligible ? Math.round((retained / eligible) * 100) : null;
}
