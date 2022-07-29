const LINE_CANVAS_PADDING = 20;

$(document).ready(function () {
  //TODO change this to load multiple datasets
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

    // // If the previous datapoint is present, visualize the parent
    // if (datapoint.parent_datapoint != null) {
    //   this.visualize_parent(datapoint.parent_datapoint, dataset);
    // // } else {
    // $("#left-inner").html("");
    // $("#left-line-canvas").attr("style", "display: none");
    // }
  }
  /*
  visualize_parent(parent_datapoint,  dataset) {
    // Open the left canvas
    $("#left-line-canvas").attr("style", "display: block");

    // Clear the left
    $("#left-inner").html("");

    // Render the left
    let data = dataset.get_card_data(parent_datapoint, "left");
    $("#left-inner").html(this.history_card_template.render(data));

    // Setup on click callback
    $(`#left-card`).click(() => {
      this.visualize(parent_datapoint, dataset);
    });

    // Setup on scroll callback
    let draw = () => {
      let svg_elem = $("#left-line-canvas");
      let svg_x = svg_elem.position().left;
      let svg_y = svg_elem.position().top;

      // Get d3 svg and clear the canvas
      let svg = d3.select("#left-line-canvas");
      svg.selectAll("*").remove();

      // Get middle element position
      let middle_elem = $("#middle-card .card-left-anchor");
      let middle_elem_position = middle_elem.position();
      let middle_x =
        middle_elem_position.left - svg_x + 6 + LINE_CANVAS_PADDING;
      let middle_y = middle_elem_position.top - svg_y + 6;

      // Get left element position
      let left_elem = $("#left-card .card-section-caption-anchor-circle");
      let left_elem_position = left_elem.position();
      let left_x = left_elem_position.left - svg_x + 6 + LINE_CANVAS_PADDING;
      let left_y = left_elem_position.top - svg_y + 6;

      // Draw line
      svg
        .append("line")
        .style("stroke", "rgba(0, 0, 0, 0.5)")
        .style("stroke-width", 2)
        .attr("x1", left_x)
        .attr("y1", left_y)
        .attr("x2", middle_x)
        .attr("y2", middle_y);

      // If there is one more level of parent, draw an additional line from left of the screen
      let base_svg = d3.select("#base-canvas");
      base_svg.selectAll("*").remove();
      if (parent_datapoint.parent_datapoint != null) {
        base_svg.selectAll("*").remove();
        let edge_x = 0;
        let left_card = $("#left-card");
        let left_card_left_x = left_card.position().left + 1;
        let left_card_middle_y =
          left_card.position().top + left_card.outerHeight() / 2 + 10;
        base_svg
          .append("line")
          .style("stroke", "rgba(0, 0, 0, 0.2)")
          .style("stroke-width", 1)
          .attr("x1", edge_x)
          .attr("y1", left_card_middle_y)
          .attr("x2", left_card_left_x)
          .attr("y2", left_card_middle_y);
      }
    };
    $(window).resize(draw);
    $("#middle").scroll(draw);
    draw();
  }
*/

  visualize_class(class_id, dataset) {
    // Open the middle canvas
    $("#left-line-canvas").attr("style", "display: block");

    // Push history
    const new_url = new URL(window.location.href);
    new_url.search = `?dataset=${dataset.dataset_name}&bottleneck=${dataset.bottleneck_name}&class_id=${class_id}`;
    window.history.replaceState({ path: new_url.href }, "", new_url.href);

    // Highlight the step in the left
    $(`#left-category-${class_id}`) //TODo was middle-
      .addClass("active")
      .siblings()
      .removeClass("active");

    // Clear the middle
    $("#middle-inner").html("");

    const cur_class_data = dataset.classes_data[`${class_id}`]; //TODO new
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

    // For each concept, render the concept card
    const concepts = cur_class_data["concepts"];
    concepts.forEach(([concept_id]) => {
      let data = dataset.get_concept_card_data(
        concept_id,
        `middle-${concept_id}`
      );
      $("#middle-inner").append(this.concept_card_template.render(data));
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
      concepts.forEach(([concept_id, wt]) => {
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
}

//TODO maybe bring datapoint back into use when refactoring?
class Datapoint {
  constructor(task_id, class_id, parent_datapoint) {
    this.task_id = `${task_id}`;
    this.class_id = class_id;
    this.parent_datapoint = parent_datapoint;
  }
}
