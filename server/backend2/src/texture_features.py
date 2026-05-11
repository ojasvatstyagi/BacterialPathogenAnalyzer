import cv2
import numpy as np
from skimage.feature import graycomatrix, graycoprops


def extract_texture_features(gray: np.ndarray, mask: np.ndarray) -> dict:
    """Fast texture features for small datasets.

    We avoid expensive dense LBP/large GLCM calculations so the full dataset can be
    processed quickly. The features still capture roughness/wrinkling signals.
    """
    values = gray[mask > 0]
    if values.size == 0:
        return {
            "gray_mean": 0.0, "gray_std": 0.0, "gray_p25": 0.0, "gray_p75": 0.0,
            "laplacian_variance": 0.0, "local_std_mean": 0.0, "local_std_std": 0.0,
            "glcm_contrast": 0.0, "glcm_homogeneity": 0.0, "glcm_energy": 0.0, "glcm_correlation": 0.0,
        }

    masked = gray.copy()
    masked[mask == 0] = 0

    lap = cv2.Laplacian(masked, cv2.CV_64F)
    lap_values = lap[mask > 0]

    # Local standard deviation = simple roughness/wrinkle proxy.
    gray_float = masked.astype(np.float32)
    mean = cv2.blur(gray_float, (9, 9))
    mean_sq = cv2.blur(gray_float * gray_float, (9, 9))
    local_std = np.sqrt(np.maximum(mean_sq - mean * mean, 0))
    local_values = local_std[mask > 0]

    # Downsample for fast GLCM.
    small_gray = cv2.resize(masked, (96, 96), interpolation=cv2.INTER_AREA)
    quantized = np.clip((small_gray / 32).astype(np.uint8), 0, 7)
    glcm = graycomatrix(quantized, distances=[1], angles=[0], levels=8, symmetric=True, normed=True)

    return {
        "gray_mean": float(np.mean(values)),
        "gray_std": float(np.std(values)),
        "gray_p25": float(np.percentile(values, 25)),
        "gray_p75": float(np.percentile(values, 75)),
        "laplacian_variance": float(np.var(lap_values)),
        "local_std_mean": float(np.mean(local_values)),
        "local_std_std": float(np.std(local_values)),
        "glcm_contrast": float(graycoprops(glcm, "contrast").mean()),
        "glcm_homogeneity": float(graycoprops(glcm, "homogeneity").mean()),
        "glcm_energy": float(graycoprops(glcm, "energy").mean()),
        "glcm_correlation": float(graycoprops(glcm, "correlation").mean()),
    }
