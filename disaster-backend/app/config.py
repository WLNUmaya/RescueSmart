import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env", override=True)


class Config:
    ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"

    MONGO_URI = (os.getenv("MONGO_URI") or "").strip()
    DB_NAME = (os.getenv("DB_NAME") or "Victim_Priority").strip()

    CORS_ORIGINS = (os.getenv("CORS_ORIGINS") or "*").strip()

    MODELS_DIR = BASE_DIR / "models"

    # Priority
    PRIORITY_MODEL_PATH = Path(
        os.getenv(
            "PRIORITY_MODEL_PATH",
            str(MODELS_DIR / "priority_model" / "best_priority_model_3stage.joblib"),
        )
    )

    PRIORITY_SCALERS_PATH = Path(
        os.getenv(
            "PRIORITY_SCALERS_PATH",
            str(MODELS_DIR / "priority_model" / "best_class_scalers_3stage.joblib"),
        )
    )

    PRIORITY_LABEL_MAPPING_PATH = Path(
        os.getenv(
            "PRIORITY_LABEL_MAPPING_PATH",
            str(MODELS_DIR / "priority_model" / "priority_label_mapping_3stage.joblib"),
        )
    )

    # Authority
    AUTHORITY_MODEL_PATH = Path(
        os.getenv(
            "AUTHORITY_MODEL_PATH",
            str(MODELS_DIR / "authority_model" / "best_authority_multilabel_model.joblib"),
        )
    )

    AUTHORITY_THRESHOLDS_PATH = Path(
        os.getenv(
            "AUTHORITY_THRESHOLDS_PATH",
            str(MODELS_DIR / "authority_model" / "best_authority_thresholds.joblib"),
        )
    )

    # NLP
    NLP_MODEL_DIR = Path(
        os.getenv(
            "NLP_MODEL_DIR",
            str(MODELS_DIR / "deberta_model"),
        )
    )