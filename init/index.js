const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  //to add owner id for all the data 
  initData.data = initData.data.map((obj) => ({ ...obj, owner:"6749af6914a5dae674c5db64" }));  
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();