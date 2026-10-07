import { Link } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar.jsx';
import { Footer } from '../components/shared/Footer.jsx';

export function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="gala-state-card not-found-card">
          <div className="not-found-code display" aria-hidden="true">404</div>
          <h1 className="display">Walang ganitong page.</h1>
          <p>The link may be broken or the page was moved. Let's get you back on track.</p>
          <div className="gala-state-actions">
            <Link className="btn-primary btn-inline" to="/">Go home</Link>
            <Link className="btn-secondary" to="/create">Create a plan</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
