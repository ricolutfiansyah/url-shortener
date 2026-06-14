import { createResource, Show, For, ErrorBoundary } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import { client } from '../../lib/api';

const fetchStats = async (id: string) => {
  const res = await client.api.analytics[':linkId'].$get({
    param: { linkId: id },
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load stats');
  }

  return data.data;
};

export default function Stats() {
  const params = useParams();
  const [stats, { refetch }] = createResource(() => params.id, fetchStats);

  return (
    <div class="w-full max-w-3xl">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl font-extrabold text-gray-900">Link Analytics</h1>
          <button
            onClick={() => refetch()}
            disabled={stats.loading}
            class="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {stats.loading ? 'Refreshing...' : 'Refresh 🔄'}
          </button>
          <A href="/" class="text-blue-600 hover:underline font-medium">
            ← Back to Home
          </A>
        </div>

        <Show when={stats.loading}>
          <div class="text-center text-gray-500 py-10">
            Loading statistics...
          </div>
        </Show>

        <ErrorBoundary
          fallback={(err) => (
            <div class="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl mt-4">
              {err?.message || 'An error occurred while fetching stats'}
            </div>
          )}
        >
          <Show when={stats()}>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Clicks Card */}
              <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center col-span-1 md:col-span-3">
                <p class="text-gray-500 text-sm font-medium uppercase tracking-wide">
                  Total Clicks
                </p>
                <p class="text-6xl font-black text-blue-600 mt-2">
                  {stats()?.totalClicks}
                </p>
              </div>

              {/* Browsers Card */}
              <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm md:col-span-1">
                <h3 class="text-gray-900 font-bold mb-4">Browsers</h3>
                <ul class="space-y-3">
                  <Show when={stats()?.browser?.length === 0}>
                    <li class="text-gray-400 text-sm">No data yet</li>
                  </Show>
                  <For each={stats()?.browser}>
                    {(b) => (
                      <li class="flex justify-between items-center text-sm">
                        <span class="text-gray-700">{b.name || 'Unknown'}</span>
                        <span class="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {b.count}
                        </span>
                      </li>
                    )}
                  </For>
                </ul>
              </div>

              {/* Platforms Card */}
              <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm md:col-span-2">
                <h3 class="text-gray-900 font-bold mb-4">Platforms (OS)</h3>
                <ul class="space-y-3">
                  <Show when={stats()?.platform?.length === 0}>
                    <li class="text-gray-400 text-sm">No data yet</li>
                  </Show>
                  <For each={stats()?.platform}>
                    {(p) => (
                      <li class="flex justify-between items-center text-sm">
                        <span class="text-gray-700">{p.name || 'Unknown'}</span>
                        <span class="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {p.total}
                        </span>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            </div>
          </Show>
        </ErrorBoundary>
    </div>
  );
}
