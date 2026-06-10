from pathlib import Path
import joblib
import pandas as pd
import numpy as np
from flask import current_app

# Cache the loaded model, scalers, and label mapping
# so they are loaded only once
_priority_model = None
_priority_scalers = None
_priority_label_mapping = None

# Input columns expected by the priority model
PRIORITY_MODEL_COLS = [
    "duration_band",
    "children",
    "elderly",
    "pregnant",
    "disability",
    "water_rising_flag",
    "near_submerged_flag",
    "final_escape_level_flag",
    "landslide_active_risk_flag",
    "cyclone_active_risk_flag",
    "trapped",
    "medical_urgency_flag",
    "access_blocked",
    "river_overflow_flag",
    "river_near_flag",
    "num_people",
    "building_damage_flag",
    "mass_impact_flag",
    "vulnerability_flag",
    "nearest_distance_km",
    "disaster_type",
]

# Default probability scalers for Low, Moderate, and Critical
DEFAULT_PRIORITY_SCALERS = [1.0, 1.0, 1.0]

# Default labels used if no saved label mapping is found
DEFAULT_LABELS = ["Low", "Moderate", "Critical"]


def get_priority_model():
    """
    Load and return the trained priority prediction model.

    The model path is read from Flask app config: PRIORITY_MODEL_PATH.
    The model is cached after first load.
    """
    global _priority_model

    # Load the model only if it has not already been loaded
    if _priority_model is None:
        model_path = current_app.config.get("PRIORITY_MODEL_PATH")

        # Check whether model path is configured
        if not model_path:
            raise ValueError("PRIORITY_MODEL_PATH is not configured in app config.")

        model_path = Path(model_path)

        # Convert relative path to absolute path
        if not model_path.is_absolute():
            model_path = Path(current_app.root_path).parent / model_path

        if not model_path.exists():
            raise FileNotFoundError(f"Priority model not found: {model_path}")

        _priority_model = joblib.load(str(model_path))

    return _priority_model


def get_priority_scalers():
    """
    Load and return priority probability scalers.

    If the scaler file is missing or invalid, default scalers are used.
    """
    global _priority_scalers

    # Return cached scalers if already loaded
    if _priority_scalers is not None:
        return _priority_scalers

    scaler_path = current_app.config.get("PRIORITY_SCALERS_PATH")

    # If no scaler path is provided, use default scalers
    if not scaler_path:
        _priority_scalers = DEFAULT_PRIORITY_SCALERS
        return _priority_scalers

    scaler_path = Path(scaler_path)

    # Convert relative path to absolute path
    if not scaler_path.is_absolute():
        scaler_path = Path(current_app.root_path).parent / scaler_path

    # If scaler file is missing, use default scalers
    if not scaler_path.exists():
        _priority_scalers = DEFAULT_PRIORITY_SCALERS
        return _priority_scalers

    loaded = joblib.load(str(scaler_path))

    # Accept only valid list/tuple/array of length 3
    if isinstance(loaded, (list, tuple, np.ndarray)) and len(loaded) == 3:
        _priority_scalers = [float(x) for x in loaded]
    else:
        _priority_scalers = DEFAULT_PRIORITY_SCALERS

    return _priority_scalers


def get_priority_label_mapping():
    """
    Load and return the label-to-integer mapping for priority classes.

    If mapping file is missing or invalid, default mapping is used.
    """
    global _priority_label_mapping

    # Return cached mapping if already loaded
    if _priority_label_mapping is not None:
        return _priority_label_mapping

    mapping_path = current_app.config.get("PRIORITY_LABEL_MAPPING_PATH")

    # If no mapping path is given, use default mapping
    if not mapping_path:
        _priority_label_mapping = {"Low": 0, "Moderate": 1, "Critical": 2}
        return _priority_label_mapping

    mapping_path = Path(mapping_path)

    # Convert relative path to absolute path
    if not mapping_path.is_absolute():
        mapping_path = Path(current_app.root_path).parent / mapping_path

    # If mapping file does not exist, use default mapping
    if not mapping_path.exists():
        _priority_label_mapping = {"Low": 0, "Moderate": 1, "Critical": 2}
        return _priority_label_mapping

    loaded = joblib.load(str(mapping_path))

    # Accept only valid dictionary mapping
    if isinstance(loaded, dict):
        _priority_label_mapping = loaded
    else:
        _priority_label_mapping = {"Low": 0, "Moderate": 1, "Critical": 2}

    return _priority_label_mapping


def _safe_int(value, default=0):
    """
    Safely convert a value to int.
    Return default if conversion fails.
    """
    try:
        return int(value)
    except Exception:
        return default


def _safe_float(value, default=0.0):
    """
    Safely convert a value to float.
    Return default if conversion fails.
    """
    try:
        return float(value)
    except Exception:
        return default


def _normalize_duration_band(value):
    """
    Normalize duration_band value.
    Return 'Unknown' if missing or empty.
    """
    if value is None:
        return "Unknown"
    value = str(value).strip()
    if not value:
        return "Unknown"
    return value


def _build_priority_row(payload: dict) -> dict:
    """
    Build one clean input row for the priority model
    from the incoming payload.
    """
    return {
        "duration_band": _normalize_duration_band(payload.get("duration_band")),
        "children": _safe_int(payload.get("children", 0)),
        "elderly": _safe_int(payload.get("elderly", 0)),
        "pregnant": _safe_int(payload.get("pregnant", 0)),
        "disability": _safe_int(payload.get("disability", 0)),
        "num_people": _safe_int(payload.get("num_people", 0)),
        "disaster_type": str(payload.get("disaster_type", "Unknown")).strip() or "Unknown",
        "water_rising_flag": _safe_int(payload.get("water_rising_flag", 0)),
        "near_submerged_flag": _safe_int(payload.get("near_submerged_flag", 0)),
        "final_escape_level_flag": _safe_int(payload.get("final_escape_level_flag", 0)),
        "landslide_active_risk_flag": _safe_int(payload.get("landslide_active_risk_flag", 0)),
        "cyclone_active_risk_flag": _safe_int(payload.get("cyclone_active_risk_flag", 0)),
        "trapped": _safe_int(payload.get("trapped", 0)),
        "medical_urgency_flag": _safe_int(payload.get("medical_urgency_flag", 0)),
        "access_blocked": _safe_int(payload.get("access_blocked", 0)),
        "river_overflow_flag": _safe_int(payload.get("river_overflow_flag", 0)),
        "river_near_flag": _safe_int(payload.get("river_near_flag", 0)),
        "building_damage_flag": _safe_int(payload.get("building_damage_flag", 0)),
        "mass_impact_flag": _safe_int(payload.get("mass_impact_flag", 0)),
        "vulnerability_flag": _safe_int(payload.get("vulnerability_flag", 0)),
        "nearest_distance_km": _safe_float(payload.get("nearest_distance_km", 0)),
    }


def _get_ordered_labels():
    """
    Convert label mapping into correctly ordered class labels.

    Example:
    {"Low": 0, "Moderate": 1, "Critical": 2}
    becomes:
    ["Low", "Moderate", "Critical"]
    """
    label_to_int = get_priority_label_mapping()

    # Reverse mapping from integer to label
    int_to_label = {v: k for k, v in label_to_int.items()}

    # Sort by class index to get correct label order
    ordered_labels = [int_to_label[i] for i in sorted(int_to_label.keys())]

    # If order is invalid, fall back to defaults
    if len(ordered_labels) != 3:
        return DEFAULT_LABELS

    return ordered_labels


def predict_priority_from_payload(payload: dict) -> dict:
    """
    Predict the priority level from the input payload.

    Returns:
    - priority_level: numeric class index
    - priority_label: class name
    - priority_predictions: details for each class
    - priority_scalers: scaler values used
    """
    # Build clean input row and convert to DataFrame
    row = _build_priority_row(payload)
    df = pd.DataFrame([row])

    # Make sure all required columns exist
    for col in PRIORITY_MODEL_COLS:
        if col not in df.columns:
            df[col] = 0

    # Reorder columns exactly as expected by the model
    df = df[PRIORITY_MODEL_COLS].copy()

    # Load model, labels, and scalers
    model = get_priority_model()
    labels = _get_ordered_labels()
    scalers = get_priority_scalers()

    # If model supports probability prediction
    if hasattr(model, "predict_proba"):
        raw_proba = model.predict_proba(df)[0]
        raw_proba = np.array(raw_proba, dtype=float)

        # Apply scaling factors to adjust class confidence
        scaled_proba = raw_proba * np.array(scalers, dtype=float)

        # Choose the class with highest scaled probability
        pred = int(np.argmax(scaled_proba))

        # Store prediction details for each class
        priority_predictions = {
            labels[i]: {
                "predicted": int(i == pred),
                "raw_probability": float(raw_proba[i]),
                "scaled_probability": float(scaled_proba[i]),
                "scaler": float(scalers[i]),
            }
            for i in range(len(labels))
        }
    else:
        # Fallback if model has no predict_proba method
        raw_pred = model.predict(df)[0]

        # If model returns label text, convert it to class number
        if isinstance(raw_pred, str):
            label_to_int = get_priority_label_mapping()
            pred = int(label_to_int.get(raw_pred, 1))
        else:
            pred = int(raw_pred)

        # Build prediction dictionary with simple 0/1 confidence style
        priority_predictions = {
            labels[i]: {
                "predicted": int(i == pred),
                "raw_probability": float(1.0 if i == pred else 0.0),
                "scaled_probability": float(scalers[i] if i == pred else 0.0),
                "scaler": float(scalers[i]),
            }
            for i in range(len(labels))
        }

    # Final response returned to the caller
    return {
        "priority_level": pred,
        "priority_label": labels[pred],
        "priority_predictions": priority_predictions,
        "priority_scalers": {
            labels[i]: float(scalers[i]) for i in range(len(labels))
        },
    }