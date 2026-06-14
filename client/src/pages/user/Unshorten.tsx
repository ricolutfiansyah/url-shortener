import { createSignal, Show } from 'solid-js';
import { client } from '../../lib/api';

export default function Unshorten() {
  const [unshortenInput, setUnshortenInput] = createSignal('');
  const [revealedUrl, setRevealedUrl] = createSignal('');
  const [isUnshortening, setIsUnshortening] = createSignal(false);
  const [unshortenError, setUnshortenError] = createSignal('');

  const handleUnshorten = async (e: Event) => {
    e.preventDefault();
    setUnshortenError('');
    setRevealedUrl('');
    setIsUnshortening(true);

    const code = unshortenInput().split('/').pop();

    try {
      const res = await client.api.links.info[':code'].$get({
        param: { code: code || '' },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setUnshortenError(data.message || 'Link not found');
        return;
      }
      setRevealedUrl(data.data.originalUrl);
    } catch (err) {
      setUnshortenError('A network error occurred.');
    } finally {
      setIsUnshortening(false);
    }
  };

  return (
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-2xl relative z-10 overflow-hidden p-8 md:p-12 text-center">
      <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
        Check a link safely
      </h2>
      <p class="text-gray-500 mb-8">
        See exactly where a short link goes before you click it
      </p>
      <form onSubmit={handleUnshorten} class="flex flex-col gap-4">
        <input
          type="text"
          class="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-5 py-4 text-lg outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 transition-all placeholder:text-gray-400"
          placeholder="Paste short code or full short URL"
          value={unshortenInput()}
          onInput={(e) => setUnshortenInput(e.currentTarget.value)}
          required
        />
        <button
          type="submit"
          class="w-full bg-gray-900 hover:bg-black disabled:opacity-60 text-white font-bold text-lg py-4 px-6 rounded-xl transition-colors shadow-sm cursor-pointer"
          disabled={isUnshortening()}
        >
          {isUnshortening() ? 'Checking...' : 'Reveal Original URL'}
        </button>
      </form>
      <Show when={unshortenError()}>
        <p class="text-red-500 font-medium mt-4">{unshortenError()}</p>
      </Show>
      <Show when={revealedUrl()}>
        <div class="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <p class="text-sm text-green-700 mb-2 font-bold">
            This link is safe and redirects to:
          </p>
          <a
            href={revealedUrl()}
            target="_blank"
            class="text-gray-900 font-bold text-lg hover:underline break-all"
          >
            {revealedUrl()}
          </a>
        </div>
      </Show>
    </div>
  );
}
