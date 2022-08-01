const LINE_CANVAS_PADDING = 20;

$(document).ready(function () {
  const query_string = window.location.search;
  const url_params = new URLSearchParams(query_string);
  let dataset_name = url_params.get("dataset");
  let bottleneck_name = url_params.get("bottleneck");
  if (!dataset_name) {
    dataset_name = "flower";
    bottleneck_name = "flower_new";
  }
  load_data(dataset_name, bottleneck_name, (dataset) => {
    let visualizer = new Visualizer();
    initialize(visualizer, dataset);
  });
});

function initialize(visualizer, dataset) {
  let query_string = window.location.search;
  // let url_params = new URLSearchParams(query_string);

  // if (url_params.has("task_id")) {
  //   let task_id = url_params.get("task_id");
  //   let class_id = url_params.has("class_id")
  //     ? url_params.get("class_id")
  //     : null;
  //   let datapoint = new Datapoint(task_id, class_id, null);
  //   visualizer.visualize(datapoint, dataset);
  // } else {
  // let curr_datapoint = dataset.sample_datapoint();
  // don't randomly sample for now
  visualizer.visualize(null, dataset);
  // }

  // Remove the loading mask
  $("#loading-mask").removeClass("active");
  setTimeout(() => $("#loading-mask").attr("style", "display: none"), 200);
}

class Visualizer {
  constructor() {
    this.card_template = $.templates("#card");
    this.history_card_template = $.templates("#history-card");
    this.concept_card_template = $.templates("#concept-card");
    this.ground_truth_card_template = $.templates("#ground-truth-card");
    this.classes_card_template = $.templates("#classes-card");
    this.concept_details_template = $.templates("#concept-details-card");
    this.slider_template = $.templates("#slider");
  }

  visualize(cur_class_id, dataset) {
    $(window).off("resize");
    $("#left").unbind("scroll");
    $("#middle").unbind("scroll");
    $("#curr-dataset").text(dataset.dataset_name); //TODO temporary
    // Push history
    const new_url = new URL(window.location.href);
    new_url.search = `?dataset=${dataset.dataset_name}&bottleneck=${dataset.bottleneck_name}`;
    window.history.replaceState({ path: new_url.href }, "", new_url.href);

    // Get the data
    let data = dataset.get_classes_card_data("left");
    // let data = dataset.get_card_data(datapoint, "middle");

    // Render the object onto the page
    // $("#middle-inner").html(this.classes_card_template.render(data));
    $("#left-inner").html(this.classes_card_template.render(data));

    // Setup the callbacks

    data.classes.forEach(({ class_id, category }) => {
      $(`#left-category-${class_id}`).click(() => {
        this.visualize(class_id, dataset);
      });
    });

    // If the step id is present, directly visualize that step
    if (cur_class_id != null) {
      $("#right-inner").html("");
      this.visualize_class(cur_class_id, dataset);
    } else {
      $("#middle-inner").html("");
      $("#left-line-canvas").attr("style", "display: none");
    }
  }

  visualize_class(class_id, dataset) {
    // Open the middle canvas
    $("#left-line-canvas").attr("style", "display: block");

    // Push history
    const new_url = new URL(window.location.href);
    new_url.search = `?dataset=${dataset.dataset_name}&bottleneck=${dataset.bottleneck_name}&class_id=${class_id}`;
    window.history.replaceState({ path: new_url.href }, "", new_url.href);

    // Highlight the step in the left
    $(`#left-category-${class_id}`)
      .addClass("active")
      .siblings()
      .removeClass("active");

    // Clear the middle
    $("#middle-inner").html("");

    const cur_class_data = dataset.classes_data[`${class_id}`];
    const concepts = cur_class_data["concepts"];

    // render and set up slider
    $("#middle-inner").append(
      this.slider_template.render({
        slider_value: concepts.length,
        max_value: concepts.length,
      })
    );
    $("#concepts-slider").change(() => {
      this.render_concepts(class_id, $("#concepts-slider").val(), dataset);
      $("#num-concepts-shown").html($("#concepts-slider").val());
    });

    // add ground truth card
    let cls_name = cur_class_data["name"];
    $("#middle-inner").append(
      this.ground_truth_card_template.render({
        img_paths: dataset.class_ground_truth[cls_name].map((url) => {
          return {
            path: `${dataset.dataset_name}/images/${url}`,
          };
        }),
      })
    );

    $("#middle-inner").append(`<div id="concepts-container"></div>`);

    this.render_concepts(class_id, concepts.length, dataset);
  }

  visualize_concept(concept_id, class_id, dataset) {
    // set new URL
    const new_url = new URL(window.location.href);
    new_url.search = `?dataset=${dataset.dataset_name}&bottleneck=${dataset.bottleneck_name}&class_id=${class_id}&concept_id=${concept_id}`;
    window.history.replaceState({ path: new_url.href }, "", new_url.href);

    // highlight original concept card
    $(`#middle-${concept_id}-card`)
      .addClass("selected-card")
      .siblings()
      .removeClass("selected-card");

    // clear the right pane and render concept details card
    $("#right-inner").html("");

    const cur_concept_data = dataset.concepts_data[`${concept_id}`];
    $("#right-inner").append(
      this.concept_details_template.render({
        concept_id: concept_id,
        elem_id: `${concept_id}-concept-details-card`,
        title: cur_concept_data["name"],
        images: cur_concept_data["images_classes"].map(
          ([img_path, img_class]) => {
            return {
              img_path: `${dataset.dataset_name}/images/${img_path}`,
              img_class: img_class,
            };
          }
        ),
      })
    );
  }

  render_concepts(class_id, num_concepts, dataset) {
    $("#concepts-container").html("");

    const cur_class_data = dataset.classes_data[`${class_id}`]; //TODO new
    const concepts_sliced = cur_class_data["concepts"].slice(0, num_concepts);

    // For each concept, render the concept card
    concepts_sliced.forEach(([concept_id]) => {
      let data = dataset.get_concept_card_data(
        concept_id,
        `middle-${concept_id}`
      );
      $("#concepts-container").append(this.concept_card_template.render(data));
      if (
        dataset.concept_to_prior &&
        dataset.concept_to_prior[concept_id] === parseInt(class_id)
      )
        $(`#concept-label-${concept_id}`).css("color", "red");

      // set up callbacks for each concept detail card
      $(`#middle-${concept_id}-card`).click(() => {
        this.visualize_concept(concept_id, class_id, dataset);
      });
    });

    // Setup a scroll callback
    let draw = () => {
      let svg_elem = $("#left-line-canvas");
      let svg_x = svg_elem.position().left;
      let svg_y = svg_elem.position().top;

      // Get d3 svg and clear the canvas
      let svg = d3.select("#left-line-canvas");
      svg.selectAll("*").remove();

      // Get left element
      let left_elem = $(
        `#left-category-${class_id} .card-section-caption-anchor-circle`
      );
      let left_elem_position = left_elem.position();
      let left_x = left_elem_position.left - svg_x + 6 + LINE_CANVAS_PADDING;
      let left_y = left_elem_position.top - svg_y + 6;

      // draw lines to each concept
      concepts_sliced.forEach(([concept_id, wt]) => {
        let middle_elem = $(`#middle-${concept_id}-card .card-left-anchor`);
        let middle_elem_position = middle_elem.position();
        let middle_x =
          middle_elem_position.left - svg_x + 6 + LINE_CANVAS_PADDING;
        let middle_y = middle_elem_position.top - svg_y + 6;

        // Draw line
        // svg
        //   .append("line")
        //   .style("stroke", "red")
        //   .style("stroke-width", 2)
        //   .attr("x1", middle_x)
        //   .attr("y1", middle_y)
        //   .attr("x2", right_x)
        //   .attr("y2", right_y);

        // Draw a text
        let text_y = middle_y > left_y ? middle_y + 20 : middle_y - 10;
        svg
          .append("text")
          .text(`${wt}`.substring(0, 7))
          .style("font-size", "18px")
          .style("font-weight", "bold")
          .style("fill", "red")
          .attr("x", middle_x - 85)
          .attr("y", text_y);
      });
    };
    $(window).resize(draw);
    $("#middle").scroll(draw);
    $("#left").scroll(draw);
    draw();
  }
}

//TODO maybe bring datapoint back into use when refactoring?
class Datapoint {
  constructor(task_id, class_id, parent_datapoint) {
    this.task_id = `${task_id}`;
    this.class_id = class_id;
    this.parent_datapoint = parent_datapoint;
  }
}
