from pathlib import Path
from typing import Tuple
# pyrefly: ignore [missing-import]
import cv2
# pyrefly: ignore [missing-import]
import numpy as np


def read_image(image_path: str | Path) -> np.ndarray:
    image = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
    if image is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")
    return image


def detect_plate_mask(image_bgr: np.ndarray) -> np.ndarray:
    """Fast approximate petri-dish mask.

    Uses border/background separation and falls back to a centered circle.
    This is intentionally faster and more robust than running HoughCircles on every image.
    """
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    blur = cv2.GaussianBlur(gray, (7, 7), 0)

    # Segment plate/agar from white/bright background using Otsu inverse.
    _, th = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    th = cv2.morphologyEx(th, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))

    contours, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros_like(gray, dtype=np.uint8)
    if contours:
        largest = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(largest)
        if area > 0.20 * h * w:
            (x, y), radius = cv2.minEnclosingCircle(largest)
            radius = int(radius * 0.88)  # exclude dish rim and writing near edge
            cv2.circle(mask, (int(x), int(y)), max(1, radius), 255, -1)
            return mask

    # Fallback: centered circle.
    radius = int(min(h, w) * 0.42)
    cv2.circle(mask, (w // 2, h // 2), radius, 255, -1)
    return mask


def normalize_gray(image_bgr: np.ndarray, mask: np.ndarray | None = None) -> np.ndarray:
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    if mask is not None:
        gray = cv2.bitwise_and(gray, gray, mask=mask)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(gray)


def standardize_image(image_bgr: np.ndarray, size: Tuple[int, int] = (256, 256)) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    resized = cv2.resize(image_bgr, size, interpolation=cv2.INTER_AREA)
    mask = detect_plate_mask(resized)
    gray = normalize_gray(resized, mask)
    return resized, gray, mask


def preprocess_image_for_features(img) -> tuple[np.ndarray, np.ndarray]:
    """Helper for Flask app: converts PIL Image to BGR and returns standardized gray & mask."""
    # Convert PIL Image to BGR numpy array
    image_bgr = cv2.cvtColor(np.array(img.convert('RGB')), cv2.COLOR_RGB2BGR)
    _, gray, mask = standardize_image(image_bgr)
    return gray, mask
