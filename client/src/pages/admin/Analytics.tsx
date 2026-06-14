import { createResource, Show, For } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import { client } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const fetchAnalytics = async (linkId: string) => {
  const res = await client.api.analytics[':linkId'].$get({
    param: { linkId },
  });
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch analytics');
  }

  return data.data;
};

export default function Analytics() {
  const params = useParams();

  const [analytics] = createResource(() => params.id, fetchAnalytics);

  return (
    <div class="max-w-6xl mx-auto space-y-8">
      <div class="flex items-center gap-4">
        <A href="/dashboard">
          <Button variant="ghost" size="sm" class="pl-2 pr-4 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="m15 18-6-6 6-6" /></svg>
            Back
          </Button>
        </A>
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Link Analytics</h2>
          <p class="text-muted-foreground mt-1">Detailed click statistics for your link</p>
        </div>
      </div>

      <Show when={analytics.loading}>
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Show>

      <Show when={analytics.error}>
        <div class="p-4 text-red-400 bg-red-950/50 border border-red-900/50 rounded-md">
          <p>Error: {analytics.error.message}</p>
        </div>
      </Show>

      <Show when={analytics()}>
        <div class="grid gap-6 md:grid-cols-3">

          {/* Total Clicks Card */}
          <Card class="md:col-span-3 lg:col-span-1 border-primary/20 bg-primary/5">
            <CardHeader class="pb-2">
              <CardTitle class="text-lg font-medium text-muted-foreground">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-5xl font-bold">{analytics()?.totalClicks}</div>
            </CardContent>
          </Card>

          {/* Browser Stats */}
          <Card class="md:col-span-3 lg:col-span-1">
            <CardHeader>
              <CardTitle>Browser Distribution</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <Show when={(analytics()?.browser?.length || 0) > 0} fallback={<p class="text-muted-foreground text-sm">No data available.</p>}>
                <For each={analytics()?.browser}>
                  {(item) => (
                    <div class="space-y-1">
                      <div class="flex items-center justify-between text-sm">
                        <span class="font-medium">{item.name || 'Unknown'}</span>
                        <span class="text-muted-foreground">{item.count} ({Math.round((item.count / Math.max(analytics()?.totalClicks || 1, 1)) * 100)}%)</span>
                      </div>
                      <div class="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          class="h-full bg-primary"
                          style={{ width: `${(item.count / Math.max(analytics()?.totalClicks || 1, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </For>
              </Show>
            </CardContent>
          </Card>

          {/* Platform Stats */}
          <Card class="md:col-span-3 lg:col-span-1">
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <Show when={(analytics()?.platform?.length || 0) > 0} fallback={<p class="text-muted-foreground text-sm">No data available.</p>}>
                <For each={analytics()?.platform}>
                  {(item) => (
                    <div class="space-y-1">
                      <div class="flex items-center justify-between text-sm">
                        <span class="font-medium">{item.name || 'Unknown'}</span>
                        <span class="text-muted-foreground">{item.total} ({Math.round((item.total / Math.max(analytics()?.totalClicks || 1, 1)) * 100)}%)</span>
                      </div>
                      <div class="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          class="h-full bg-primary"
                          style={{ width: `${(item.total / Math.max(analytics()?.totalClicks || 1, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </For>
              </Show>
            </CardContent>
          </Card>

        </div>
      </Show>
    </div>
  );
}
