function load_data(callback) {
  $.getJSON("data/class_to_truth.json", function (class_ground_truth) {
    $.getJSON("data/classes.json", function (classes_data) {
      $.getJSON("data/concepts.json", function (concepts_data) {
        callback(new Dataset(class_ground_truth, classes_data, concepts_data));
      });
    });
  });
}

class Dataset {
  constructor(class_ground_truth, classes_data, concepts_data) {
    this.class_ground_truth = class_ground_truth;
    this.classes_data = classes_data;
    this.concepts_data = concepts_data;
  }

  get_concept_card_data(concept_id, caption_id_prefix) {
    let cur_concept = this.concepts_data[`${concept_id}`];
    return {
      title: cur_concept["name"],
      elem_id: `${caption_id_prefix}-card`,
      concept_id: concept_id, //TODO check
      images: cur_concept["images"].map((img_path) => {
        return {
          path: img_path,
        };
      }),
    };
  }

  get_classes_card_data(location_prefix) {
    // TODO support multiple datasets/bottlenecks
    let classes_data = this.classes_data;
    return {
      title: "Flower 102 dataset", // TODO edit
      elem_id: `${location_prefix}-card`,
      classes: Object.entries(classes_data).map(([class_id, class_info]) => {
        return {
          category: class_info["name"],
          elem_id: `${location_prefix}-category-${class_id}`,
          class_id: class_id,
        };
      }),
    };
  }
}
