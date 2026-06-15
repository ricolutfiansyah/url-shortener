import { createSignal, Show } from 'solid-js';
import { client } from '../../lib/api';
import QRCode from 'qrcode';
import { Modal } from '../../components/ui/Modal';

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

  const [isQrModalOpen, setIsQrModalOpen] = createSignal(false);
  const [qrDataUrl, setQrDataUrl] = createSignal('');

  const handleGenerateQr = async () => {
    try {
      const imgUrl = await QRCode.toDataURL(shortUrl(), { width: 400, margin: 2 });
      setQrDataUrl(imgUrl);
      setIsQrModalOpen(true);
    } catch (err) {
      console.error('Failed to generate QR code', err);
    }
  };

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
    <div class="w-full max-w-5xl flex flex-col items-center gap-8 px-4">
      {/* Main Shortener Box */}
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-2xl relative z-10 overflow-hidden p-8 md:p-12 text-center">
        <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
          Create a short link
        </h2>
        <p class="text-gray-500 mb-8">
          Fast, secure, and trackable short URLs.
        </p>
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
              class="sm:w-auto min-w-35 bg-white border border-gray-200 text-gray-900 rounded-xl pl-4 pr-10 py-4 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-position-[right_1rem_center] bg-size-[1em_1em]"
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
              <div class="flex items-center gap-2">
                <button
                  class="bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 font-medium py-2 px-6 rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
                  onClick={copyToClipboard}
                >
                  Copy
                </button>
                <button
                  class="bg-white border border-blue-200 hover:bg-blue-100 text-blue-700 font-medium py-2 px-3 rounded-lg text-sm transition-colors shadow-sm cursor-pointer flex items-center justify-center"
                  onClick={handleGenerateQr}
                  title="QR Code"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                </button>
              </div>
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

      {/* Feature Cards Grid */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Feature 1 */}
        <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Easy & Fast</h3>
          <p class="text-gray-500 leading-relaxed">
            ShortLink is built for speed. Paste your long URL, hit shorten, and
            get your clean link in milliseconds. No sign-up required.
          </p>
        </div>

        {/* Feature 2 */}
        <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">
            Custom Expiration
          </h3>
          <p class="text-gray-500 leading-relaxed">
            Need a temporary link? You can set your short URLs to automatically
            expire in 1 hour, 24 hours, or 7 days to keep your data secure.
          </p>
        </div>

        {/* Feature 3 */}
        <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Live Analytics</h3>
          <p class="text-gray-500 leading-relaxed">
            Track your audience in real-time. See your total clicks, and break
            them down by browsers and operating systems instantly.
          </p>
        </div>
      </div>

      <Modal 
        isOpen={isQrModalOpen()} 
        onClose={() => setIsQrModalOpen(false)}
        title="QR Code"
      >
        <div class="flex flex-col items-center justify-center gap-6">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-max">
            <img src={qrDataUrl()} alt="QR Code" class="w-64 h-64 object-contain" />
          </div>
          <div class="w-full text-center">
            <p class="text-sm text-gray-500 truncate w-full mb-4" title={url()}>
              Destination: {url()}
            </p>
            <a 
              href={qrDataUrl()} 
              download="qrcode.png"
              class="w-full inline-block"
            >
              <button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm cursor-pointer">
                Download PNG
              </button>
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
}
