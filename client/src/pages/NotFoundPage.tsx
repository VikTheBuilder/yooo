import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#FFF8E7]">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-lg text-center"
      >
        <div
          className="text-8xl font-black text-black mb-4 select-none"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          404
        </div>

        <div className="mx-auto mt-4 mb-5 w-16 h-16 bg-[#FFE600] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0_0_#000]">
          <Compass size={28} className="text-black" />
        </div>

        <h1 className="text-2xl font-black text-black uppercase tracking-tight">Page not found</h1>
        <p className="mt-2 mb-7 text-sm text-black/60 font-medium normal-case tracking-normal">
          That page isn't part of the campus marketplace.
        </p>

        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to browse
        </Link>
      </motion.section>
    </div>
  );
}
