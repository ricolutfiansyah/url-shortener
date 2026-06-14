import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { client } from '../../lib/api';

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

      localStorage.setItem('accessToken', data.accessToken);
      navigate('/dashboard');
    } catch (error) {
      console.log(error);
      setError('A network error occurred. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', 'max-width': '400px', margin: '0 auto' }}>
      <h1>Admin Login</h1>

      <Show when={error()}>
        <p style={{ color: 'red' }}>{error()}</p>
      </Show>

      <form
        onSubmit={handleLogin}
        style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem' }}
      >
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <button type="submit" disabled={isLoading()}>
          {isLoading() ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
