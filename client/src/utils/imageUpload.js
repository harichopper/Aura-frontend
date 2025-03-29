export const checkImage = (file) => {
    let err = ""
    if(!file) return err = "File does not exist."

    if(file.size > 1024 * 1024) // 1mb
    err = "The largest image size is 1mb."

    if(file.type !== 'image/jpeg' && file.type !== 'image/png' )
    err = "Image format is incorrect."
    
    return err;
}


export const imageUpload = async (images) => {
    let imgArr = [];

    for (const item of images) {
        const formData = new FormData();

        if (item.camera) {
            formData.append("file", item.camera);
        } else {
            formData.append("file", item);
        }

        formData.append("upload_preset", "haricdon");  // Make sure this is correct
        formData.append("cloud_name", "dsalogt8w");   // Make sure this is correct

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/dsalogt8w/image/upload`, {  // ✅ Corrected URL
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                throw new Error(`Cloudinary Upload Failed: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            if (!data.secure_url) {
                throw new Error("No secure URL returned from Cloudinary");
            }

            imgArr.push({ public_id: data.public_id, url: data.secure_url });

        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            return { error: "Failed to upload image. Please try again." };
        }
    }

    return imgArr;
};
