import os
import re
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

def clean_text(text):
    """Sanitize raw telemetry text before feature extraction."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)  # Remove raw URLs
    text = re.sub(r'\S+@\S+', '', text)                                      # Remove raw email/handles
    text = re.sub(r'[^\w\s]', '', text)                                       # Remove special characters
    return text.strip()

def train_production_pipeline():
    print("🤖 Initializing Production Dataset Pipeline...\n")
    
    # Locate dataset path safely (handles both spam.csv and spam.csv.csv)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path_option1 = os.path.join(BASE_DIR, 'data', 'spam.csv')
    path_option2 = os.path.join(BASE_DIR, 'data', 'spam.csv.csv')
    
    if os.path.exists(path_option1):
        csv_path = path_option1
    elif os.path.exists(path_option2):
        csv_path = path_option2
    else:
        print(f"❌ Error: Could not find 'spam.csv' inside '{os.path.join(BASE_DIR, 'data')}'.")
        return

    print(f"📁 Loading dataset from: {csv_path}")

    # 1. Load CSV with robust fallback encoding & auto column mapping
    df = pd.read_csv(csv_path, encoding='latin-1')
    print(f"🔍 Detected CSV Columns: {list(df.columns)}")

    # Auto-map whatever column names exist in your CSV to ['label', 'text']
    if 'v1' in df.columns and 'v2' in df.columns:
        df = df.rename(columns={'v1': 'label', 'v2': 'text'})
    elif 'Category' in df.columns and 'Message' in df.columns:
        df = df.rename(columns={'Category': 'label', 'Message': 'text'})
    elif 'type' in df.columns and 'text' in df.columns:
        df = df.rename(columns={'type': 'label'})
    else:
        # Fallback: take the first two columns as label and text
        df = df.iloc[:, :2]
        df.columns = ['label', 'text']

    # Map string labels ('ham'/'spam') to binary numbers (0 / 1)
    df['label'] = df['label'].astype(str).str.lower().str.strip()
    df['label'] = df['label'].map({'ham': 0, 'spam': 1, 'safe': 0, 'phishing': 1, '0': 0, '1': 1})
    
    # Drop empty rows safely
    df = df.dropna(subset=['label', 'text'])

    print(f"📊 Dataset Loaded Successfully: {len(df)} verified records.\n")
    
    # Preprocess text column
    df['cleaned_text'] = df['text'].apply(clean_text)

    # 2. Stratified 80/20 Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        df['cleaned_text'], df['label'], test_size=0.20, random_state=42, stratify=df['label']
    )

    # 3. High-Density N-Gram TF-IDF Vectorization
    print("🔤 Extracting Unigram & Bigram Features (max 5,000 terms)...")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True
    )
    
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # 4. Multi-Algorithm Benchmarking
    candidate_models = {
        "Logistic Regression": LogisticRegression(C=1.0, max_iter=1000),
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.1),
        "Support Vector Machine (LinearSVC)": LinearSVC(C=1.0)
    }

    best_model_name = None
    best_model_obj = None
    best_accuracy = -1.0

    print("\n=======================================================")
    print("🎯 BENCHMARKING MODELS ON 5,500+ REAL DATASET SAMPLES")
    print("=======================================================")

    for name, model in candidate_models.items():
        model.fit(X_train_vec, y_train)
        preds = model.predict(X_test_vec)
        acc = accuracy_score(y_test, preds)
        print(f"🔹 {name:<35} | Accuracy: {acc * 100:.2f}%")

        if acc > best_accuracy:
            best_accuracy = acc
            best_model_name = name
            best_model_obj = model

    print("=======================================================")
    print(f"🏆 CHAMPION MODEL: {best_model_name} ({best_accuracy * 100:.2f}% Accuracy)\n")

    # Audit Report for the winning model
    winning_preds = best_model_obj.predict(X_test_vec)
    print("📋 DETAILED EVALUATION REPORT FOR CHAMPION MODEL:")
    print(classification_report(y_test, winning_preds, target_names=['Safe (0)', 'Threat (1)']))

    # 5. Export Champion Model Assets
    os.makedirs('models', exist_ok=True)
    with open('models/vectorizer.pkl', 'wb') as f:
        pickle.dump(vectorizer, f)
    with open('models/classifier.pkl', 'wb') as f:
        pickle.dump(best_model_obj, f)

    print("💾 Champion model assets successfully exported to 'models/'!")

if __name__ == "__main__":
    train_production_pipeline()