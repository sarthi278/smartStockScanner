import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts, Product } from '@/contexts/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

type ProductStatus = 
  | 'available' 
  | 'scan_limit_reached' 
  | 'out_of_stock' 
  | 'sold_out';

const Admin = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const { products, addProduct, deleteProduct, updateProduct } = useProducts();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    location: '',
    quantity: 0,
    price: 0,
    checkInDate: '',
    checkOutDate: '',
    scanLimit: 1,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProduct(newProduct);
    setIsAddingProduct(false);
    setNewProduct({
      name: '',
      location: '',
      quantity: 0,
      price: 0,
      checkInDate: '',
      checkOutDate: '',
      scanLimit: 1,
    });
  };

  const getProductStatus = (product: Product): ProductStatus => {
    const scanLimitReached = product.currentScans >= product.scanLimit;
    const noStock = product.quantity <= 0;
    
    if (scanLimitReached && noStock) {
      return 'sold_out';
    } else if (scanLimitReached) {
      return 'scan_limit_reached';
    } else if (noStock) {
      return 'out_of_stock';
    } else {
      return 'available';
    }
  };

  const getStatusDisplay = (status: ProductStatus) => {
    switch (status) {
      case 'available':
        return { text: 'Available', className: 'text-green-500 font-medium' };
      case 'scan_limit_reached':
        return { text: 'Scan Limit Reached', className: 'text-yellow-500 font-bold' };
      case 'out_of_stock':
        return { text: 'Out of Stock', className: 'text-red-500 font-bold' };
      case 'sold_out':
        return { text: 'Sold Out', className: 'text-red-500 font-bold' };
      default:
        return { text: 'Unknown', className: 'text-gray-500' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background p-6">
      {!isAuthenticated ? (
        <div className="min-h-screen bg-gradient-to-b from-secondary to-background p-6 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6 text-center">Admin Login</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </div>

          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Inventory Management</h2>
              <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <Input
                      placeholder="Product Name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                    <Input
                      placeholder="Location"
                      value={newProduct.location}
                      onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                    />
                    <Input
                      type="date"
                      placeholder="Check In Date"
                      value={newProduct.checkInDate}
                      onChange={(e) => setNewProduct({ ...newProduct, checkInDate: e.target.value })}
                    />
                    <Input
                      type="date"
                      placeholder="Check Out Date"
                      value={newProduct.checkOutDate}
                      onChange={(e) => setNewProduct({ ...newProduct, checkOutDate: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Scan Limit"
                      value={newProduct.scanLimit}
                      onChange={(e) => setNewProduct({ ...newProduct, scanLimit: parseInt(e.target.value) })}
                    />
                    <Button type="submit" className="w-full">Add Product</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Scan Limit</TableHead>
                    <TableHead>Current Scans</TableHead>
                    <TableHead>QR Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const status = getProductStatus(product);
                    const statusDisplay = getStatusDisplay(status);
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.location}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>₹{product.price}</TableCell>
                        <TableCell>{product.checkInDate}</TableCell>
                        <TableCell>{product.checkOutDate}</TableCell>
                        <TableCell>{product.scanLimit}</TableCell>
                        <TableCell>{product.currentScans}</TableCell>
                        <TableCell>
                          <img 
                            src={product.qrCode} 
                            alt={`QR Code for ${product.name}`}
                            className="w-20 h-20"
                          />
                        </TableCell>
                        <TableCell className={statusDisplay.className}>
                          {statusDisplay.text}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Product</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Input
                                    defaultValue={product.name}
                                    onChange={(e) =>
                                      updateProduct(product.id, { name: e.target.value })
                                    }
                                    placeholder="Product Name"
                                  />
                                  <Input
                                    defaultValue={product.location}
                                    onChange={(e) =>
                                      updateProduct(product.id, { location: e.target.value })
                                    }
                                    placeholder="Location"
                                  />
                                  <Input
                                    type="number"
                                    defaultValue={product.quantity}
                                    onChange={(e) =>
                                      updateProduct(product.id, { quantity: parseInt(e.target.value) })
                                    }
                                    placeholder="Quantity"
                                  />
                                  <Input
                                    type="number"
                                    defaultValue={product.price}
                                    onChange={(e) =>
                                      updateProduct(product.id, { price: parseFloat(e.target.value) })
                                    }
                                    placeholder="Price"
                                  />
                                  <Input
                                    type="date"
                                    defaultValue={product.checkOutDate}
                                    onChange={(e) =>
                                      updateProduct(product.id, { checkOutDate: e.target.value })
                                    }
                                    placeholder="Check Out Date"
                                  />
                                  <Input
                                    type="number"
                                    defaultValue={product.scanLimit}
                                    onChange={(e) =>
                                      updateProduct(product.id, { scanLimit: parseInt(e.target.value) })
                                    }
                                    placeholder="Scan Limit"
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;