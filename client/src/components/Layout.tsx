import { A, useLocation } from '@solidjs/router';

export default function Layout(props: any) {
  const location = useLocation();

  return (
    <div class="min-h-screen bg-gray-50 font-serif flex flex-col">
      <nav class="w-full bg-white border-b border-gray-200 py-4 px-8">
        <div class="max-w-6xl mx-auto flex items-center justify-between">
          <A
            href="/"
            class="flex items-center gap-2 text-2xl font-black text-blue-600 tracking-tight hover:opacity-80 transition-opacity"
          >
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
          </A>
          <div class="flex gap-6 font-semibold text-gray-600">
            <A
              href="/"
              class={`hover:text-blue-600 transition-colors ${location.pathname === '/' ? 'text-blue-600' : ''}`}
            >
              Shorten
            </A>
            <A
              href="/track"
              class={`hover:text-blue-600 transition-colors ${location.pathname === '/track' ? 'text-blue-600' : ''}`}
            >
              Track Stats
            </A>
            <A
              href="/unshorten"
              class={`hover:text-blue-600 transition-colors ${location.pathname === '/unshorten' ? 'text-blue-600' : ''}`}
            >
              Unshorten
            </A>
          </div>
        </div>
      </nav>
      <main class="grow flex flex-col items-center pt-16 pb-8 px-4">
        {props.children}
      </main>
    </div>
  );
}
