from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
SPLIT_DIR = DATA_DIR / "splits"
METADATA_DIR = PROJECT_ROOT / "metadata"
REPORTS_DIR = PROJECT_ROOT / "reports"
MODELS_DIR = PROJECT_ROOT / "models"

METADATA_CSV = METADATA_DIR / "dataset_metadata.csv"
FEATURE_TABLE_CSV = REPORTS_DIR / "feature_table.csv"
TRAIN_CSV = SPLIT_DIR / "train.csv"
TEST_CSV = SPLIT_DIR / "test.csv"
MODEL_PATH = MODELS_DIR / "bpseudomallei_model.pkl"

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp"}
RANDOM_STATE = 42
TEST_SIZE = 0.20
CV_FOLDS = 5

FEATURE_IMAGE_SIZE = (256, 256)

DEFAULT_DECISION_THRESHOLD = 0.50
DECISION_THRESHOLD = 0.35