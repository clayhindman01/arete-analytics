"use client";

import { useEffect, useMemo, useState } from "react";
import MetricCard from "./MetricCard";
import ChartCard from "./ChartCard";
import { supabase } from "../lib/supabase";
import {
  AnalyticsEvent,
  adherenceSeries,
  dailySeries,
  eventDailyCount,
  fetchEvents,
  retention,
  uniqueUsers,
  uniqueUsersForEvent,
} from "../lib/analytics";
import { metricConfig } from "../lib/metricConfig";

type Range = 7 | 30 | 90;

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [range, setRange] = useState<Range>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchEvents(range);
      setEvents(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [range]);

  const metrics = useMemo(() => {
    const users = uniqueUsers(events);

    const onboarding = uniqueUsersForEvent(events, "onboarding_completed");
    const plans = uniqueUsersForEvent(events, "plan_generated");
    const checkins = uniqueUsersForEvent(events, "daily_check_in_completed");

    const todayKey = new Date().toISOString().slice(0, 10);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);

    const dau = new Set(
      events
        .filter(
          (e) =>
            e.created_at.slice(0, 10) === todayKey &&
            e.user_id
        )
        .map((e) => e.user_id)
    ).size;

    const wau = new Set(
      events
        .filter((e) => new Date(e.created_at) >= weekStart && e.user_id)
        .map((e) => e.user_id)
    ).size;

    return {
      users,
      dau,
      wau,
      onboarding: users ? Math.round((onboarding / users) * 100) : 0,
      plans: users ? Math.round((plans / users) * 100) : 0,
      checkins: users ? Math.round((checkins / users) * 100) : 0,
      d1: retention(events, 1),
      d7: retention(events, 7),
      d30: retention(events, 30),
    };
  }, [events]);

  const activeSeries = dailySeries(events, "app_opened", range);
  const planSeries = eventDailyCount(events, "daily_plan_completed", range);
  const checkinSeries = eventDailyCount(events, "daily_check_in_completed", range);
  const adherence = adherenceSeries(events, range);

  const enabled = (id: string) =>
    metricConfig.find((m) => m.id === id)?.enabled ?? false;

  if (!supabase) {
    return (
      <main className="page">
        <div className="setup-card">
          <h1>Arete Analytics</h1>
          <p>
            Add your Supabase credentials to <code>.env.local</code> and restart
            the development server.
          </p>
          <pre>{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...`}</pre>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">ARETE</div>
          <h1>Analytics</h1>
          <p className="subtitle">
            Product health, activation, engagement, and retention.
          </p>
        </div>

        <div className="controls">
          <div className="range">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                className={range === days ? "active" : ""}
                onClick={() => setRange(days as Range)}
              >
                {days}d
              </button>
            ))}
          </div>
          <button className="refresh" onClick={load}>
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="error">
          <strong>Analytics unavailable.</strong>
          <span>{error}</span>
          <small>
            Make sure the analytics_events table exists and your authenticated
            user has SELECT access.
          </small>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading analytics…</div>
      ) : (
        <>
          <section>
            <div className="section-heading">
              <h2>Overview</h2>
              <span>
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString()}`
                  : ""}
              </span>
            </div>

            <div className="metrics-grid">
              {enabled("totalUsers") && (
                <MetricCard
                  label="Users"
                  value={metrics.users.toLocaleString()}
                  description={`Unique users in the last ${range} days`}
                />
              )}
              {enabled("dailyActiveUsers") && (
                <MetricCard
                  label="DAU"
                  value={metrics.dau.toLocaleString()}
                  description="Active users today"
                />
              )}
              {enabled("weeklyActiveUsers") && (
                <MetricCard
                  label="WAU"
                  value={metrics.wau.toLocaleString()}
                  description="Active users in the last 7 days"
                />
              )}
              {enabled("onboardingRate") && (
                <MetricCard
                  label="Onboarding"
                  value={`${metrics.onboarding}%`}
                  description="Users completing onboarding"
                />
              )}
              {enabled("planRate") && (
                <MetricCard
                  label="First plan"
                  value={`${metrics.plans}%`}
                  description="Users generating a plan"
                />
              )}
              {enabled("checkinRate") && (
                <MetricCard
                  label="First check-in"
                  value={`${metrics.checkins}%`}
                  description="Users completing a check-in"
                />
              )}
              {enabled("d1") && (
                <MetricCard
                  label="D1 retention"
                  value={metrics.d1 === null ? "—" : `${metrics.d1}%`}
                  description="Return one day after signup"
                />
              )}
              {enabled("d7") && (
                <MetricCard
                  label="D7 retention"
                  value={metrics.d7 === null ? "—" : `${metrics.d7}%`}
                  description="Return seven days after signup"
                />
              )}
              {enabled("d30") && (
                <MetricCard
                  label="D30 retention"
                  value={metrics.d30 === null ? "—" : `${metrics.d30}%`}
                  description="Return thirty days after signup"
                />
              )}
            </div>
          </section>

          <section>
            <div className="section-heading">
              <h2>Engagement</h2>
              <span>Last {range} days</span>
            </div>

            <div className="charts-grid">
              <ChartCard
                title="Active users"
                description="Unique users who opened Arete each day."
                data={activeSeries}
                dataKey="count"
              />
              <ChartCard
                title="Plans completed"
                description="Number of completed daily plans."
                data={planSeries}
                dataKey="count"
              />
              <ChartCard
                title="Check-ins completed"
                description="Number of completed daily check-ins."
                data={checkinSeries}
                dataKey="count"
              />
              <ChartCard
                title="Daily adherence"
                description="Completed tasks divided by planned tasks."
                data={adherence}
                dataKey="adherence"
                suffix="%"
              />
            </div>
          </section>

          <section className="event-health">
            <div className="section-heading">
              <h2>Event health</h2>
              <span>Raw events received</span>
            </div>
            <div className="event-list">
              {[
                "app_opened",
                "sign_up_completed",
                "onboarding_completed",
                "plan_generated",
                "daily_plan_viewed",
                "task_completed",
                "daily_plan_completed",
                "daily_check_in_completed",
                "weekly_checkin_completed",
                "notification_opened",
                "trial_started",
                "subscription_started",
                "subscription_cancelled",
              ].map((name) => {
                const count = events.filter((e) => e.event_name === name).length;
                return (
                  <div className="event-row" key={name}>
                    <code>{name}</code>
                    <span>{count.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      <footer>
        <span>Arete internal analytics</span>
        <span>
          Data source: <code>analytics_events</code>
        </span>
      </footer>
    </main>
  );
}
