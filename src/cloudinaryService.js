const cloudinary = require("cloudinary");

cloudinary.v2.config({
  cloud_name: "dywexvvcy",
  api_key: "531895637933677",
  api_secret: process.env.CLOUDINARY_API_SECRET, // Securely load from environment variable
  secure: true,
});

export function CloudinaryService() {
  return {
    Upload: async (img) => {
      try {
        const result = await cloudinary.v2.uploader.upload(img, {
          asset_folder: "images",
          resource_type: "image",
        });
        return result; // Return the upload result
      } catch (error) {
        console.error("Error uploading image:", error);
        throw error; // Rethrow to handle in calling code
      }
    },
    Update: async (oldName, newName) => {
      try {
        const result = await cloudinary.v2.uploader.rename(oldName, newName, {
          type: "upload",
          resource_type: "image",
        });
        return result; // Return the update result
      } catch (error) {
        console.error("Error renaming resource:", error);
        throw error; // Rethrow to handle in calling code
      }
    },
    Delete: async (img) => {
      try {
        const result = await cloudinary.v2.api.delete_resources([img], {
          type: "upload",
          resource_type: "image",
        });
        return result; // Return the delete result
      } catch (error) {
        console.error("Error deleting resource:", error);
        throw error; // Rethrow to handle in calling code
      }
    },
  };
}

export default CloudinaryService;
