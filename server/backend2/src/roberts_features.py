from pathlib import Path
import cv2
import numpy as np
from skimage.filters import roberts, sobel


def roberts_edge_map(gray: np.ndarray, mask: np.ndarray) -> np.ndarray:
    gray_float = gray.astype(np.float32) / 255.0
    edge = roberts(gray_float)
    edge = (edge * 255).astype(np.uint8)
    edge = cv2.bitwise_and(edge, edge, mask=mask)
    return edge


def cleaned_edge_binary(edge: np.ndarray, mask: np.ndarray) -> np.ndarray:
    values = edge[mask > 0]
    if values.size == 0:
        return np.zeros_like(edge)
    threshold = max(8, float(np.percentile(values, 85)))
    binary = (edge >= threshold).astype(np.uint8) * 255
    kernel = np.ones((3, 3), np.uint8)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    return cv2.bitwise_and(binary, binary, mask=mask)


def extract_roberts_features(gray: np.ndarray, mask: np.ndarray, debug_path: str | Path | None = None) -> dict:
    edge = roberts_edge_map(gray, mask)
    binary = cleaned_edge_binary(edge, mask)
    plate_area = max(1, int(np.count_nonzero(mask)))

    masked_edge = edge[mask > 0]
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contour_lengths = [cv2.arcLength(c, closed=False) for c in contours if cv2.contourArea(c) >= 3]

    if debug_path:
        Path(debug_path).parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(debug_path), edge)

    return {
        "roberts_edge_mean": float(np.mean(masked_edge)) if masked_edge.size else 0.0,
        "roberts_edge_std": float(np.std(masked_edge)) if masked_edge.size else 0.0,
        "roberts_edge_p90": float(np.percentile(masked_edge, 90)) if masked_edge.size else 0.0,
        "roberts_edge_density": float(np.count_nonzero(binary) / plate_area),
        "roberts_component_count": int(len(contour_lengths)),
        "roberts_total_contour_length": float(np.sum(contour_lengths)) if contour_lengths else 0.0,
        "roberts_mean_contour_length": float(np.mean(contour_lengths)) if contour_lengths else 0.0,
    }


def extract_sobel_features(gray: np.ndarray, mask: np.ndarray) -> dict:
    edge = sobel(gray.astype(np.float32) / 255.0)
    values = edge[mask > 0]
    if values.size == 0:
        return {"sobel_edge_mean": 0.0, "sobel_edge_std": 0.0, "sobel_edge_density": 0.0}
    threshold = np.percentile(values, 85)
    return {
        "sobel_edge_mean": float(np.mean(values)),
        "sobel_edge_std": float(np.std(values)),
        "sobel_edge_density": float(np.sum(values >= threshold) / values.size),
    }
