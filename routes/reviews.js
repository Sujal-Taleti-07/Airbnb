const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js"); 
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
const wrapAsync = require("../utils/wrapAsync.js");

//Custom wrapAsync
// function wrapAsync(fn) {
//     return function(req, res, next){
//         fn(req, res, next).catch(next);
//     }
// }

//POST Route 
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// DELETE Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;