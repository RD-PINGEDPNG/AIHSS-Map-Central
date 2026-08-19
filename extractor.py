import requests
import json

url = (
    "https://services7.arcgis.com/"
    "aG2lSkUhVlUaggIT/ArcGIS/rest/services/"
    "PNG_Open_Electorate_Boundary_2023_view/"
    "FeatureServer/0/query"
)

params = {
    "where": "1=1",
    "outFields": "*",
    "returnGeometry": "true",
    "f": "geojson"
}

response = requests.get(url, params=params)

response.raise_for_status()

data = response.json()

with open("electorates.geojson", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(
    f"Downloaded {len(data['features'])} features."
)