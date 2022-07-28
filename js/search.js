const MAX_COUNT = 1000;

// TODO change nomenclature
function load_category_select(datasets_list) {
  let category_option_template = $.templates("#category-option");
  Object.keys(datasets_list).forEach((dset_name) => {
    $("#category-select").append(
      category_option_template.render({
        id: dset_name,
        name: dset_name,
      })
    );
  });
}

function load_search_parameters() {
  let param = { search: null, category: null };
  let query_string = window.location.search;
  let url_params = new URLSearchParams(query_string);
  if (url_params.has("search")) {
    param.search = url_params.get("search").toLowerCase();
    $("#search-bar").val(param.search);
  }
  if (url_params.has("category")) {
    if (url_params.get("category") != "all") {
      param.category = parseInt(url_params.get("category"));
      $("#category-select").val(param.category);
    }
  }
  return param;
}

function search(parameters, datasets_list) {
  // Get templates
  let bottleneck_link_template = $.templates("#bottleneck-link");
  const dataset_div_template = $.templates("#dataset-div");

  // Get columns

  const min_column = (dataset_name) => {
    let columns = [
      $(`#${dataset_name}-search-result-column-1`),
      $(`#${dataset_name}-search-result-column-2`),
      $(`#${dataset_name}-search-result-column-3`),
    ];

    let min_column_id = 0;
    let min_column_height = columns[0].height();
    for (let i = 1; i < 3; i++) {
      let column_height = columns[i].height();
      if (column_height < min_column_height) {
        min_column_id = i;
        min_column_height = column_height;
      }
    }
    return columns[min_column_id];
  };

  // Enter loop
  let count = 0;
  // TODO make this based on parameters
  Object.entries(datasets_list).forEach(([dset_name, bottlenecks]) => {
    // Check if this is a match
    // TODO re-add this and edit this later
    // if (parameters.category && data.category.indexOf(parameters.category) < 0) {
    //   return;
    // }
    // if (
    //   parameters.search &&
    //   data.task.toLowerCase().indexOf(parameters.search) < 0
    // ) {
    //   return;
    // }
    // if (count >= MAX_COUNT) {
    //   return;
    // }

    // render dataset div
    $("#search-results-outer").append(
      dataset_div_template.render({ dataset_name: dset_name })
    );

    // Is a match, append the rendered html element to the minimum column
    bottlenecks.forEach((bot_name) => {
      min_column(dset_name).append(
        bottleneck_link_template.render({
          dataset_name: dset_name,
          bottleneck_name: bot_name,
          elem_id: `card-${dset_name}-${bot_name}`,
        })
      );

      // Increment the count
      count += 1;
    });
  });

  // Set the search count
  $("#search-item-count").text(count);
  $("#search-message").attr("style", "display: block");
}

$(document).ready(function () {
  load_datasets_list(function (datasets_list) {
    load_category_select(datasets_list);
    let param = load_search_parameters();
    search(param, datasets_list);
  });
});
