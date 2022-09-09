// methods for querying MongoDB database

const constants = require("./constants.js");
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
  const concept_annotations = await classes_annotations.findOne(query, options);
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
  await classes_annotations.updateOne(filter, updateDoc, options);
};

const get_all_annotations_for_bottleneck = async (
  dataset_name,
  bottleneck_name
) => {
  const query = { dataset_name, bottleneck_name };
  const options = {
    projection: {
      _id: 0,
      class_id: 1,
      concepts: 1,
    },
  };
  const classes = await classes_annotations.find(query, options).toArray();
  const triplets = classes.flatMap(({ class_id, concepts }) => {
    // below: return array of triplets corresponding to this class
    return concepts.flatMap(({ concept_id, annotations, edited_name }) => {
      // below: return array of triplets corresponding to this concept
      let annotations_without_edit = annotations.map((annot) => {
        const actual_annot =
          typeof annot === "number" ? constants.annotation_map[annot] : annot;
        console.log(concept_id, annot, actual_annot);
        return [class_id, concept_id, actual_annot];
      });
      if (edited_name) {
        annotations_without_edit.push([
          class_id,
          concept_id,
          `EDITED NAME: ${edited_name}`,
        ]);
      }
      return annotations_without_edit;
    });
  });
  return triplets;
  // data format: [category, concept, annotation] triplets
};

module.exports = {
  get_annotations_for_class,
  update_annotations,
  get_all_annotations_for_bottleneck,
};
