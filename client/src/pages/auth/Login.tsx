import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { client } from '../../lib/api';
import { setAccessToken, setIsAuthLoading } from '../../store/auth';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await client.api.users.login.$post({
        json: {
          email: email(),
          password: password(),
        },
      });

      const data = await res.json();

      if (!res.ok && !data.success) {
        setError(data.message || 'Login failed');
        return;
      }

      if (!data.success) {
        setError('Login failed');
        return;
      }

      setAccessToken(data.accessToken);
      setIsAuthLoading(false);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setError('A network error occurred. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-background flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0 pointer-events-none"></div>

      <Card class="w-full max-w-md z-10 shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader class="space-y-2 text-center pb-8">
          <CardTitle class="text-3xl font-bold tracking-tight">
            Admin Login
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} class="space-y-4">
            <Show when={error()}>
              <div class="p-3 text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-md text-center">
                {error()}
              </div>
            </Show>

            <div class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <Input
                type="email"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <Input
                type="password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              class="w-full mt-6 cursor-pointer"
              disabled={isLoading()}
            >
              {isLoading() ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
