// Constants for tax and shipping
export const TAX_RATE = 0.12; // 12% tax rate
export const SHIPPING_COST = 0; // Free shipping

/**
 * Calculate tax amount for a given subtotal
 * @param {number} subtotal 
 * @returns {number}
 */
export const calculateTax = (subtotal) => {
    return subtotal * TAX_RATE;
};

/**
 * Calculate shipping cost (currently free)
 * @returns {number}
 */
export const calculateShipping = () => {
    return SHIPPING_COST;
};

/**
 * Calculate total price including tax and shipping
 * @param {number} subtotal 
 * @returns {object} Object containing subtotal, tax, shipping, and total
 */
export const calculateTotalPrice = (subtotal) => {
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping();
    const total = subtotal + tax + shipping;

    return {
        subtotal,
        tax,
        shipping,
        total
    };
};
