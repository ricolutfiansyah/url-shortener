import {
  createResource,
  ErrorBoundary,
  For,
  Show,
  createSignal,
} from 'solid-js';
import { A } from '@solidjs/router';
import { client, API_URL } from '../../lib/api';
import QRCode from 'qrcode';
import { Modal } from '../../components/ui/Modal';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const fetchLinks = async () => {
  const res = await client.api.links.$get();
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch links');
  }

  return data.data;
};

export default function Dashboard() {
  const [links, { refetch }] = createResource(fetchLinks);

  const [originalUrl, setOriginalUrl] = createSignal('');
  const [title, setTitle] = createSignal('');
  const [shortCode, setShortCode] = createSignal('');
  const [expireOption, setExpireOption] = createSignal('never');
  const [isCreating, setIsCreating] = createSignal(false);
  const [formError, setFormError] = createSignal('');

  const [isQrModalOpen, setIsQrModalOpen] = createSignal(false);
  const [qrDataUrl, setQrDataUrl] = createSignal('');
  const [qrOriginalUrl, setQrOriginalUrl] = createSignal('');

  const handleGenerateQr = async (shortCode: string, originalUrl: string) => {
    try {
      const fullUrl = `${API_URL}/api/links/${shortCode}`;
      const url = await QRCode.toDataURL(fullUrl, { width: 400, margin: 2 });
      setQrDataUrl(url);
      setQrOriginalUrl(originalUrl);
      setIsQrModalOpen(true);
    } catch (err) {
      console.error('Failed to generate QR code', err);
    }
  };

  const handleCreateLink = async (e: Event) => {
    e.preventDefault();
    setFormError('');
    setIsCreating(true);

    let expiresAt: string | undefined = undefined;
    const opt = expireOption();
    const now = new Date();

    if (opt === '1h')
      expiresAt = new Date(now.getTime() + 1000 * 60 * 60).toISOString();
    else if (opt === '24h')
      expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString();
    else if (opt === '7d')
      expiresAt = new Date(
        now.getTime() + 1000 * 60 * 60 * 24 * 7,
      ).toISOString();

    try {
      const res = await client.api.links.$post({
        json: {
          originalUrl: originalUrl(),
          title: title() || undefined,
          shortCode: shortCode() || undefined,
          expiresAt,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || 'Failed to create url');
        return;
      }

      setOriginalUrl('');
      setTitle('');
      setShortCode('');
      setExpireOption('never');

      refetch();
    } catch (error) {
      setFormError('Network error occured while creating url');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      const res = await client.api.links[':id'].$delete({ param: { id } });
      if (res.ok) refetch();
    } catch (error) {
      console.error('Failed to delete link', error);
    }
  };

  return (
    <div class="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p class="text-muted-foreground mt-2">
          Manage your short links and track their performance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Short Link</CardTitle>
        </CardHeader>
        <CardContent>
          <Show when={formError()}>
            <div class="mb-4 p-3 text-sm text-red-400 bg-red-950/50 border border-red-900/50 text-center rounded-md">
              {formError()}
            </div>
          </Show>

          <form
            onSubmit={handleCreateLink}
            class="flex flex-col lg:flex-row gap-4 items-start"
          >
            <div class="flex-1 w-full space-y-2">
              <label class="text-sm font-medium leading-none">
                Original URL <span class="text-red-500">*</span>
              </label>
              <Input
                type="url"
                value={originalUrl()}
                onInput={(e) => setOriginalUrl(e.currentTarget.value)}
                placeholder="https://example.com/very/long/path/to/something"
                required
              />
            </div>

            <div class="flex-1 w-full space-y-2">
              <label class="text-sm font-medium leading-none">
                Custom Alias (Optional)
              </label>
              <Input
                type="text"
                value={shortCode()}
                onInput={(e) => setShortCode(e.currentTarget.value)}
                placeholder="e.g. my-portfolio"
              />
            </div>

            <div class="flex-1 w-full space-y-2">
              <label class="text-sm font-medium leading-none">
                Title (Optional)
              </label>
              <Input
                type="text"
                value={title()}
                onInput={(e) => setTitle(e.currentTarget.value)}
                placeholder="My awesome link"
              />
            </div>

            <div class="flex-1 w-full space-y-2">
              <label class="text-sm font-medium leading-none">Expiration</label>
              <select
                class="flex h-10 w-full rounded-md border border-input bg-transparent pl-3 pr-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a1a1aa%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-position-[right_0.75rem_center] bg-size-[1em_1em] cursor-pointer"
                value={expireOption()}
                onChange={(e) => setExpireOption(e.currentTarget.value)}
              >
                <option
                  class="bg-background text-foreground cursor-pointer"
                  value="never"
                >
                  Never
                </option>
                <option
                  class="bg-background text-foreground cursor-pointer"
                  value="1h"
                >
                  1 Hour
                </option>
                <option
                  class="bg-background text-foreground cursor-pointer"
                  value="24h"
                >
                  24 Hours
                </option>
                <option
                  class="bg-background text-foreground cursor-pointer"
                  value="7d"
                >
                  7 Days
                </option>
              </select>
            </div>

            <div class="w-full lg:w-auto pt-5.5">
              <Button
                type="submit"
                disabled={isCreating()}
                class="w-full h-10 cursor-pointer"
              >
                {isCreating() ? 'Creating...' : 'Create Link'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Links</CardTitle>
        </CardHeader>
        <CardContent>
          <Show when={links.loading}>
            <div class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </Show>

          <ErrorBoundary
            fallback={(err) => (
              <div class="p-4 text-red-400 bg-red-950/50 border border-red-900/50 rounded-md mt-4">
                <p>Error: {err.message}</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => refetch()}
                  class="mt-4 border-red-900/50 hover:bg-red-900/50"
                >
                  Try Again
                </Button>
              </div>
            )}
          >
            <Show when={links()}>
              <div class="rounded-md border border-border overflow-hidden">
                <table class="w-full text-sm text-left">
                  <thead class="text-xs text-muted-foreground bg-muted/50 border-b border-border uppercase text-left">
                    <tr>
                      <th class="px-4 py-3 font-medium">Title</th>
                      <th class="px-4 py-3 font-medium">Short URL</th>
                      <th class="px-4 py-3 font-medium hidden md:table-cell">
                        Original URL
                      </th>
                      <th class="px-4 py-3 font-medium">Status</th>
                      <th class="px-4 py-3 pl-18.5 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={links()}>
                      {(link) => (
                        <tr class="bg-card border-b border-border hover:bg-muted/30 transition-colors">
                          <td class="px-4 py-4">
                            <div class="font-medium text-foreground">
                              {link.title || 'Untitled'}
                            </div>
                            <div
                              class="text-xs text-muted-foreground truncate max-w-37.5 sm:max-w-62.5 md:hidden mt-1"
                              title={link.originalUrl}
                            >
                              {link.originalUrl}
                            </div>
                          </td>
                          <td class="px-4 py-4">
                            <a
                              href={`${API_URL}/api/links/${link.shortCode}`}
                              target="_blank"
                              class="text-primary hover:underline font-medium"
                            >
                              {link.shortCode}
                            </a>
                          </td>
                          <td
                            class="px-4 py-4 text-muted-foreground truncate max-w-50 lg:max-w-xs hidden md:table-cell"
                            title={link.originalUrl}
                          >
                            {link.originalUrl}
                          </td>
                          <td class="px-4 py-4">
                            {link.expiresAt &&
                            new Date(link.expiresAt) < new Date() ? (
                              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                Expired
                              </span>
                            ) : (
                              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Active
                              </span>
                            )}
                          </td>
                          <td class="px-4 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                class="cursor-pointer px-2 border-border/50 text-muted-foreground hover:text-foreground"
                                title="QR Code"
                                onClick={() =>
                                  handleGenerateQr(
                                    link.shortCode,
                                    link.originalUrl,
                                  )
                                }
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
                                  <rect
                                    width="5"
                                    height="5"
                                    x="3"
                                    y="3"
                                    rx="1"
                                  />
                                  <rect
                                    width="5"
                                    height="5"
                                    x="16"
                                    y="3"
                                    rx="1"
                                  />
                                  <rect
                                    width="5"
                                    height="5"
                                    x="3"
                                    y="16"
                                    rx="1"
                                  />
                                  <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                                  <path d="M21 21v.01" />
                                  <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                                  <path d="M3 12h.01" />
                                  <path d="M12 3h.01" />
                                  <path d="M12 16v.01" />
                                  <path d="M16 12h1" />
                                  <path d="M21 12v.01" />
                                  <path d="M12 21v-1" />
                                </svg>
                              </Button>
                              <A href={`/dashboard/analytics/${link.id}`}>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  class="cursor-pointer"
                                >
                                  Analytics
                                </Button>
                              </A>
                              <Button
                                variant="secondary"
                                size="sm"
                                class="cursor-pointer px-2 border-red-900/50 text-red-500 hover:bg-red-900/20"
                                title="Delete Link"
                                onClick={() => handleDeleteLink(link.id)}
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
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  <line x1="10" x2="10" y1="11" y2="17" />
                                  <line x1="14" x2="14" y1="11" y2="17" />
                                </svg>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </For>

                    <Show when={links()?.length === 0}>
                      <tr>
                        <td
                          colspan="5"
                          class="px-4 py-8 text-center text-muted-foreground"
                        >
                          No links found. Create your first short link above!
                        </td>
                      </tr>
                    </Show>
                  </tbody>
                </table>
              </div>
            </Show>
          </ErrorBoundary>
        </CardContent>
      </Card>

      <Modal
        isOpen={isQrModalOpen()}
        onClose={() => setIsQrModalOpen(false)}
        title="QR Code"
      >
        <div class="flex flex-col items-center justify-center gap-6">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:border-none w-max">
            <img
              src={qrDataUrl()}
              alt="QR Code"
              class="w-64 h-64 object-contain"
            />
          </div>
          <div class="w-full text-center">
            <p
              class="text-sm text-muted-foreground truncate w-full mb-4"
              title={qrOriginalUrl()}
            >
              Destination: {qrOriginalUrl()}
            </p>
            <a
              href={qrDataUrl()}
              download="qrcode.png"
              class="w-full inline-block"
            >
              <Button
                variant="primary"
                class="w-full cursor-pointer h-11 text-base"
              >
                Download PNG
              </Button>
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
}
