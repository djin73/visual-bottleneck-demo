function load_data(dataset_name, bottleneck_name, callback) {
  $.getJSON(
    `https://visual-bottleneck-demo-data.s3.amazonaws.com/${dataset_name}/${bottleneck_name}/class_to_truth.json`,
    function (class_ground_truth) {
      $.getJSON(
        `https://visual-bottleneck-demo-data.s3.amazonaws.com/${dataset_name}/${bottleneck_name}/classes.json`,
        function (classes_data) {
          $.getJSON(
            `https://visual-bottleneck-demo-data.s3.amazonaws.com/${dataset_name}/${bottleneck_name}/concepts.json`,
            function (concepts_data) {
              let concept_to_prior = null;
              $.getJSON(
                `https://visual-bottleneck-demo-data.s3.amazonaws.com/${dataset_name}/${bottleneck_name}/concept2cls_prior.json`
              )
                .done((prior_data) => {
                  concept_to_prior = prior_data;
                })
                .fail(() => console.log("prior data does not exist"))
                .always(() => {
                  callback(
                    new Dataset(
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
}
// TODO check if the above needs to load datasets list

const load_datasets_list = (callback) => {
  $.getJSON("data/datasets_and_bottlenecks.json", callback);
};

class Dataset {
  constructor(
    class_ground_truth,
    classes_data,
    concepts_data,
    concept_to_prior,
    dataset_name,
    bottleneck_name
  ) {
    this.class_ground_truth = class_ground_truth;
    this.classes_data = classes_data;
    this.concepts_data = concepts_data;
    this.concept_to_prior = concept_to_prior;
    this.dataset_name = dataset_name; // TODO change?
    this.bottleneck_name = bottleneck_name;
  }

  get_concept_card_data(concept_id, caption_id_prefix) {
    let cur_concept = this.concepts_data[`${concept_id}`];
    return {
      title: cur_concept["name"],
      elem_id: `${caption_id_prefix}-card`,
      concept_id: concept_id,
      images: cur_concept["images_classes"].map(([img_path, img_class]) => {
        return {
          path: `${this.dataset_name}/images/${img_path}`,
          // TODO add to this
        };
      }),
      tags: cur_concept["tags"]
        ? cur_concept["tags"].map(([desc, color]) => {
            return { tag_desc: desc, tag_color: color };
          })
        : [],
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
