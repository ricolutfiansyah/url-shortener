/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import 'solid-devtools';
import './index.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Stats from './pages/Stats';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(
  () => (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/stats/:id" component={Stats} />
    </Router>
  ),
  root!,
);
