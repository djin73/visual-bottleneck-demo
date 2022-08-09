const express = require("express");
const fs = require("fs");
const db = require("./db.js");
const router = express.Router();

// TODO look into error handling?
router.put(
  "/save-annotations/:dataset/:bottleneck/:class",
  async (req, res) => {
    // const edited_data = edit_annotations(
    //   req.body,
    //   req.params.dataset,
    //   req.params.bottleneck
    // );

    try {
      await db.update_annotations(
        req.params.dataset,
        req.params.bottleneck,
        parseInt(req.params.class),
        req.body["new_concepts"]
      );
      res.send({ success: true });
    } catch (e) {
      res.send({ success: false });
    }
  }
);

router.get("/get-annotations/:dataset/:bottleneck/:class", async (req, res) => {
  const db_result = await db.get_annotations_for_class(
    req.params.dataset,
    req.params.bottleneck,
    parseInt(req.params.class)
  );
  res.send(db_result);
});

const edit_annotations = function (
  new_annotations,
  dataset_name,
  bottleneck_name
) {
  let annotations = JSON.parse(
    fs.readFileSync(
      `public/data/${dataset_name}/${bottleneck_name}/concept_annotations.json`
    )
  );
  for (concept_id in new_annotations) {
    annotations[concept_id] = new_annotations[concept_id].map(
      (str) => str === "true" // needed to fix bug with 'true' instead of true
    );
  }
  fs.writeFileSync(
    `public/data/${dataset_name}/${bottleneck_name}/concept_annotations.json`,
    JSON.stringify(annotations)
  );
  return annotations;
};

module.exports = router;
