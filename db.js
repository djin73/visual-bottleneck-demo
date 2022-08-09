// methods for querying MongoDB database
const env = require("dotenv");
const { MongoClient } = require("mongodb");

env.config();

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.v7lfgix.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
const classes_annotations = client
  .db("visual_bottleneck")
  .collection("classes_annotations");

const get_annotations_for_class = async (
  dataset_name,
  bottleneck_name,
  class_id
) => {
  const query = { dataset_name, bottleneck_name, class_id };
  const options = {
    projection: {
      _id: 0,
      concepts: 1,
    },
  };
  console.log("query", query);
  const concept_annotations = await classes_annotations.findOne(query, options);
  console.log(concept_annotations);
  return concept_annotations;
};

// new_concepts is array of {concept_id, annotations}
const update_annotations = async (
  dataset_name,
  bottleneck_name,
  class_id,
  new_concepts
) => {
  const filter = { dataset_name, bottleneck_name, class_id };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      concepts: new_concepts,
    },
  };
  const res = await classes_annotations.updateOne(filter, updateDoc, options);
};

// run().catch(console.dir);
// console.log(get_annotations_for_class("flower", "flower_new", 0)); // this prints pending promise
// update_annotations("flower", "flower_new", 1, [
//   { concept_id: 308, annotations: [0, 1] },
//   { concept_id: 50, annotations: [0, 1] },
//   { concept_id: 2990, annotations: [0, 1] },
// ]);
// get_annotations("flower", "flower_new", 0);

module.exports = { get_annotations_for_class, update_annotations };
