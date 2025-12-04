from duckduckgo_search import DDGS
import httpx
import xml.etree.ElementTree as ET
from typing import List

class ResearchTool:
    """
    Tool for researching information via Web and arXiv.
    """
    
    @staticmethod
    def get_tool_definition() -> dict:
        return {
            "type": "function",
            "function": {
                "name": "perform_research",
                "description": "Searches the web and academic papers for information. Use this when the user asks to 'research', 'search for', or 'find info about' a topic.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query."
                        },
                        "sources": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": ["web", "papers"]
                            },
                            "description": "List of sources to search. Defaults to ['web']."
                        }
                    },
                    "required": ["query"],
                },
            },
        }

    @staticmethod
    async def perform_research(query: str, sources: List[str] = None) -> str:
        """
        Performs search on specified sources.
        """
        if sources is None:
            sources = ["web"]
            
        results = []
        
        if "web" in sources:
            try:
                with DDGS() as ddgs:
                    # Get top 5 results
                    web_results = list(ddgs.text(query, max_results=5))
                    for r in web_results:
                        results.append(f"[WEB] {r['title']}: {r['body']} ({r['href']})")
            except Exception as e:
                results.append(f"[WEB] Error: {str(e)}")

        if "papers" in sources:
            try:
                # arXiv Search
                url = f"http://export.arxiv.org/api/query?search_query=all:{query}&start=0&max_results=3"
                async with httpx.AsyncClient() as client:
                    response = await client.get(url)
                    if response.status_code == 200:
                        root = ET.fromstring(response.text)
                        # Namespace map
                        ns = {'atom': 'http://www.w3.org/2005/Atom'}
                        for entry in root.findall('atom:entry', ns):
                            title = entry.find('atom:title', ns).text.strip().replace('\n', ' ')
                            summary = entry.find('atom:summary', ns).text.strip().replace('\n', ' ')[:200] + "..."
                            link = entry.find('atom:id', ns).text
                            results.append(f"[PAPER] {title}: {summary} ({link})")
            except Exception as e:
                results.append(f"[PAPER] Error: {str(e)}")

        if not results:
            return "No results found."
            
        return "\n\n".join(results)
