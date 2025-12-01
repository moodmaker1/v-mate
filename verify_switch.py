import asyncio
import websockets
import json
import sys

async def verify_switch():
    uri = "ws://localhost:12393/client-ws"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket server")
            
            # 1. Switch to Shizuku
            print("Switching to Shizuku...")
            switch_msg = {
                "type": "switch-config",
                "file": "shizuku.yaml"
            }
            await websocket.send(json.dumps(switch_msg))
            
            # Wait for response
            while True:
                response = await websocket.recv()
                data = json.loads(response)
                if data.get("type") == "config-switched":
                    print(f"Success: {data['message']}")
                    break
                elif data.get("type") == "error":
                    print(f"Error: {data['message']}")
                    return

            # 2. Switch back to Hiyori (or whatever the other model is)
            print("Switching to Hiyori...")
            switch_msg = {
                "type": "switch-config",
                "file": "hiyori.yaml"
            }
            await websocket.send(json.dumps(switch_msg))
            
            # Wait for response
            while True:
                response = await websocket.recv()
                data = json.loads(response)
                if data.get("type") == "config-switched":
                    print(f"Success: {data['message']}")
                    break
                elif data.get("type") == "error":
                    print(f"Error: {data['message']}")
                    return

    except Exception as e:
        print(f"Connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(verify_switch())
