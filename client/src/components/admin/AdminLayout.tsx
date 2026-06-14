import { JSX, createResource } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { Button } from '../ui/Button';
import { client } from '../../lib/api';

import { setAccessToken } from '../../store/auth';

const fetchUser = async () => {
  const res = await client.api.users['me'].$get();
  const data = await res.json();

  if (!res.ok && !data.success) {
    throw new Error(data.message || 'Failed to fetch user');
  }

  return data.data;
}

export default function AdminLayout(props: { children?: JSX.Element }) {
  const navigate = useNavigate();

  const [user] = createResource(fetchUser);

  const handleLogout = async () => {
    try {
      await client.api.users.logout.$post();
    } catch (error) {
      console.error(error);
    }
    setAccessToken(null);
    navigate('/login', { replace: true });
  };

  return (
    <div class="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside class="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div class="h-16 flex items-center px-6 border-b border-border">
          <h1 class="text-xl font-bold tracking-tight text-foreground">Admin Panel</h1>
        </div>
        <nav class="flex-1 p-4 space-y-2">
          <A
            href="/dashboard"
            end
            class="flex items-center px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            activeClass="bg-accent text-accent-foreground"
          >
            Links
          </A>
        </nav>
        <div class="p-4 border-t border-border">
          <Button variant="ghost" class="w-full justify-start text-muted-foreground hover:text-foreground cursor-pointer" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div class="flex-1 flex flex-col">
        {/* Top Header */}
        <header class="h-16 border-b border-border bg-background flex items-center px-6 justify-between md:justify-end">
          <div class="md:hidden">
            <h1 class="text-xl font-bold tracking-tight">Admin Panel</h1>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground">Welcome, {user()?.name}</span>
            <Button variant="ghost" size="sm" class="md:hidden" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main class="flex-1 p-6 overflow-auto">
          {props.children}
        </main>
      </div>
    </div>
  );
}
