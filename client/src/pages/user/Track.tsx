import { createSignal, onMount, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';

type HistoryItem = {
  id: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: number;
};

export default function Track() {
  const navigate = useNavigate();
  const [trackInput, setTrackInput] = createSignal('');
  const [history, setHistory] = createSignal<HistoryItem[]>([]);

  onMount(() => {
    const saved = localStorage.getItem('shortlink_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  });

  const handleTrack = (e: Event) => {
    e.preventDefault();

    let trackId = trackInput().trim();
    if (trackId) {
      if (trackId.includes('/')) {
        trackId = trackId.split('/').pop() || trackId;
      }
      navigate(`/stats/${trackId}`);
    }
  };

  return (
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-2xl relative z-10 overflow-hidden p-8 md:p-12 text-center">
      <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
        Track your audience
      </h2>
      <p class="text-gray-500 mb-8">
        Paste your secret tracking ID to view live analytics.
      </p>
      <form onSubmit={handleTrack} class="flex flex-col gap-4">
        <input
          type="text"
          class="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-5 py-4 text-lg outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 transition-all placeholder:text-gray-400"
          placeholder="e.g. 550e8400-e29b-41d4-a716..."
          value={trackInput()}
          onInput={(e) => setTrackInput(e.currentTarget.value)}
          required
        />
        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-6 rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          View Analytics
        </button>
      </form>

      <Show when={history().length > 0}>
        <div class="mt-12 text-left">
          <h3 class="text-gray-900 font-bold mb-4 text-lg">
            Your Recent Links
          </h3>
          <div class="space-y-3">
            <For each={history()}>
              {(item) => (
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div class="overflow-hidden flex-1 w-full text-left">
                    <p class="text-gray-900 font-bold truncate text-sm">
                      {item.shortUrl}
                    </p>
                    <p class="text-gray-500 text-xs truncate">
                      {item.originalUrl}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/stats/${item.id}`)}
                    class="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors whitespace-nowrap shadow-sm cursor-pointer"
                  >
                    View Stats
                  </button>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
