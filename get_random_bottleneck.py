import sys
import json
import s3fs as s3fs
import random
from dotenv import load_dotenv

load_dotenv()


fs = s3fs.S3FileSystem(anon=False)
datasets = fs.ls(
    "visual-bottleneck-demo-data"
)  # e.g. ['visual-bottleneck-demo-data/flower']
dataset = random.sample(datasets, 1)[0]
out = {}
out['bottleneck'] = random.sample([b for b in fs.ls(dataset) if b.split("/")[-1] != "images"],1)[0].split("/")[-1]
out['dataset'] = dataset.split("/")[-1]
output = f"./bottleneck.html?dataset={out['dataset']}&bottleneck={out['bottleneck']}"
print(json.dumps([output]))



