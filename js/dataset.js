function load_data(dataset_name, bottleneck_name, callback) {
  $.getJSON("data/datasets_and_bottlenecks.json", (datasets_list) => {
    $.getJSON(
      `data/${dataset_name}/${bottleneck_name}/class_to_truth.json`,
      function (class_ground_truth) {
        $.getJSON(
          `data/${dataset_name}/${bottleneck_name}/classes.json`,
          function (classes_data) {
            $.getJSON(
              `data/${dataset_name}/${bottleneck_name}/concepts.json`,
              function (concepts_data) {
                let concept_to_prior = null;
                $.getJSON(
                  `data/${dataset_name}/${bottleneck_name}/concept2cls_prior.json`
                )
                  .done((prior_data) => {
                    concept_to_prior = prior_data;
                  })
                  .fail(() => console.log("prior data does not exist"))
                  .always(() => {
                    callback(
                      new Dataset(
                        datasets_list,
                        class_ground_truth,
                        classes_data,
                        concepts_data,
                        concept_to_prior,
                        dataset_name,
                        bottleneck_name
                      )
                    );
                  });
              }
            );
          }
        );
      }
    );
  });
}
// TODO check if the above needs to load datasets list

const load_datasets_list = (callback) => {
  $.getJSON("data/datasets_and_bottlenecks.json", callback);
};

class Dataset {
  constructor(
    datasets_list,
    class_ground_truth,
    classes_data,
    concepts_data,
    concept_to_prior,
    dataset_name,
    bottleneck_name
  ) {
    this.datasets_list = datasets_list;
    this.class_ground_truth = class_ground_truth;
    this.classes_data = classes_data;
    this.concepts_data = concepts_data;
    this.concept_to_prior = concept_to_prior;
    this.dataset_name = dataset_name; // TODO change?
    this.bottleneck_name = bottleneck_name;
    // TODO remove
    if (concept_to_prior) {
      for (const class_id in classes_data) {
        classes_data[class_id]["concepts"].forEach(([concept_id]) => {
          if (concept_to_prior[concept_id] === parseInt(class_id))
            console.log(class_id, concept_id);
        });
      }
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
          path: `${this.dataset_name}/images/${img_path}`,
        };
      }),
    };
  }

  get_classes_card_data(location_prefix) {
    // TODO support multiple datasets/bottlenecks
    let classes_data = this.classes_data;
    return {
      dataset_name: this.dataset_name, // TODO edit?
      bottleneck_name: this.bottleneck_name,
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
