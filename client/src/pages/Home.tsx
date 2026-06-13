import { createSignal, Show } from 'solid-js';
import { client } from '../lib/api';

export default function Home() {
  const [url, setUrl] = createSignal('');
  const [shortUrl, setShortUrl] = createSignal('');
  const [linkId, setLinkId] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const handleShorten = async (e: Event) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setShortUrl('');

    try {
      const res = await client.api.links.$post({
        json: { originalUrl: url() },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to shorten URL');
        return;
      }

      setShortUrl(`http://localhost:3000/api/links/${data.data.shortCode}`);
      setLinkId(data.data.id);
      setUrl('');
    } catch (err) {
      setError('An error occurred while shortening the URL');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl());
    alert('Short URL copied to clipboard!');
  };

  return (
    <div class="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* 1. Simple Navbar */}
      <nav class="w-full bg-white border-b border-gray-200 py-4 px-8">
        <div class="max-w-6xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-2 text-2xl font-black text-blue-600 tracking-tight">
            {/* Simple Link Icon SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            ShortLink
          </div>
        </div>
      </nav>

      {/* 2. Main Content Area */}
      <main class="grow flex flex-col items-center pt-16 pb-24 px-4">
        {/* The Main Shortener Card */}
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-12 w-full max-w-2xl text-center relative z-10">
          <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
            Paste the URL to be shortened
          </h1>
          <p class="text-lg text-gray-500 mb-8">
            ShortLink is a free tool to shorten URLs and generate short links
          </p>

          <form
            onSubmit={handleShorten}
            class="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="url"
              class="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-5 py-4 text-lg outline-none focus:border-blue-600 focus:ring-4
  focus:ring-blue-600/15 transition-all placeholder:text-gray-400 shadow-inner"
              placeholder="Enter the link here (https://...)"
              value={url()}
              onInput={(e) => setUrl(e.currentTarget.value)}
              required
            />
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-lg py-4 px-8 rounded-
  xl transition-colors whitespace-nowrap shadow-md cursor-pointer"
              disabled={isLoading()}
            >
              {isLoading() ? '...' : 'Shorten URL'}
            </button>
          </form>

          <Show when={error()}>
            <p class="text-red-500 font-medium mt-6">{error()}</p>
          </Show>

          <Show when={shortUrl()}>
            <div class="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl animate-fade-in">
              <p class="text-sm text-gray-500 mb-2 font-medium">
                Your shortened URL is ready!
              </p>
              <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={shortUrl()}
                  target="_blank"
                  class="text-blue-600 font-bold text-xl hover:underline break-all"
                >
                  {shortUrl()}
                </a>
                <button
                  class="bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 font-medium py-2 px-6 rounded-lg text-sm transition-colors
  shadow-sm"
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
                View Analytics for this link
              </a>
            </div>
          </Show>
        </div>

        {/* 3. The "shorturl.at" style Features Section */}
        <div class="w-full max-w-5xl mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m12 16 4-4-4-4" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">
              Simple and fast
            </h3>
            <p class="text-gray-500 leading-relaxed">
              ShortLink allows you to shorten long links from Instagram,
              Facebook, YouTube, Twitter, and top sites on the Internet.
            </p>
          </div>

          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Secure</h3>
            <p class="text-gray-500 leading-relaxed">
              It is fast and completely secure. All links are encrypted with
              HTTPS to maximize your security and privacy.
            </p>
          </div>

          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Statistics</h3>
            <p class="text-gray-500 leading-relaxed">
              Check the amount of clicks that your shortened URL received. Track
              your audience and optimize your marketing.
            </p>
          </div>
        </div>
      </main>

      {/* 4. Simple Footer */}
      <footer class="w-full text-center py-8 text-gray-400 text-sm">
        © {new Date().getFullYear()} ShortLink. Built with SolidJS & Hono.
      </footer>
    </div>
  );
}
