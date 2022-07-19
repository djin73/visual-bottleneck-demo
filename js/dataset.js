function load_data(path, callback) {
  $.getJSON(`data/${path}/class_to_truth.json`, function (class_ground_truth) {
    $.getJSON(`data/${path}/classes.json`, function (classes_data) {
      $.getJSON(`data/${path}/concepts.json`, function (concepts_data) {
        $.getJSON(
          `data/${path}/concept2cls_prior.json`,
          (prior_data, textStatus) => {
            let concept_to_prior = null;
            if (textStatus === "success") {
              concept_to_prior = prior_data;
            }
            callback(
              new Dataset(
                class_ground_truth,
                classes_data,
                concepts_data,
                concept_to_prior,
                path
              )
            );
          }
        );
      });
    });
  });
}

class Dataset {
  constructor(
    class_ground_truth,
    classes_data,
    concepts_data,
    concept_to_prior,
    name
  ) {
    this.class_ground_truth = class_ground_truth;
    this.classes_data = classes_data;
    this.concepts_data = concepts_data;
    this.concept_to_prior = concept_to_prior;
    this.name = name; // TODO change?

    // TODO remove
    for (const class_id in classes_data) {
      classes_data[class_id]["concepts"].forEach(([concept_id]) => {
        if (concept_to_prior[concept_id] === parseInt(class_id))
          console.log(class_id, concept_id);
      });
    }
  }

  get_concept_card_data(concept_id, caption_id_prefix) {
    let cur_concept = this.concepts_data[`${concept_id}`];
    return {
      title: cur_concept["name"],
      elem_id: `${caption_id_prefix}-card`,
      concept_id: concept_id,
      images: cur_concept["images"].map((img_path) => {
        return {
          path: `${this.name}/images/${img_path}`,
        };
      }),
    };
  }

  get_classes_card_data(location_prefix) {
    // TODO support multiple datasets/bottlenecks
    let classes_data = this.classes_data;
    return {
      title: this.name, // TODO edit?
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
