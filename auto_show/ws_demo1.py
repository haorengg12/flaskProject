import asyncio
import websockets
import time as t


async def echo_handler(websocket):
    async for message in websocket:
        await websocket.send(f"Server received: {message}")
        print(message)


async def main():
    async with websockets.serve(echo_handler, "localhost", 8765):
        await asyncio.Future()  # 保持服务器运行


asyncio.run(main())
