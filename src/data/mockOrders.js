export const mockOrders = [
    {
        id: "ord_12345678",
        created_at: new Date().toISOString(),
        customer_name: "John Doe",
        customer_email: "john@example.com",
        customer_phone: "+1234567890",
        delivery_address: "123 Main St, City",
        status: "pending",
        total_price: 45.50,
        items: [
            {
                id: 1,
                product_id: 1,
                quantity: 2,
                price_at_purchase: 150.00,
                products: {
                    name: "Bread",
                    image_url: "/images/bread.jpg"
                }
            }
        ]
    },
    {
        id: "ord_87654321",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        customer_name: "Jane Smith",
        customer_email: "jane@example.com",
        customer_phone: "+0987654321",
        delivery_address: "456 Oak Ave, Town",
        status: "completed",
        total_price: 25.00,
        items: [
            {
                id: 2,
                product_id: 2,
                quantity: 1,
                price_at_purchase: 50.00,
                products: {
                    name: "Bun",
                    image_url: "/images/bun.jpg"
                }
            }
        ]
    }
];
