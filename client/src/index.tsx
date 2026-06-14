/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import 'solid-devtools';
import './index.css';

import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';

import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import Analytics from './pages/admin/Analytics';

import Home from './pages/user/Home';
import Track from './pages/user/Track';
import Unshorten from './pages/user/Unshorten';
import Stats from './pages/user/Stats';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(
  () => (
    <Router>
      <Route component={Layout}>
        <Route path="/" component={Home} />
        <Route path="/track" component={Track} />
        <Route path="/unshorten" component={Unshorten} />
        <Route path="/stats/:id" component={Stats} />
      </Route>
      <Route path="/login" component={Login} />
      
      {/* Admin Routes wrapped in AdminLayout */}
      <Route path="/dashboard" component={AdminLayout}>
        <Route path="/" component={Dashboard} />
        <Route path="/analytics/:id" component={Analytics} />
      </Route>
    </Router>
  ),
  root!,
);
