import { createSignal, Show } from 'solid-js';
import { client } from '../../lib/api';

type HistoryItem = {
  id: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: number;
};

export default function Home() {
  const [url, setUrl] = createSignal('');
  const [expireOption, setExpireOption] = createSignal('never');
  const [shortUrl, setShortUrl] = createSignal('');
  const [linkId, setLinkId] = createSignal('');
  const [isShortening, setIsShortening] = createSignal(false);
  const [shortenError, setShortenError] = createSignal('');

  const handleShorten = async (e: Event) => {
    e.preventDefault();
    setShortenError('');
    setIsShortening(true);

    let expiresAt: string | undefined = undefined;
    const opt = expireOption();
    const now = new Date();

    if (opt === '1h')
      expiresAt = new Date(now.getTime() + 1000 * 60 * 60).toISOString();
    else if (opt === '1d')
      expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString();
    else if (opt === '1w')
      expiresAt = new Date(
        now.getTime() + 1000 * 60 * 60 * 24 * 7,
      ).toISOString();

    try {
      const res = await client.api.links.$post({
        json: {
          originalUrl: url(),
          expiresAt,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        setShortenError(data.message || 'Failed to shorten URL');
        return;
      }

      const newShortUrl = `http://localhost:3000/api/links/${data.data.shortCode}`;
      setShortUrl(newShortUrl);
      setLinkId(data.data.id);

      const newHistoryItem: HistoryItem = {
        id: data.data.id,
        shortUrl: newShortUrl,
        originalUrl: url(),
        createdAt: Date.now(),
      };

      const saved = localStorage.getItem('shortlink_history');
      let prev: HistoryItem[] = [];
      if (saved) {
        try {
          prev = JSON.parse(saved);
        } catch (e) {}
      }
      const next = [newHistoryItem, ...prev].slice(0, 10);
      localStorage.setItem('shortlink_history', JSON.stringify(next));

      setUrl('');
    } catch (err) {
      setShortenError('An error occurred while shortening the URL');
    } finally {
      setIsShortening(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl());
    alert('Short URL copied to clipboard!');
  };

  return (
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-2xl relative z-10 overflow-hidden p-8 md:p-12 text-center">
      <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
        Create a short link
      </h2>
      <p class="text-gray-500 mb-8">Fast, secure, and trackable short URLs.</p>
      <form onSubmit={handleShorten} class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <input
            type="url"
            class="grow bg-white border border-gray-200 text-gray-900 rounded-xl px-5 py-4 text-lg outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 transition-all placeholder:text-gray-400"
            placeholder="Paste long URL (https://)"
            value={url()}
            onInput={(e) => setUrl(e.currentTarget.value)}
            required
          />
          <select
            class="sm:w-48 bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-4 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 cursor-pointer"
            value={expireOption()}
            onChange={(e) => setExpireOption(e.currentTarget.value)}
          >
            <option value="never">Never Expire</option>
            <option value="1h">Expire in 1 Hour</option>
            <option value="24h">Expire in 24 Hours</option>
            <option value="7d">Expire in 7 Days</option>
          </select>
        </div>
        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-lg py-4 px-6 rounded-xl transition-colors shadow-sm cursor-pointer"
          disabled={isShortening()}
        >
          {isShortening() ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>
      <Show when={shortenError()}>
        <p class="text-red-500 font-medium mt-4">{shortenError()}</p>
      </Show>
      <Show when={shortUrl()}>
        <div class="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <p class="text-sm text-gray-500 mb-2 font-medium">
            Your shortened URL is ready!
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <a
              href={shortUrl()}
              target="_blank"
              class="text-blue-600 font-bold text-xl hover:underline break-all"
            >
              {shortUrl()}
            </a>
            <button
              class="bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 font-medium py-2 px-6 rounded-lg text-sm transition-colors shadow-sm"
              onClick={copyToClipboard}
            >
              Copy
            </button>
          </div>
          <a
            href={`/stats/${linkId()}`}
            target="_blank"
            class="text-sm text-blue-600 hover:text-blue-800 underline flex items-center justify-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            View secret Analytics link
          </a>
        </div>
      </Show>
    </div>
  );
}
