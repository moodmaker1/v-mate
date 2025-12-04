from open_llm_vtuber.tools.vision_tool import VisionTool
import base64
from PIL import Image
import io

def test_vision_tool():
    print("Testing VisionTool.capture_screen()...")
    
    # Call the tool
    result = VisionTool.capture_screen()
    
    if result.startswith("Error"):
        print(f"FAILED: {result}")
        return

    print("Success! Image data received.")
    
    # Verify image data
    try:
        header, encoded = result.split(",", 1)
        data = base64.b64decode(encoded)
        img = Image.open(io.BytesIO(data))
        print(f"Image captured successfully: {img.size} format: {img.format}")
        
        # Save for manual inspection
        img.save("test_capture.jpg")
        print("Saved capture to test_capture.jpg")
        
    except Exception as e:
        print(f"FAILED to decode image: {e}")

if __name__ == "__main__":
    test_vision_tool()
