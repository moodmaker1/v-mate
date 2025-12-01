import webview
import sys
import os
import threading
import time
import requests
from run_server import run as run_server_func

# Configuration
SERVER_URL = "http://localhost:12393"
WINDOW_WIDTH = 500
WINDOW_HEIGHT = 800

def get_resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

def start_server_thread():
    """Start the backend server in a separate thread."""
    print("Starting backend server in thread...")
    # Run the server with default log level
    # Note: uvicorn.run blocks, so this thread will stay alive
    try:
        run_server_func(console_log_level="INFO")
    except Exception as e:
        print(f"Server thread failed: {e}")

def wait_for_server(url):
    """Wait until the server is reachable."""
    print(f"Waiting for server at {url}...")
    retries = 0
    while retries < 60:  # Wait up to 60 seconds
        try:
            response = requests.get(url)
            if response.status_code == 200:
                print("Server is ready!")
                return True
        except requests.ConnectionError:
            pass
        time.sleep(1)
        retries += 1
    print("Server failed to start.")
    return False

def inject_transparency(window):
    """Inject CSS to make the background transparent."""
    time.sleep(2) 
    
    css = """
    body, html, #root {
        background-color: transparent !important;
        background: transparent !important;
    }
    /* Hide scrollbars */
    ::-webkit-scrollbar {
        width: 0px;
        background: transparent;
    }
    """
    window.load_css(css)
    print("Injected transparency CSS.")

def main():
    # Start server in a daemon thread
    server_thread = threading.Thread(target=start_server_thread, daemon=True)
    server_thread.start()

    # Create the window
    window = webview.create_window(
        'v-mate Desktop Partner',
        url='about:blank',
        width=WINDOW_WIDTH,
        height=WINDOW_HEIGHT,
        transparent=True,
        frameless=True,
        on_top=True,
        resizable=True
    )

    def logic():
        if wait_for_server(SERVER_URL):
            window.load_url(SERVER_URL)
            inject_transparency(window)
        else:
            window.load_html("<h1>Failed to connect to server</h1>")

    # Start webview (blocks main thread)
    webview.start(func=logic, debug=True)

if __name__ == '__main__':
    # Set environment variables for PyInstaller if needed
    if getattr(sys, 'frozen', False):
        os.environ["FROZEN_APP"] = "1"
        
    main()
