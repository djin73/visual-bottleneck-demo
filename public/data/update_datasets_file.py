import os
import json

# MAKE SURE TO RUN FROM "data" DIRECTORY


def get_dirs_in_dir(directory):
    return next(os.walk(directory))[1]


new_datasets = {
    dataset: [
        bottleneck for bottleneck in get_dirs_in_dir(dataset) if bottleneck != "images"
    ]
    for dataset in get_dirs_in_dir(".")
}
json.dump(new_datasets, open("datasets_and_bottlenecks.json", "w"))
