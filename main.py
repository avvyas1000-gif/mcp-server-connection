from fastapi import FastAPI
from fastmcp import Client
import json
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI(title="E-commerce shopping cart")
MCP_SERVER_URL = "http://127.0.0.1:8001/mcp" 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
def get_result(result):
    if result.data is not None:
        return result.data

    if result.content:
        return json.loads(result.content[0].text)

    return result
@app.get("/orders")
async def orders():
    async with Client(MCP_SERVER_URL)as client:
        result=await client.call_tool("get_orders",{})
        return get_result(result)

@app.get("/customers")
async def customers():
    async with Client(MCP_SERVER_URL)as client:
        result=await client.call_tool("customers",{})
        return get_result(result)

@app.get("/products")
async def get_products():
    async with Client(MCP_SERVER_URL)as client:
        result=await client.call_tool("get_products",{})
        return get_result(result)

@app.get("/order-items")
async def get_order_items():
    async with Client(MCP_SERVER_URL)as client:
        result=await client.call_tool("get_order_items",{})
        return get_result(result)

@app.get("/cart")
async def cart():
    async with Client(MCP_SERVER_URL)as client:
        result=await client.call_tool("cart",{})
        return get_result(result)


