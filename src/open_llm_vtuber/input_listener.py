import threading
from typing import Callable
from loguru import logger
from pynput import keyboard
from .tools.vision_tool import VisionTool

class InputListener:
    """
    Listens for global hotkeys to trigger actions.
    """
    def __init__(self, on_hotkey_triggered: Callable[[str], None]):
        """
        Initialize the InputListener.

        Args:
            on_hotkey_triggered: Callback function to execute when hotkey is pressed.
                                 Receives the captured image data (base64) as argument.
        """
        self.on_hotkey_triggered = on_hotkey_triggered
        self.listener = None
        self.hotkey_combination = '<cmd>+<shift>+s' # Default hotkey for Mac

    def _on_activate(self):
        logger.info(f"Hotkey {self.hotkey_combination} triggered!")
        try:
            # Capture screen immediately
            image_data = VisionTool.capture_screen()
            if image_data:
                logger.info("Screen captured successfully via hotkey.")
                # Execute callback in a separate thread to avoid blocking the listener
                threading.Thread(target=self.on_hotkey_triggered, args=(image_data,)).start()
            else:
                logger.error("Failed to capture screen via hotkey.")
        except Exception as e:
            logger.error(f"Error processing hotkey action: {e}")

    def start(self):
        """Start the hotkey listener in a non-blocking way."""
        logger.info(f"Starting Global Hotkey Listener ({self.hotkey_combination})...")
        
        # Parse the hotkey combination
        self.hotkey = keyboard.HotKey(
            keyboard.HotKey.parse(self.hotkey_combination),
            self._on_activate
        )

        # Create and start the listener using keyboard.Listener directly
        # This avoids the GlobalHotKeys wrapper issue on macOS
        self.listener = keyboard.Listener(
            on_press=self._for_canonical(self.hotkey.press),
            on_release=self._for_canonical(self.hotkey.release)
        )
        self.listener.start()
        logger.info("Global Hotkey Listener started.")

    def _for_canonical(self, f):
        """Helper to normalize key events"""
        return lambda k: f(self.listener.canonical(k))

    def stop(self):
        """Stop the hotkey listener."""
        if self.listener:
            self.listener.stop()
            logger.info("Global Hotkey Listener stopped.")
