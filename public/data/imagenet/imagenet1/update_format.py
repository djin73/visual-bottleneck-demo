import json

with open("concepts.json") as f:
    concepts = json.load(f)

for id in concepts:
    concepts[id]["images_classes"] = [
        [img_path, ""] for img_path in concepts[id]["images"]
    ]
    del concepts[id]["images"]

json.dump(concepts, open("updated.json", "w"))
