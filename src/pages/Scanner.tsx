import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useProducts, Product } from '@/contexts/ProductContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

type ProductStatus = 
  | 'available' 
  | 'scan_limit_reached' 
  | 'out_of_stock' 
  | 'sold_out';

const Scanner = () => {
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [productStatus, setProductStatus] = useState<ProductStatus>('available');
  const [remainingQuantity, setRemainingQuantity] = useState<number>(0);
  const { getProduct, handleProductScan } = useProducts();
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } }, false
    );

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  useEffect(() => {
    if (scannedProduct) {
      const remaining = Math.max(0, scannedProduct.quantity);
      setRemainingQuantity(remaining);
      const scanLimitReached = scannedProduct.currentScans >= scannedProduct.scanLimit;
      const noStock = remaining <= 0;
      
      if (scanLimitReached && noStock) {
        setProductStatus('sold_out');
      } else if (scanLimitReached) {
        setProductStatus('scan_limit_reached');
      } else if (noStock) {
        setProductStatus('out_of_stock');
      } else {
        setProductStatus('available');
      }
    }
  }, [scannedProduct]);

  const getStatusDisplay = (status: ProductStatus) => {
    switch (status) {
      case 'available':
        return { text: 'Available', className: 'text-green-500' };
      case 'scan_limit_reached':
        return { text: 'Scan Limit Reached', className: 'text-red-500 font-bold' };
      case 'out_of_stock':
        return { text: 'Out of Stock', className: 'text-red-500 font-bold' };
      case 'sold_out':
        return { text: 'Sold Out', className: 'text-red-500 font-bold' };
      default:
        return { text: 'Unknown', className: 'text-gray-500' };
    }
  };

  const getScanCountDisplay = () => {
    if (!scannedProduct) return '';
    
    const isAtLimit = scannedProduct.currentScans >= scannedProduct.scanLimit;
    
    if (isAtLimit) {
      return `${scannedProduct.currentScans} / ${scannedProduct.scanLimit}`;
    } else {
      return `${scannedProduct.currentScans + 1} / ${scannedProduct.scanLimit}`;
    }
  };

  const onScanSuccess = (decodedText: string) => {
    try {
      const productData = JSON.parse(decodedText);
      const product = getProduct(productData.id);
      
      if (product) {
        if (product.currentScans < product.scanLimit && product.quantity > 0) {
          handleProductScan(productData.id);
        }
        const updatedProduct = getProduct(productData.id);
        setScannedProduct(updatedProduct);
      }
    } catch (error) {
      console.error('Invalid QR code data:', error);
    }
  };

  const onScanFailure = (error: any) => {
    console.warn(`QR Code scan failure: ${error}`);
  };
  
  const statusDisplay = getStatusDisplay(productStatus);
  const isScanLimitReached = scannedProduct && scannedProduct.currentScans >= scannedProduct.scanLimit;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-4xl mx-auto"
      >
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Scan QR Code</h2>
            <div id="reader" className="w-full"></div>
          </Card>

          {scannedProduct && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Product Details</h2>
                
                {isScanLimitReached ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{scannedProduct.name}</p>
                    </div>
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-red-500 font-bold">Error: Scan Limit Reached</p>
                          <p className="text-sm text-red-700">
                            Maximum allowed scans ({scannedProduct.scanLimit}) has been reached for this product.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{scannedProduct.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{scannedProduct.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium">₹{scannedProduct.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className={`font-medium ${statusDisplay.className}`}>
                        {statusDisplay.text}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Remaining Quantity</p>
                      <p className="font-medium">{remainingQuantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Scan Count</p>
                      <p className="font-medium">{getScanCountDisplay()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check In Date</p>
                      <p className="font-medium">{scannedProduct.checkInDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check Out Date</p>
                      <p className="font-medium">{scannedProduct.checkOutDate}</p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Scanner;