from pathlib import Path
import joblib
import pandas as pd
from flask import current_app

# Cache variables so the model and thresholds are loaded only once
_authority_model = None
_authority_thresholds = None

# Input feature columns expected by the authority prediction model
AUTHORITY_MODEL_COLS = [
    "disaster_type",
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
    "building_damage_flag",
    "mass_impact_flag",
    "vulnerability_flag",
    "num_people",
]

# Output labels predicted by the model
AUTHORITY_TARGET_COLS = [
    "navy",
    "fire",
    "ambulance",
    "police",
    "army",
]

# Default probability threshold used when no custom threshold file is provided
DEFAULT_AUTHORITY_THRESHOLD = 0.5


def get_authority_model():
    """
    Load and return the trained authority prediction model.

    The model path is read from Flask app config: AUTHORITY_MODEL_PATH.
    The loaded model is cached in memory so it is not loaded repeatedly.
    """
    global _authority_model

    # Return cached model if already loaded
    if _authority_model is None:
        model_path = current_app.config.get("AUTHORITY_MODEL_PATH")

        # Make sure the model path exists in config
        if not model_path:
            raise ValueError("AUTHORITY_MODEL_PATH is not configured in app config.")

        model_path = Path(model_path)

        # Convert relative path to absolute path using project root
        if not model_path.is_absolute():
            model_path = Path(current_app.root_path).parent / model_path

        # Check whether the model file actually exists
        if not model_path.exists():
            raise FileNotFoundError(f"Authority model not found: {model_path}")
        _authority_model = joblib.load(str(model_path))

    return _authority_model


def get_authority_thresholds():
    """
    Load and return the prediction thresholds for each authority label.

    If no threshold file is configured or found, default thresholds are used
    for all labels.
    """
    global _authority_thresholds

    # Return cached thresholds if already loaded
    if _authority_thresholds is not None:
        return _authority_thresholds

    threshold_path = current_app.config.get("AUTHORITY_THRESHOLDS_PATH")

    # If no threshold path is configured, use default thresholds
    if not threshold_path:
        _authority_thresholds = {
            label: DEFAULT_AUTHORITY_THRESHOLD for label in AUTHORITY_TARGET_COLS
        }
        return _authority_thresholds

    threshold_path = Path(threshold_path)

    # Convert relative path to absolute path using project root
    if not threshold_path.is_absolute():
        threshold_path = Path(current_app.root_path).parent / threshold_path

    # If threshold file does not exist, use default thresholds
    if not threshold_path.exists():
        _authority_thresholds = {
            label: DEFAULT_AUTHORITY_THRESHOLD for label in AUTHORITY_TARGET_COLS
        }
        return _authority_thresholds

    # Load saved threshold values from file
    loaded = joblib.load(str(threshold_path))

    # Build threshold dictionary, falling back to default if any label is missing
    _authority_thresholds = {
        label: float(loaded.get(label, DEFAULT_AUTHORITY_THRESHOLD))
        for label in AUTHORITY_TARGET_COLS
    }

    return _authority_thresholds


def _safe_int(value, default=0):

    try:
        return int(value)
    except Exception:
        return default


def _normalize_duration_band(value):
    
    if value is None:
        return "Unknown"
    value = str(value).strip()
    return value if value else "Unknown"


def _normalize_disaster_type(value):
    
    if value is None:
        return "Unknown"
    value = str(value).strip()
    return value if value else "Unknown"


def _build_authority_row(payload: dict) -> dict:
    
    return {
        "disaster_type": _normalize_disaster_type(payload.get("disaster_type")),
        "num_people": _safe_int(payload.get("num_people", 0)),
        "duration_band": _normalize_duration_band(payload.get("duration_band")),
        "children": _safe_int(payload.get("children", 0)),
        "elderly": _safe_int(payload.get("elderly", 0)),
        "pregnant": _safe_int(payload.get("pregnant", 0)),
        "disability": _safe_int(payload.get("disability", 0)),
        "water_rising_flag": _safe_int(payload.get("water_rising_flag", 0)),
        "near_submerged_flag": _safe_int(payload.get("near_submerged_flag", 0)),
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
        "final_escape_level_flag": _safe_int(payload.get("final_escape_level_flag", 0)),
    }


def predict_authorities_from_payload(payload: dict) -> dict:
    
    # Convert input payload into a clean single-row dictionary
    row = _build_authority_row(payload)

    # Create DataFrame because most ML models expect tabular input
    df = pd.DataFrame([row])

    # Ensure all expected model columns exist
    # Missing columns are added with default value 0
    for col in AUTHORITY_MODEL_COLS:
        if col not in df.columns:
            df[col] = 0

    # Reorder columns exactly as expected by the model
    df = df[AUTHORITY_MODEL_COLS].copy()

    # Load trained model and thresholds
    model = get_authority_model()
    threshold_map = get_authority_thresholds()

    # If the model supports probability prediction, use it
    if hasattr(model, "predict_proba"):
        raw_proba = model.predict_proba(df)

        # Some multi-label models return a list of arrays
        if isinstance(raw_proba, list):
            probs = []
            for p in raw_proba:
                # Binary classifier probability format
                if getattr(p, "ndim", 1) == 2 and p.shape[1] >= 2:
                    probs.append(float(p[0, 1]))
                else:
                    # Fallback if probability output shape is different
                    probs.append(float(p[0]))
        else:
            # Convert to list if possible
            raw_proba = getattr(raw_proba, "tolist", lambda: raw_proba)()

            # Handle nested list format
            if isinstance(raw_proba[0], list):
                probs = [float(x) for x in raw_proba[0]]
            else:
                probs = [float(x) for x in raw_proba]
    else:
        # If predict_proba is unavailable, use direct predictions as fallback
        raw_pred = model.predict(df)[0]
        probs = [float(x) for x in raw_pred]

    # Safety check to confirm output size matches expected number of labels
    if len(probs) != len(AUTHORITY_TARGET_COLS):
        raise ValueError(
            f"Authority prediction size mismatch: got {len(probs)} outputs, "
            f"but expected {len(AUTHORITY_TARGET_COLS)} labels."
        )

    # Build final result for each authority label
    return {
        label: {
            "predicted": int(probs[i] >= threshold_map[label]),   
            "probability": float(probs[i]),                       
            "threshold": float(threshold_map[label]),             
        }
        for i, label in enumerate(AUTHORITY_TARGET_COLS)
    }


def authority_binary_to_list(auth: dict) -> list[str]:
   
    auth_list = []

    # Check each target label in fixed order
    for label in AUTHORITY_TARGET_COLS:
        value = auth.get(label, 0)

        # Handle case where each label contains a nested dictionary
        if isinstance(value, dict):
            pred = int(value.get("predicted", 0))
        else:
            # Handle case where the value is already just 0 or 1
            pred = int(value)

        # Add label to final list only if predicted as 1
        if pred == 1:
            auth_list.append(label)

    return auth_list