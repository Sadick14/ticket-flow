
import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// This function checks if the required environment variables are set.
function checkCredentials() {
  return (
    process.env.GA_PROPERTY_ID &&
    process.env.GA_CLIENT_EMAIL &&
    process.env.GA_PRIVATE_KEY
  );
}

// Helper to format private key from environment variable
function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, '\n');
}

export async function GET(request: NextRequest) {
  if (!checkCredentials()) {
    console.error('Google Analytics credentials are not set in environment variables.');
    return NextResponse.json(
      { error: 'Analytics service is not configured on the server.' },
      { status: 500 }
    );
  }

  const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA_CLIENT_EMAIL,
      private_key: formatPrivateKey(process.env.GA_PRIVATE_KEY!),
    },
  });

  const propertyId = process.env.GA_PROPERTY_ID!;
  const thirtyMinutesAgo = (new Date(Date.now() - 30 * 60 * 1000)).toISOString();
  
  try {
    // Run two reports in parallel
    const [realtimeReportResponse, coreReportResponse] = await Promise.all([
      analyticsDataClient.runRealtimeReport({
        property: `properties/${propertyId}`,
        metrics: [{ name: 'activeUsers' }],
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
        metrics: [{ name: 'sessions' }, { name: 'averageSessionDuration' }],
      }),
    ]);

    // Process Realtime Report
    const activeUsers = realtimeReportResponse[0].rows?.[0]?.metricValues?.[0]?.value ?? '0';

    // Process Core Report
    const sessions = coreReportResponse[0].rows?.[0]?.metricValues?.[0]?.value ?? '0';
    const avgDurationSeconds = parseFloat(coreReportResponse[0].rows?.[0]?.metricValues?.[1]?.value ?? '0');
    const minutes = Math.floor(avgDurationSeconds / 60);
    const seconds = Math.floor(avgDurationSeconds % 60);
    const avgSessionDuration = `${minutes}m ${seconds}s`;

    return NextResponse.json({
      activeUsers: parseInt(activeUsers, 10),
      sessions: parseInt(sessions, 10),
      avgSessionDuration,
    });

  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data from Google.' },
      { status: 500 }
    );
  }
}
