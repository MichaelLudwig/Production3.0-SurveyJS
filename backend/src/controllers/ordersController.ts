import { Request, Response, NextFunction } from 'express';
import { ProductionOrder, ApiResponse, CreateOrderRequest, UpdateOrderRequest } from '../types';
import { readJsonFile, writeJsonFile } from '../utils/fileOperations';

const ORDERS_FILE = 'orders/orders.json';

/**
 * Get all production orders
 */
export async function getAllOrders(
  req: Request,
  res: Response<ApiResponse<ProductionOrder[]>>,
  next: NextFunction
): Promise<void> {
  try {
    console.log('[Orders] GET /api/orders');
    
    const orders = await readJsonFile(ORDERS_FILE);
    
    res.json({
      success: true,
      data: orders || []
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific order by ID
 */
export async function getOrderById(
  req: Request,
  res: Response<ApiResponse<ProductionOrder>>,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    console.log(`[Orders] GET /api/orders/${id}`);
    
    const orders: ProductionOrder[] = await readJsonFile(ORDERS_FILE);
    const order = orders.find(o => o.id === id);
    
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
        message: `Order with ID ${id} not found`
      });
      return;
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new production order
 */
export async function createOrder(
  req: Request<{}, ApiResponse<ProductionOrder>, CreateOrderRequest>,
  res: Response<ApiResponse<ProductionOrder>>,
  next: NextFunction
): Promise<void> {
  try {
    console.log('[Orders] POST /api/orders');
    
    const { order } = req.body;
    
    // Validate required fields
    if (!order.produktName || !order.materialType) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'produktName and materialType are required'
      });
      return;
    }
    
    // Load existing orders
    let orders: ProductionOrder[] = [];
    try {
      orders = await readJsonFile(ORDERS_FILE);
    } catch (error) {
      // File doesn't exist yet, start with empty array
      console.log('[Orders] Creating new orders file');
    }
    
    // Create new order with generated ID and timestamp
    const newOrder: ProductionOrder = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    // Add to orders array
    orders.push(newOrder);
    
    // Save back to file
    await writeJsonFile(ORDERS_FILE, orders);
    
    console.log(`[Orders] Created order ${newOrder.id}: ${newOrder.produktName}`);
    
    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing production order
 */
export async function updateOrder(
  req: Request<{ id: string }, ApiResponse<ProductionOrder>, UpdateOrderRequest>,
  res: Response<ApiResponse<ProductionOrder>>,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { order } = req.body;
    
    console.log(`[Orders] PUT /api/orders/${id}`);
    
    // Load existing orders
    const orders: ProductionOrder[] = await readJsonFile(ORDERS_FILE);
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
        message: `Order with ID ${id} not found`
      });
      return;
    }
    
    // Update the order
    orders[orderIndex] = { ...order, id }; // Ensure ID doesn't change
    
    // Save back to file
    await writeJsonFile(ORDERS_FILE, orders);
    
    console.log(`[Orders] Updated order ${id}: ${order.produktName}`);
    
    res.json({
      success: true,
      data: orders[orderIndex],
      message: 'Order updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a production order
 */
export async function deleteOrder(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    console.log(`[Orders] DELETE /api/orders/${id}`);
    
    // Load existing orders
    const orders: ProductionOrder[] = await readJsonFile(ORDERS_FILE);
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
        message: `Order with ID ${id} not found`
      });
      return;
    }
    
    // Remove the order
    const deletedOrder = orders.splice(orderIndex, 1)[0];
    
    // Save back to file
    await writeJsonFile(ORDERS_FILE, orders);
    
    console.log(`[Orders] Deleted order ${id}: ${deletedOrder.produktName}`);
    
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}