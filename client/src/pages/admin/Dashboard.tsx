import {
  createResource,
  ErrorBoundary,
  For,
  Show,
  createSignal,
} from 'solid-js';
import { A } from '@solidjs/router';
import { client } from '../../lib/api';
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
  const [isCreating, setIsCreating] = createSignal(false);
  const [formError, setFormError] = createSignal('');

  const handleCreateLink = async (e: Event) => {
    e.preventDefault();
    setFormError('');
    setIsCreating(true);

    try {
      const res = await client.api.links.$post({
        json: {
          originalUrl: originalUrl(),
          title: title() || undefined,
          shortCode: shortCode() || undefined,
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

      refetch();
    } catch (error) {
      setFormError('Network error occured while creating url');
    } finally {
      setIsCreating(false);
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
            <div class="mb-4 p-3 text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-md">
              {formError()}
            </div>
          </Show>

          <form
            onSubmit={handleCreateLink}
            class="flex flex-col md:flex-row gap-4 items-end"
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

            <Button
              type="submit"
              disabled={isCreating()}
              class="w-full md:w-auto h-10 cursor-pointer"
            >
              {isCreating() ? 'Creating...' : 'Create Link'}
            </Button>
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
                  <thead class="text-xs text-muted-foreground bg-muted/50 border-b border-border uppercase">
                    <tr>
                      <th class="px-6 py-3 font-medium">Title</th>
                      <th class="px-6 py-3 font-medium">Short URL</th>
                      <th class="px-6 py-3 font-medium hidden md:table-cell">
                        Original URL
                      </th>
                      <th class="px-6 py-3 font-medium">Actions</th>
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
                              href={`http://localhost:3000/api/links/${link.shortCode}`}
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
                            <A href={`/dashboard/analytics/${link.id}`}>
                              <Button
                                variant="secondary"
                                size="sm"
                                class="cursor-pointer"
                              >
                                Analytics
                              </Button>
                            </A>
                          </td>
                        </tr>
                      )}
                    </For>

                    <Show when={links()?.length === 0}>
                      <tr>
                        <td
                          colspan="4"
                          class="px-6 py-8 text-center text-muted-foreground"
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
    </div>
  );
}
