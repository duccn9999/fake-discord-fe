import { useState, useEffect } from "react";
import axios from "axios";

const useUploadImage = (img) => {
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    if (!img) return; // Skip if no image provided
    const uploadImage = async () => {
      const data = new FormData();
      data.append("file", img);
      data.append("upload_preset", "duccn123");
      data.append("cloud_name", "dywexvvcy");

      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dywexvvcy/image/upload",
          data
        );
        setUploadedImage(response.data); // Set uploaded image data
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    };

    uploadImage();
  }, [img]);

  return uploadedImage;
};

export default useUploadImage;
