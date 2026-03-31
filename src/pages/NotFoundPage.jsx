import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/ui/Layout';

export default function NotFoundPage() {
  return (
    <Layout noFooter>
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-mono text-brand-500 text-7xl font-bold mb-4">404</p>
          <h1 className="font-display text-3xl font-bold text-white mb-3">Page not found</h1>
          <p className="text-white/40 mb-8 max-w-sm">Looks like this hole doesn't exist on our course.</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
