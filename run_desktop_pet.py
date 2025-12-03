import sys
import os

# Setup logging IMMEDIATELY to catch import errors
if sys.platform == 'win32':
    os.environ["PYTHONIOENCODING"] = "utf-8"
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

if getattr(sys, 'frozen', False):
    os.environ["FROZEN_APP"] = "1"
    try:
        log_path = os.path.join(os.path.expanduser("~"), "v-mate.log")
        # Open log file with utf-8 encoding
        sys.stdout = open(log_path, "w", encoding="utf-8")
        sys.stderr = sys.stdout
        print(f"Log started at {log_path}")
        
        # Change CWD to the internal resource directory
        os.chdir(sys._MEIPASS)
        print(f"Changed CWD to internal dir: {sys._MEIPASS}")
    except Exception as e:
        pass # If logging fails, we can't do much

# Ensure PATH exists in environment variables (required for pydub)
if "PATH" not in os.environ:
    os.environ["PATH"] = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
else:
    # Append Homebrew paths just in case
    os.environ["PATH"] += ":/opt/homebrew/bin:/usr/local/bin"
    print("Injected default PATH")

# Auto-create conf.yaml if missing (for packaged app)
import shutil
config_path = "conf.yaml"
template_path = os.path.join("config_templates", "conf.default.yaml")

if getattr(sys, 'frozen', False):
    # In frozen app, we are in sys._MEIPASS
    # But we want to write conf.yaml to the executable directory (or user data dir)
    # For simplicity, let's try writing to the current working directory (which is _MEIPASS)
    # Wait, _MEIPASS is read-only usually? No, it's a temp dir.
    # But the app expects conf.yaml to be readable.
    
    # Actually, let's check if it exists in CWD (which we set to _MEIPASS)
    if not os.path.exists(config_path):
        if os.path.exists(template_path):
            print(f"conf.yaml not found. Creating from {template_path}...")
            try:
                shutil.copy2(template_path, config_path)
                print("Created conf.yaml")
            except Exception as e:
                print(f"Failed to create conf.yaml: {e}")
        else:
            print(f"Warning: Template {template_path} not found.")

try:
    import webview
    import threading
    import time
    import requests
    from run_server import run as run_server_func
except Exception as e:
    print(f"CRITICAL IMPORT ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

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
    # For debugging, we disable transparency and frameless to see the window content
    window = webview.create_window(
        'V-Mate',
        url='about:blank',
        width=WINDOW_WIDTH,
        height=WINDOW_HEIGHT,
        transparent=True,
        frameless=True,
        on_top=True,
        resizable=True,
        x=100,
        y=100
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
    main()
