
import React, { createContext, useContext, useState } from 'react';
import QRCode from 'qrcode';
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  location: string;
  quantity: number;
  price: number;
  checkInDate: string;
  checkOutDate: string;
  qrCode: string;
  scanLimit: number;
  currentScans: number;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "qrCode" | "currentScans">) => Promise<void>;
  deleteProduct: (id: string) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  getProduct: (id: string) => Product | undefined;
  handleProductScan: (id: string) => boolean;
}

const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const addProduct = async (productData: Omit<Product, "id" | "qrCode" | "currentScans">) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    // Create a data object with product details
    const productDetails = {
      id,
      ...productData,
      currentScans: 0
    };
    
    // Generate QR code with encoded product details
    const qrCode = await QRCode.toDataURL(JSON.stringify(productDetails));
    
    const newProduct = {
      ...productDetails,
      qrCode
    };
    
    setProducts(prev => [...prev, newProduct]);
    toast.success("Product added successfully");
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    toast.success("Product deleted successfully");
  };

  const updateProduct = (id: string, updatedData: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, ...updatedData } : product
    ));
    toast.success("Product updated successfully");
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const handleProductScan = (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) {
      toast.error("Product not found");
      return false;
    }

    if (product.currentScans >= product.scanLimit) {
      toast.error("Scan limit reached for this product");
      return false;
    }

    if (product.quantity <= 0) {
      toast.error("Product out of stock");
      return false;
    }

    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          quantity: p.quantity - 1,
          currentScans: p.currentScans + 1
        };
      }
      return p;
    }));

    toast.success("Product scanned successfully");
    return true;
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      deleteProduct,
      updateProduct,
      getProduct,
      handleProductScan
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
