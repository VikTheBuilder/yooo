import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <section className="w-full max-w-lg text-center">
        <div className="text-7xl font-black gradient-text">404</div>
        <div className="mx-auto mt-4 mb-5 w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 flex items-center justify-center">
          <Compass size={25} />
        </div>
        <h1 className="text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-2 mb-7 text-sm text-slate-400">That page isn’t part of the campus marketplace.</p>
        <Link to="/" className="btn-primary">
          <ArrowLeft size={16} /> Back to browse
        </Link>
      </section>
    </div>
  );
}
