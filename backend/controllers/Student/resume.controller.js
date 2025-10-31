import User from '../../models/user.model.js';
import cloudinary from '../../config/Cloudinary.js';
import path from 'path';

const UploadResume = async (req, res) => {
  try {
    // 1️⃣ Check if file exists
    if (!req.file) {
      return res.status(400).json({ msg: "No resume uploaded" });
    }

    // 2️⃣ Validate MIME type (only PDFs)
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ msg: "Only PDF files are allowed" });
    }

    // 3️⃣ Fetch user
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ msg: "Student not found!" });
    }

    // 4️⃣ Delete old resume if exists
    if (user.studentProfile.resume) {
      const oldResumeUrl = user.studentProfile.resume;
      const oldResumeFileName = oldResumeUrl
        .substring(oldResumeUrl.lastIndexOf("/") + 1)
        .split(".")[0];
      const oldResumePublicId = `CPMS/Resume/${oldResumeFileName}`;

      await cloudinary.uploader.destroy(oldResumePublicId, { resource_type: "raw" });
    }

    // 5️⃣ Generate unique filename
    const originalName = path.parse(req.file.originalname).name;
    const uniqueFilename = `${originalName}_${Date.now()}_${req.body.userId}`;

    // 6️⃣ Upload to Cloudinary as "raw"
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: "CPMS/Resume",
      public_id: uniqueFilename,
      resource_type: "raw", // <-- critical for PDF files
    });

    // 7️⃣ Create a direct "view/download" URL
    const viewUrl = cloudinary.url(`CPMS/Resume/${uniqueFilename}`, {
      resource_type: "raw",
      type: "upload",
      secure: true, // ensures https
    });

    // 8️⃣ Update MongoDB
    user.studentProfile.resume = viewUrl;
    await user.save();

    // 9️⃣ Respond to client
    return res.status(200).json({
      msg: "Resume uploaded successfully!",
      url: viewUrl,
      cloudinaryResponse, // optional: contains metadata (bytes, format, etc.)
    });
  } catch (error) {
    console.error("Upload Resume Error:", error);
    return res.status(500).json({ msg: "Server error", error });
  }
};

export default UploadResume;

