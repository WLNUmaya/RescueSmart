from pathlib import Path
import pandas as pd
import numpy as np
import torch
from flask import current_app
from transformers import AutoTokenizer, AutoModelForSequenceClassification


# These are the output labels predicted by the NLP model
MODEL_LABEL_COLS = [
    "water_rising_flag",
    "near_submerged_flag",
    "landslide_active_risk_flag",
    "cyclone_active_risk_flag",
    "trapped",
    "medical_urgency_flag",
    "access_blocked",
    "river_overflow_flag",
    "river_near_flag",
    "building_damage_flag",
    "mass_impact_flag",
    "vulnerability_flag",
    "final_escape_level_flag",
]

# Default threshold used if no saved threshold is found for a label
DEFAULT_THRESHOLD = 0.5

# Cached global variables so the model is loaded only once
_tokenizer = None
_model = None
_label_cols = None
_label_thresholds = None

_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def _clean_text(text: str) -> str:
    """
    Clean the input text before sending it to the NLP model.
    - Convert None to empty string
    - Remove line breaks and tabs
    - Remove extra spaces
    - Convert text to lowercase
    """
    if text is None:
        return ""
    text = str(text)
    text = text.replace("\n", " ").replace("\r", " ").replace("\t", " ")
    text = " ".join(text.split())
    return text.lower().strip()


def _load_thresholds(model_dir: Path, label_cols: list[str]) -> dict[str, float]:
    """
    Load label-specific thresholds from label_thresholds.csv.

    If the file does not exist, or if required columns are missing,
    use the default threshold for all labels.
    """
    threshold_path = model_dir / "label_thresholds.csv"

    # If threshold file is missing, use default threshold for every label
    if not threshold_path.exists():
        return {label: DEFAULT_THRESHOLD for label in label_cols}

    # Read the threshold CSV file
    df = pd.read_csv(threshold_path)

    # Check required columns
    if "label" not in df.columns or "best_threshold" not in df.columns:
        return {label: DEFAULT_THRESHOLD for label in label_cols}

    # Convert CSV rows into a label -> threshold dictionary
    threshold_map = dict(zip(df["label"], df["best_threshold"]))

    # Return thresholds for expected labels, using default when missing
    return {
        label: float(threshold_map.get(label, DEFAULT_THRESHOLD))
        for label in label_cols
    }


def load_nlp_model():
    """
    Load the tokenizer, model, label list, and thresholds.

    The model directory is taken from Flask app config: NLP_MODEL_DIR.
    Everything is cached globally so the model is not loaded repeatedly.
    """
    global _tokenizer, _model, _label_cols, _label_thresholds

    # If model is already loaded, return cached objects
    if _model is not None:
        return _tokenizer, _model, _label_cols, _label_thresholds

    # Get model directory path from config
    model_dir = current_app.config.get("NLP_MODEL_DIR")
    if not model_dir:
        raise ValueError("NLP_MODEL_DIR is not configured in app config.")

    model_dir = Path(model_dir)

    # Convert relative path to absolute path using project root
    if not model_dir.is_absolute():
        model_dir = Path(current_app.root_path).parent / model_dir

    # Check whether model directory exists
    if not model_dir.exists():
        raise FileNotFoundError(f"NLP model dir not found: {model_dir}")

    # Set label columns and load saved thresholds
    _label_cols = MODEL_LABEL_COLS
    _label_thresholds = _load_thresholds(model_dir, _label_cols)

    # Load tokenizer and sequence classification model from Hugging Face format
    _tokenizer = AutoTokenizer.from_pretrained(str(model_dir))
    _model = AutoModelForSequenceClassification.from_pretrained(str(model_dir))

    # Move model to selected device and set evaluation mode
    _model.to(_device)
    _model.eval()

    return _tokenizer, _model, _label_cols, _label_thresholds


def predict_nlp_raw(text: str) -> dict:
    """
    Predict raw NLP outputs for a given text.

    Returns a dictionary for each label containing:
    - probability
    - threshold
    - predicted (0 or 1)
    """
    # Load model components
    tokenizer, model, label_cols, threshold_map = load_nlp_model()

    # Clean the input text
    cleaned = _clean_text(text)

    # Tokenize text into model input format
    enc = tokenizer(
        cleaned,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=160,
    )

    # Move tokenized tensors to the selected device
    enc = {k: v.to(_device) for k, v in enc.items()}

    # Disable gradient calculation for inference
    with torch.no_grad():
        outputs = model(**enc)
        logits = outputs.logits

        # Apply sigmoid because this is multi-label classification
        probs = torch.sigmoid(logits).cpu().numpy()[0]

    # Ensure probabilities stay between 0 and 1
    probs = np.clip(probs, 0.0, 1.0)

    raw = {}

    # Build output for each label
    for i, label in enumerate(label_cols):
        model_threshold = float(threshold_map.get(label, DEFAULT_THRESHOLD))
        probability = float(probs[i])

        raw[label] = {
            "probability": probability,
            "threshold": model_threshold,
            "predicted": int(probability >= model_threshold),
        }

    return raw


def predict_nlp_features(text: str) -> dict:
    """
    Return NLP prediction results in separated grouped dictionaries:
    - labels
    - probabilities
    - thresholds

    This is useful for frontend or API responses.
    """
    raw = predict_nlp_raw(text)

    # Extract only binary predictions
    labels = {k: int(v["predicted"]) for k, v in raw.items()}

    # Extract probability scores
    probabilities = {k: float(v["probability"]) for k, v in raw.items()}

    # Extract thresholds used for each label
    thresholds = {k: float(v["threshold"]) for k, v in raw.items()}

    return {
        "labels": labels,
        "probabilities": probabilities,
        "thresholds": thresholds,
    }