
import { QrCode, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 pt-8"
        >
          <h1 className="text-4xl font-bold text-primary mb-4">
            Inventory Management System
          </h1>
          <p className="text-gray-600">
            Scan products or manage inventory with admin access
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate('/scanner')}>
              <div className="text-center">
                <QrCode className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-semibold mb-2">Scan Product</h2>
                <p className="text-gray-600">
                  Scan QR codes to view and update product information
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate('/admin')}>
              <div className="text-center">
                <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-semibold mb-2">Admin Access</h2>
                <p className="text-gray-600">
                  Manage inventory and product information
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
