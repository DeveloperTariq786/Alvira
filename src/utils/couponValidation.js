import { fetchMyOrders } from './api';

export const FIRST_ORDER_COUPON = 'FIRST100';
export const FIRST_ORDER_DISCOUNT = 100;

export const validateCoupon = async (couponCode) => {
  // Normalize coupon code
  const normalizedCoupon = couponCode.toUpperCase();

  // Check if it's the first order coupon
  if (normalizedCoupon === FIRST_ORDER_COUPON) {
    try {
      // Get user's order history with just 1 order to check if they have any
      const ordersResponse = await fetchMyOrders({ page: 1, limit: 1 });
      
      // Check if user has any previous orders
      if (ordersResponse.orders && ordersResponse.orders.length > 0) {
        return {
          isValid: false,
          discount: 0,
          error: 'This coupon is valid only for first orders'
        };
      }

      // Valid first order coupon
      return {
        isValid: true,
        discount: FIRST_ORDER_DISCOUNT
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        isValid: false,
        discount: 0,
        error: 'Error validating coupon'
      };
    }
  }

  // Invalid coupon code
  return {
    isValid: false,
    discount: 0,
    error: 'Invalid coupon code'
  };
};