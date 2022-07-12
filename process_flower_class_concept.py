import json
import pickle

with open("cls_concept_2_3563ceb103fc09fa820f.table.json") as f:
    cls_concept = json.load(f)

data = cls_concept["data"]
# data[i] corresponds to flower i

reorganized_cls_concept = {
    i: {
        "name": data[i][0],
        "pred": [
            [data[i][concept_idx], data[i][concept_idx - 1]]
            for concept_idx in range(4, len(data[i]), 3)
        ],
    }
    for i in range(len(data))
}

# map from concept id to concept
concept_id_map = {
    flower[j]: flower[j - 2] for flower in data for j in range(4, len(flower), 3)
}


with open("concept2img.p", "rb") as f2:
    concept2img = pickle.load(f2)

reorganized_concept_image = {
    id: {
        "task": concept,
        "category": [],
        "caption": [img_url.split("/")[-1] for img_url in concept2img[concept]],
        "section": {},
        "section_name": "parts",
        "url": "https://www.wikihow.com/Choose-the-Best-VPN",
    }
    for id, concept in concept_id_map.items()
}
# last few fields are placeholders for now
# change "caption" field based on location of images

reorganized_concept_image[0] = {
    "task": "Flower 102 Dataset",
    "category": [],
    "caption": list(range(102)),
    "section": {},
    "section_name": "parts",
    "url": "https://www.wikihow.com/Choose-the-Best-VPN",
}

print(concept2img)
print(reorganized_cls_concept)
# print(sorted(concept_id_map.keys()))
print(reorganized_concept_image)

json.dump(reorganized_cls_concept, open("data/copy_step_predictions.json", "w"))
json.dump(reorganized_concept_image, open("data/copy_step_goals.json", "w"))

# ----- determine mappings from classes to ground truth images
with open("class2images_train.p", "rb") as f:
    class2images_train = pickle.load(f)

class_ground_truth = {
    cls: [img + ".jpg" for img in images[0:10]]
    for cls, images in class2images_train.items()
}
json.dump(class_ground_truth, open("data/class_to_truth.json", "w"))
