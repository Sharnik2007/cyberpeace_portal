import os
import re
import pickle
from typing import Dict, Any

class AdvancedThreatEngine:
    """Enterprise Threat Intelligence Engine with NLP & Lexical Feature Extraction."""
    
    def __init__(self, model_dir: str = "models"):
        self.model_dir = model_dir
        self.vectorizer = None
        self.classifier = None
        self.load_model_assets()

    def load_model_assets(self) -> None:
        """Dynamically load exported vectorizer and classifier models."""
        vec_path = os.path.join(self.model_dir, "vectorizer.pkl")
        clf_path = os.path.join(self.model_dir, "classifier.pkl")

        if os.path.exists(vec_path) and os.path.exists(clf_path):
            with open(vec_path, "rb") as f:
                self.vectorizer = pickle.load(f)
            with open(clf_path, "rb") as f:
                self.classifier = pickle.load(f)
            print("✅ [AdvancedThreatEngine] ML Model assets loaded successfully.")
        else:
            print("⚠️ [AdvancedThreatEngine] Model assets not found. Running in Heuristic Mode.")

    def sanitize_input(self, text: str) -> str:
        """Sanitize raw text for NLP feature vectorization."""
        if not isinstance(text, str):
            return ""
        text = text.lower()
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        text = re.sub(r'\S+@\S+', '', text)
        text = re.sub(r'[^\w\s]', '', text)
        return text.strip()

    def extract_lexical_url_features(self, raw_text: str) -> Dict[str, Any]:
        """Extract lexical URL features and threat signals."""
        urls = re.findall(r'https?://[^\s]+|www\.[^\s]+', raw_text, re.IGNORECASE)
        has_url = len(urls) > 0
        
        has_ip_in_url = False
        has_suspicious_tld = False
        long_url = False
        subdomain_count = 0

        for url in urls:
            if re.search(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', url):
                has_ip_in_url = True
            if re.search(r'\.(xyz|top|club|work|link|kim|gq|cf|tk)\b', url, re.IGNORECASE):
                has_suspicious_tld = True
            if len(url) > 55:
                long_url = True
            subdomain_count += url.count('.') - 1

        # Calculate URL Risk Contribution
        url_risk = 0
        if has_url: url_risk += 20
        if has_ip_in_url: url_risk += 35
        if has_suspicious_tld: url_risk += 25
        if long_url: url_risk += 10
        if subdomain_count >= 2: url_risk += 10

        return {
            "urls_detected": urls,
            "has_url": has_url,
            "has_ip_in_url": has_ip_in_url,
            "has_suspicious_tld": has_suspicious_tld,
            "long_url": long_url,
            "subdomain_count": max(subdomain_count, 0),
            "url_risk_score": min(url_risk, 100)
        }

    def extract_structural_heuristics(self, raw_text: str) -> Dict[str, Any]:
        """Extract structural telemetry patterns."""
        has_urgency = bool(re.search(r'\b(urgent|immediately|action required|account locked|suspended|expire|24 hours)\b', raw_text, re.IGNORECASE))
        has_financial_lure = bool(re.search(r'\b(prize|won|claim|reward|cash|voucher|vpa|upi|bank|bonus|free|refund)\b', raw_text, re.IGNORECASE))
        has_contact_code = bool(re.search(r'\b\d{10}\b|\b\d{5}\s?\d{5}\b|\b08\d{8,9}\b', raw_text))
        has_excessive_caps = len([w for w in raw_text.split() if w.isupper() and len(w) > 2]) >= 2

        h_score = 0
        if has_urgency: h_score += 30
        if has_financial_lure: h_score += 30
        if has_contact_code: h_score += 25
        if has_excessive_caps: h_score += 15

        return {
            "has_urgency": has_urgency,
            "has_financial_lure": has_financial_lure,
            "has_contact_code": has_contact_code,
            "has_excessive_caps": has_excessive_caps,
            "heuristic_score": min(h_score, 100)
        }

    def compute_risk_assessment(self, raw_text: str) -> Dict[str, Any]:
        """Hybrid 3-Factor Scoring: NLP Probability (50%), URL Lexical Risk (25%), Structural Heuristics (25%)."""
        cleaned_text = self.sanitize_input(raw_text)
        url_features = self.extract_lexical_url_features(raw_text)
        heuristics = self.extract_structural_heuristics(raw_text)

        # ML Probability
        if self.vectorizer and self.classifier:
            vec = self.vectorizer.transform([cleaned_text])
            if hasattr(self.classifier, "predict_proba"):
                ml_prob = float(self.classifier.predict_proba(vec)[0][1]) * 100
            else:
                decision = float(self.classifier.decision_function(vec)[0])
                ml_prob = min(max((decision + 1) / 2 * 100, 0), 100)
        else:
            ml_prob = float(heuristics["heuristic_score"])

        # Multi-Factor Weighted Risk Formula
        final_risk_score = int(
            (ml_prob * 0.50) + 
            (url_features["url_risk_score"] * 0.25) + 
            (heuristics["heuristic_score"] * 0.25)
        )
        final_risk_score = min(max(final_risk_score, 0), 100)

        if final_risk_score >= 70:
            severity = "CRITICAL / HIGH RISK"
        elif final_risk_score >= 35:
            severity = "SUSPICIOUS / MEDIUM RISK"
        else:
            severity = "CLEAN / LOW RISK"

        return {
            "telemetry_input": raw_text,
            "ml_spam_probability": round(ml_prob, 2),
            "url_lexical_risk_score": url_features["url_risk_score"],
            "structural_heuristic_score": heuristics["heuristic_score"],
            "final_risk_score": final_risk_score,
            "severity_level": severity,
            "lexical_url_indicators": url_features,
            "structural_indicators": heuristics
        }