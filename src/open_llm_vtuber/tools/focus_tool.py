import subprocess
from typing import Dict

class FocusTool:
    """
    Tool for checking what the user is currently doing (Focus Guard).
    """
    
    @staticmethod
    def get_tool_definition() -> dict:
        return {
            "type": "function",
            "function": {
                "name": "check_active_window",
                "description": "Checks the currently active application name. Use this tool whenever the user asks 'what program am I using?', 'what am I doing?', or 'am I distracted?'. Do NOT ask for screen permission; just use this tool.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": [],
                },
            },
        }

    @staticmethod
    def check_active_window() -> str:
        """
        Returns the name of the currently active application.
        """
        try:
            # Get Application Name
            cmd_app = "osascript -e 'tell application \"System Events\" to get name of first application process whose frontmost is true'"
            app_name = subprocess.check_output(cmd_app, shell=True).decode("utf-8").strip()
            
            # Try to get Window Title (might fail due to permissions)
            try:
                cmd_window = "osascript -e 'tell application \"System Events\" to get name of window 1 of (first application process whose frontmost is true)'"
                window_title = subprocess.check_output(cmd_window, shell=True, stderr=subprocess.DEVNULL).decode("utf-8").strip()
                return f"Active App: {app_name}, Window: {window_title}"
            except:
                return f"Active App: {app_name} (Window title hidden due to permissions)"
                
        except Exception as e:
            return f"Error checking active window: {str(e)}"
