import {
  createResource,
  ErrorBoundary,
  For,
  Show,
  createSignal,
} from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { client } from '../../lib/api';

const fetchLinks = async () => {
  const res = await client.api.links.$get();
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch links');
  }

  return data.data;
};

export default function Dashboard() {
  const navigate = useNavigate();

  if (!localStorage.getItem('accessToken')) {
    navigate('/login', { replace: true });
  }

  const [links, { refetch }] = createResource(fetchLinks);

  const [originalUrl, setOriginalUrl] = createSignal('');
  const [title, setTitle] = createSignal('');
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
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || 'Failed to create url');
        return;
      }

      setOriginalUrl('');
      setTitle('');

      refetch();
    } catch (error) {
      setFormError('Network error occured while creating url');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ padding: '2rem', 'max-width': '800px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          'justify-content': 'space-between',
          'align-items': 'center',
        }}
      >
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div
        style={{
          background: '#f5f5f5',
          padding: '1.5rem',
          'border-radius': '8px',
          'margin-top': '1rem',
        }}
      >
        <h2>Create Short Link</h2>

        <Show when={formError()}>
          <p style={{ color: 'red', margin: '0 0 1rem 0' }}>{formError()}</p>
        </Show>

        <form
          onSubmit={handleCreateLink}
          style={{ display: 'flex', gap: '1rem', 'align-items': 'flex-end' }}
        >
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', 'margin-bottom': '0.5rem' }}>
              Original URL *
            </label>
            <input
              type="url"
              value={originalUrl()}
              onInput={(e) => setOriginalUrl(e.currentTarget.value)}
              placeholder="https://example.com"
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', 'margin-bottom': '0.5rem' }}>
              Title (Optional)
            </label>
            <input
              type="text"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              placeholder="My awesome link"
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={isCreating()}
            style={{ padding: '0.5rem 1rem', height: 'fit-content' }}
          >
            {isCreating() ? 'Creating...' : 'Create Link'}
          </button>
        </form>
      </div>

      {/* Loading state */}
      <Show when={links.loading}>
        <p>Loading links...</p>
      </Show>

      {/* Error state */}
      <ErrorBoundary
        fallback={(err) => (
          <div
            style={{
              padding: '1rem',
              background: '#ffebee',
              'border-radius': '8px',
              'margin-top': '1rem',
            }}
          >
            <p style={{ color: 'red', margin: 0 }}>Error: {err.message}</p>
            <button onClick={handleLogout} style={{ 'margin-top': '1rem' }}>
              Return to Login
            </button>
          </div>
        )}
      >
        {/* Render the table when we have data */}
        <Show when={links()}>
          <table
            style={{
              width: '100%',
              'margin-top': '2rem',
              'text-align': 'left',
            }}
          >
            <thead>
              <tr>
                <th>Title</th>
                <th>Short URL</th>
                <th>Original URL</th>
              </tr>
            </thead>
            <tbody>
              <For each={links()}>
                {(link) => (
                  <tr>
                    <td style={{ padding: '0.5rem 0' }}>
                      {link.title || 'Untitled'}
                    </td>
                    <td>
                      <a
                        href={`http://localhost:3000/api/links/${link.shortCode}`}
                        target="_blank"
                      >
                        {link.shortCode}
                      </a>
                    </td>
                    <td>{link.originalUrl}</td>
                  </tr>
                )}
              </For>

              <Show when={links()?.length === 0}>
                <tr>
                  <td colspan="3">No links found! Create one.</td>
                </tr>
              </Show>
            </tbody>
          </table>
        </Show>
      </ErrorBoundary>
    </div>
  );
}
