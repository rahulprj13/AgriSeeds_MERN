const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController.js");

router.post("/add", cartController.addToCart);
router.get("/:userId", cartController.getCart);
router.put("/update/:id", cartController.updateQuantity);
router.delete("/remove/:id", cartController.removeItem);

module.exports = router;