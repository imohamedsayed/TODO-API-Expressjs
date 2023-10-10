const fs = require("fs");
const path = require("path");

const deleteImage = (image) => {
  fs.unlinkSync(path.join(__dirname, "../uploads/" + image));
};

const deleteImages = (images) => {
  images.forEach((image) => {
    fs.unlinkSync(path.join(__dirname, "../uploads/" + image));
  });
};
const getImage = (file) => {
  let name = file.path.substring(file.path.lastIndexOf("\\uploads") + 1);
  return name;
};

module.exports = {
  deleteImage,
  getImage,
  deleteImages,
};
