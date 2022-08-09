import json

with open("concepts.json") as f:
    concepts = json.load(f)

annotations = {id: [False, False] for id in concepts}
json.dump(annotations, open("concept_annotations.json", "w"))
