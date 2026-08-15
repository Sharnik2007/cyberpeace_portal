import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

MODEL_PATH = "app/scam_classifier.joblib"

def train_and_save_baseline_model():
    """Trains a baseline NLP model to recognize scam contexts and serializes it."""
    # Seed data mimicking common smishing/phishing templates
    training_texts = [
        "Congratulations! You won a cash prize reward. Click here to claim your bonus now.",
        "URGENT: Your electricity connection will be disconnected tonight. Pay immediately.",
        "Earn Rs.5000 daily working part time from home. Message this WhatsApp number.",
        "Verify your banking account update instantly by clicking this secure link.",
        "Hey, are you free to watch a movie tonight? Let me know.",
        "Dear student, your assignment submission deadline has been extended to Friday.",
        "Can you send me the meeting minutes from the morning sync session?",
        "Please check the attached document for the updated project architecture guidelines."
    ]
    # 1 represents Scam, 0 represents Safe
    labels = [1, 1, 1, 1, 0, 0, 0, 0]

    # Combine text vectorization and Naive Bayes into a uniform pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), stop_words='english')),
        ('classifier', MultinomialNB())
    ])

    pipeline.fit(training_texts, labels)
    joblib.dump(pipeline, MODEL_PATH)
    print("[+] Baseline ML threat classification model trained and serialized successfully.")

def get_scam_probability(text: str) -> float:
    """Loads the serialized pipeline and returns the probability score of it being a scam."""
    if not os.path.exists(MODEL_PATH):
        train_and_save_baseline_model()
        
    pipeline = joblib.load(MODEL_PATH)
    
    # Predict probability distributions: returns [prob_of_safe, prob_of_scam]
    probabilities = pipeline.predict_proba([text])[0]
    scam_probability = float(probabilities[1])
    
    return scam_probability