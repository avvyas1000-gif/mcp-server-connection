from fastmcp import FastMCP
from database import db
mcp= FastMCP("Shopping cart")
@mcp.tool()
def get_orders():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM orders")
    orders = cursor.fetchall()
    cursor.close()
    return orders

@mcp.tool()
def get_products():
    cursor=db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products")
    products=cursor.fetchall()
    cursor.close()
    return products

@mcp.tool()
def get_order_items():
     cursor=db.cursor(dictionary=True)
     cursor.execute("SELECT * FROM order_items")
     order_items=cursor.fetchall()
     cursor.close()
     return order_items

@mcp.tool()
def customers():
    cursor=db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM customers")
    customers=cursor.fetchall()
    cursor.close()
    return customers

@mcp.tool()
def cart():
    cursor=db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cart")
    cart=cursor.fetchall()
    cursor.close()
    return cart

if __name__ =="__main__":
     mcp.run(transport="http", host="0.0.0.0" , port=8001) 
    
    
    