import httpx

class NotionTool:
    """
    Tool for interacting with Notion API.
    """
    
    @staticmethod
    def get_tool_definition() -> dict:
        return {
            "type": "function",
            "function": {
                "name": "save_to_notion",
                "description": "Saves text or content to a Notion page. Use this when the user asks to 'save this to Notion', 'organize this in Notion', or 'keep a note'.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "content": {
                            "type": "string",
                            "description": "The content to save to Notion. Can be a summary, a quote, or full text."
                        },
                        "title": {
                            "type": "string",
                            "description": "The title of the Notion page."
                        }
                    },
                    "required": ["content", "title"],
                },
            },
        }

    @staticmethod
    async def save_to_notion(content: str, title: str, api_key: str, parent_page_id: str) -> str:
        """
        Saves content to a new Notion page.
        """
        if not api_key or not parent_page_id:
            return "Error: Notion API Key or Parent Page ID is missing in configuration."

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }

        # Create a new page
        data = {
            "parent": {"page_id": parent_page_id},
            "properties": {
                "title": {
                    "title": [{"text": {"content": title}}]
                }
            },
            "children": [
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": content}}]
                    }
                }
            ]
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post("https://api.notion.com/v1/pages", json=data, headers=headers)
                response.raise_for_status()
                return f"Successfully saved to Notion! Page: {title}"
            except httpx.HTTPStatusError as e:
                return f"Error saving to Notion: {e.response.text}"
            except Exception as e:
                return f"Error saving to Notion: {str(e)}"
