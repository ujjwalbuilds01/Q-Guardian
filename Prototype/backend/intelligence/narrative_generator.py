import os
from google import genai

class RiskNarrativeGenerator:
    """
    Generates a localized Quantum Risk Narrative via LLM.
    """
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
        
    def generate_narrative(self, asset_data: dict, survival_data: dict) -> str:
        """
        Produce a tailored narrative that explains the risk in business terms.
        """
        hostname = asset_data.get('hostname', 'unknown')
        classification = asset_data.get('semantic_classification', 'system')
        algo = asset_data.get('algorithm_strength', 'legacy cryptography')
        urgency = asset_data.get('target_priority', 'MEDIUM')
        
        fallback_msg = f"Your {classification} ({hostname}) uses {algo}. Under median CRQC timeline assumptions (2031), adversaries conducting harvest-now-decrypt-later attacks beginning today would be able to decrypt intercepted records with a confidence-weighted exposure window opening in approximately 26 months. This asset is ranked {urgency} urgency because the risk-to-effort ratio makes this a high-return migration target."
        
        if self.client:
            try:
                prompt = f"Write a 3 sentence professional executive cyber risk narrative for an endpoint: {hostname}. It is a {classification} protected by {algo}. Its migration urgency is {urgency}. Mention Harvest Now Decrypt Later risk."
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt
                )
                return response.text
            except Exception as e:
                print(f"[Narrator] Gemini API Error: {e}")
                return fallback_msg

        return fallback_msg
