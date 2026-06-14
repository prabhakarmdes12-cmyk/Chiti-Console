type GAPageView = {
  pageUrl: string;
  pageViews: number;
  sessions: number;
};

type GATrafficSource = {
  source: string;
  sessions: number;
  pageViews: number;
};

export async function fetchGAPageViews(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<{ pageViews: GAPageView[]; sources: GATrafficSource[] }> {
  const credentials = process.env.GA4_CLIENT_EMAIL && process.env.GA4_PRIVATE_KEY
    ? { clientEmail: process.env.GA4_CLIENT_EMAIL, privateKey: process.env.GA4_PRIVATE_KEY }
    : null;

  if (!credentials) {
    return { pageViews: [], sources: [] };
  }

  try {
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.clientEmail,
        private_key: credentials.privateKey.replace(/\\n/g, "\n"),
      },
    });

    const [pageViewResponse]: any = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "sessions" },
      ],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 20,
    });

    const pageViews: GAPageView[] = (pageViewResponse.rows || []).map((row: any) => ({
      pageUrl: row.dimensionValues?.[0]?.value || "",
      pageViews: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
    }));

    const [sourceResponse]: any = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    });

    const sources: GATrafficSource[] = (sourceResponse.rows || []).map((row: any) => ({
      source: row.dimensionValues?.[0]?.value || "(direct)",
      sessions: parseInt(row.metricValues?.[0]?.value || "0"),
      pageViews: parseInt(row.metricValues?.[1]?.value || "0"),
    }));

    return { pageViews, sources };
  } catch (e) {
    console.error("GA4 fetch failed:", e);
    return { pageViews: [], sources: [] };
  }
}
