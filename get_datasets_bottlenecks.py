from dotenv import load_dotenv
import json
import s3fs

load_dotenv()

fs = s3fs.S3FileSystem(anon=False)
datasets = fs.ls(
    "visual-bottleneck-demo-data"
)  # e.g. ['visual-bottleneck-demo-data/flower']
datasets_and_bottlenecks = {
    dataset.split("/")[-1]: [
        bottleneck.split("/")[-1]
        for bottleneck in fs.ls(dataset)
        if bottleneck.split("/")[-1] != "images"
    ]
    for dataset in datasets
}

print(json.dumps(datasets_and_bottlenecks))
