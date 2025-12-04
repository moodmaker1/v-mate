import base64
import io
import mss
from PIL import Image

class VisionTool:
    @staticmethod
    def capture_screen() -> str:
        """
        Captures the primary screen and returns it as a base64 encoded JPEG string.
        """
        try:
            with mss.mss() as sct:
                # Capture the primary monitor
                monitor = sct.monitors[1]
                sct_img = sct.grab(monitor)

                # Convert to PIL Image
                img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")

                # Resize if too large (optional, to save tokens/bandwidth)
                max_size = (1920, 1080)
                if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                    img.thumbnail(max_size, Image.Resampling.LANCZOS)

                # Convert to base64
                buffered = io.BytesIO()
                img.save(buffered, format="JPEG", quality=80)
                img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
                
                return f"data:image/jpeg;base64,{img_str}"
        except Exception as e:
            return f"Error capturing screen: {str(e)}"

    @staticmethod
    def get_tool_definition() -> dict:
        """
        Returns the OpenAI-compatible tool definition.
        """
        return {
            "type": "function",
            "function": {
                "name": "capture_screen",
                "description": "Captures the user's screen. Use this when the user asks you to 'look at this', 'see my screen', 'explain this', or 'quiz me on this'.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": [],
                },
            },
        }
