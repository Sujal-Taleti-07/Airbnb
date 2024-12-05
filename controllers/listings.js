const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');  //using geocoding services
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listing/index.ejs", { allListings });
};

module.exports.renderNewForm = async (req, res)=>{
    res.render("./listing/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author",}}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist"); 
        res.redirect("/listing");
    }
    res.render("listing/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
     let response = await geocodingClient.forwardGeocode({ //it will give [lat, long] for the entered place
        query: req.body.listing.location,
        limit: 1
      })
    .send();

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);  //creating new instance
    newListing.owner = req.user._id;  //store currUser id
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;   //map
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created");   // flash(keyword, msg to display)
    res.redirect("/listings"); 
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist"); 
        res.redirect("/listings");
    }

   let originalImageUrl = listing.image.url;  //original image
   originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,");

    res.render("listing/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedLisitng = await Listing.findByIdAndDelete(id);
    console.log(deletedLisitng);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings")
};