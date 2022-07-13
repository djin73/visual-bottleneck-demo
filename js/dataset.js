function load_data(callback) {
  $.getJSON("data/category_list.json", function (category_list) {
    $.getJSON("data/copy_step_goals.json", function (step_goals) {
      $.getJSON("data/copy_step_predictions.json", function (step_predictions) {
        $.getJSON("data/class_to_truth.json", function (class_ground_truth) {
          $.getJSON("data/classes.json", function (classes_data) {
            $.getJSON("data/concepts.json", function (concepts_data) {
              callback(
                new Dataset(
                  category_list,
                  step_goals,
                  step_predictions,
                  class_ground_truth,
                  classes_data,
                  concepts_data
                )
              );
            });
          });
        });
      });
    });
  });
}

class Dataset {
  constructor(
    category_list,
    step_goals,
    step_predictions,
    class_ground_truth,
    classes_data,
    concepts_data
  ) {
    this.category_list = category_list;
    this.step_goals = step_goals;
    this.step_predictions = step_predictions;
    this.class_ground_truth = class_ground_truth;
    this.classes_data = classes_data;
    this.concepts_data = concepts_data;
  }

  num_tasks() {
    return Object.keys(this.step_goals).length;
  }

  sample_datapoint() {
    let id = Math.floor(Math.random() * this.num_tasks());
    return new Datapoint(Object.keys(this.step_goals)[id], null, null);
  }

  get_card_data(datapoint, caption_id_prefix) {
    let task = this.step_goals[datapoint.task_id];
    return {
      title: task["task"],
      elem_id: `${caption_id_prefix}-card`,
      task_id: datapoint.task_id,
      has_url: task["url"] && true,
      url: task["url"],
      tags: task["category"].map((c) => {
        return { id: c, name: this.category_list[c] };
      }),
      captions: task["caption"].map((c) => {
        if (Number.isInteger(c)) {
          let pred = this.step_predictions[`${c}`];
          return {
            caption: pred.name,
            class_id: c,
            has_sub_steps: pred.pred.length > 0,
            elem_id: `${caption_id_prefix}-caption-${c}`,
          };
        } else {
          return { caption: c };
        }
      }),
    };
  }

  get_classes_card_data(datapoint, location_prefix) {
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

      // classes: task["caption"].map((c) => {
      //   if (Number.isInteger(c)) {
      //     let pred = this.step_predictions[`${c}`];
      //     return {
      //       caption: pred.name,
      //       step_id: c,
      //       has_sub_steps: pred.pred.length > 0,
      //       elem_id: `${location_prefix}-caption-${c}`,
      //     };
      //   } else {
      //     return { caption: c };
      //   }
      // }),
    };
  }
}
