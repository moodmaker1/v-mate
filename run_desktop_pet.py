import webview
import subprocess
import time
import requests
import sys
import os
import threading
import atexit

# Configuration
SERVER_URL = "http://localhost:12393"
SERVER_COMMAND = ["uv", "run", "run_server.py"]
WINDOW_WIDTH = 500
WINDOW_HEIGHT = 800

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

def start_server():
    """Start the backend server as a subprocess."""
    print("Starting backend server...")
    # Use preexec_fn to set process group so we can kill the whole tree if needed
    process = subprocess.Popen(
        SERVER_COMMAND,
        cwd=os.path.dirname(os.path.abspath(__file__)),
        preexec_fn=os.setsid if os.name != 'nt' else None
    )
    return process

def inject_transparency(window):
    """Inject CSS to make the background transparent."""
    # Wait for the page to load (simple delay for now, or use events if available)
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
    # Start the server
    server_process = start_server()

    # Ensure server is killed on exit
    def cleanup():
        print("Shutting down server...")
        if server_process:
            if os.name != 'nt':
                os.killpg(os.getpgid(server_process.pid), 15)  # SIGTERM
            else:
                server_process.terminate()
    atexit.register(cleanup)

    # Create the window
    # transparent=True, frameless=True, on_top=True
    window = webview.create_window(
        'Open-LLM-VTuber Desktop Pet',
        url='about:blank', # Start blank, load later
        width=WINDOW_WIDTH,
        height=WINDOW_HEIGHT,
        transparent=True,
        frameless=True,
        on_top=True,
        resizable=True
    )

    def logic():
        # Wait for server in the logic thread
        if wait_for_server(SERVER_URL):
            # Load the actual URL
            window.load_url(SERVER_URL)
            # Inject CSS
            inject_transparency(window)
        else:
            window.load_html("<h1>Failed to connect to server</h1>")

    # Start the webview (blocks main thread)
    webview.start(func=logic, debug=True)

if __name__ == '__main__':
    main()
