import cv2
import numpy as np


def extract_colony_features(gray: np.ndarray, mask: np.ndarray) -> dict:
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    masked_values = blurred[mask > 0]
    if masked_values.size == 0:
        return {}

    # Colonies/streaks often appear brighter after CLAHE. Use adaptive threshold within plate.
    thresh_value = np.percentile(masked_values, 82)
    binary = ((blurred >= thresh_value) & (mask > 0)).astype(np.uint8) * 255
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))

    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    areas = []
    perimeters = []
    circularities = []
    for c in contours:
        area = cv2.contourArea(c)
        if area < 4:
            continue
        peri = cv2.arcLength(c, True)
        circ = 4 * np.pi * area / (peri * peri) if peri > 0 else 0
        areas.append(area)
        perimeters.append(peri)
        circularities.append(circ)

    plate_area = max(1, int(np.count_nonzero(mask)))
    colony_area = float(np.sum(areas)) if areas else 0.0

    h, w = gray.shape
    # Region density: left/middle/right and top/middle/bottom, useful for streak gradients.
    region_features = {}
    for i, (start, end) in enumerate([(0, w//3), (w//3, 2*w//3), (2*w//3, w)]):
        region_mask = mask[:, start:end] > 0
        region_binary = binary[:, start:end] > 0
        denom = max(1, int(np.count_nonzero(region_mask)))
        region_features[f"density_x_region_{i+1}"] = float(np.count_nonzero(region_binary & region_mask) / denom)
    for i, (start, end) in enumerate([(0, h//3), (h//3, 2*h//3), (2*h//3, h)]):
        region_mask = mask[start:end, :] > 0
        region_binary = binary[start:end, :] > 0
        denom = max(1, int(np.count_nonzero(region_mask)))
        region_features[f"density_y_region_{i+1}"] = float(np.count_nonzero(region_binary & region_mask) / denom)

    return {
        "colony_component_count": int(len(areas)),
        "colony_area_fraction": float(colony_area / plate_area),
        "colony_area_mean": float(np.mean(areas)) if areas else 0.0,
        "colony_area_std": float(np.std(areas)) if areas else 0.0,
        "colony_area_p90": float(np.percentile(areas, 90)) if areas else 0.0,
        "colony_perimeter_mean": float(np.mean(perimeters)) if perimeters else 0.0,
        "colony_circularity_mean": float(np.mean(circularities)) if circularities else 0.0,
        "colony_circularity_std": float(np.std(circularities)) if circularities else 0.0,
        **region_features,
    }
