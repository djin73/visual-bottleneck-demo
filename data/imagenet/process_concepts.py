import json
import numpy as np
import torch

# remove "train/path/" from all image paths in a given list
def edit_paths(images):
    return [img.split("/")[-1] for img in images]


with open("concepts_orig.json") as f:
    concepts = json.load(f)

for _, con in concepts.items():
    con["images"] = edit_paths(con["images"])

json.dump(concepts, open("concepts.json", "w"))

# process language prior data
with open("concept2cls_selected.npy", "rb") as f:
    concept2cls_selected = np.load(f)

select_idx = torch.load("select_idx.pth")
concept2cls_10000 = concept2cls_selected[select_idx[:10000]]
json.dump(concept2cls_10000.tolist(), open("concept2cls_prior.json", "w"))

# print(max(concept2cls_10000))
# print(concept2cls_10000)
