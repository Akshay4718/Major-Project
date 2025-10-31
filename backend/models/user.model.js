import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  first_name: { type: String, trim: true },
  middle_name: { type: String, trim: true },
  last_name: { type: String, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  number: { type: Number, },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'tpo_admin', 'management_admin', 'superuser'], required: true },
  profile: {
    type: String,
    default: 'https://res.cloudinary.com/dgu6xwnzx/image/upload/v1743159225/defaultProfileImg_cmmurk.jpg',
  },
  fullAddress: {
    address: { type: String },
    pincode: { type: Number }
  },
  dateOfBirth: { type: Date, },
  createdAt: { type: Date, default: new Date() },
  token: { type: String },
  isProfileCompleted: { type: Boolean, default: false },
  // Student specific fields
  studentProfile: {
    isApproved: { type: Boolean },
    rollNumber: { type: Number, unique: true, sparse: true },
    resume: { type: String, },
    USN: { type: String, unique: true, sparse: true, trim: true },
    department: { type: String, enum: ['CSE', 'ISE', 'AIML', 'MECH', 'CIVIL','ECE','EEE'] },
    year: { type: Number, enum: [1, 2, 3, 4] },
    addmissionYear: { type: Number },
    gap: { type: Boolean, default: false },
    activeBacklog: { type: Number, default: 0 },
    SGPA: {
      sem1: { type: Number },
      sem2: { type: Number },
      sem3: { type: Number },
      sem4: { type: Number },
      sem5: { type: Number },
      sem6: { type: Number },
      sem7: { type: Number },
      sem8: { type: Number }
    },
    pastQualification: {
      sslc: {
        board: { type: String },
        percentage: { type: Number },
        year: { type: Number }
      },
      puc: {
        board: { type: String },
        percentage: { type: Number },
        year: { type: Number }
      },
      diploma: {
        department: { type: String },
        percentage: { type: Number },
        year: { type: Number }
      },
    },
    appliedJobs: [
      {
        // Reference to job posting
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        // Track application status (synced with job.applicants)
        applicationStatus: { 
          type: String, 
          enum: ['applied', 'shortlisted', 'rejected', 'in-process', 'selected', 'placed'], 
          default: 'applied' 
        },
        currentRound: { type: String },
        package: { type: Number },
        appliedAt: { type: Date, default: Date.now },
        isPlaced: { type: Boolean, default: false }
      }
    ],
    internships: [
      {
        type: { type: String, enum: ['Full Time', "Part Time", "On-Site", "Work From Home", "Other"] },
        companyName: { type: String },
        companyAddress: { type: String },
        companyWebsite: { type: String },
        internshipDuration: { type: Number },
        startDate: { type: Date },
        endDate: { type: Date },
        monthlyStipend: { type: Number },
        description: { type: String },
      }
    ],
  },

  // TPO Admin specific fields
  // more for tpo
  tpoProfile: { position: { type: String, trim: true }, },

  // Management Admin specific fields
  // more for management
  managementProfile: { position: { type: String, trim: true }, }

});

// Virtual field for CGPA calculation based on completed semesters
UserSchema.virtual('studentProfile.CGPA').get(function() {
  if (!this.studentProfile || !this.studentProfile.SGPA) return null;
  
  const sgpaValues = [
    this.studentProfile.SGPA.sem1,
    this.studentProfile.SGPA.sem2,
    this.studentProfile.SGPA.sem3,
    this.studentProfile.SGPA.sem4,
    this.studentProfile.SGPA.sem5,
    this.studentProfile.SGPA.sem6,
    this.studentProfile.SGPA.sem7,
    this.studentProfile.SGPA.sem8
  ].filter(sgpa => sgpa !== null && sgpa !== undefined && sgpa !== '' && !isNaN(sgpa));
  
  if (sgpaValues.length === 0) return null;
  
  const sum = sgpaValues.reduce((acc, val) => acc + parseFloat(val), 0);
  const cgpa = sum / sgpaValues.length;
  
  return parseFloat(cgpa.toFixed(2));
});

// Ensure virtuals are included in JSON output
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

// Auto-increment roll number for new students
UserSchema.pre('save', async function (next) {
  try {
    // Only assign roll number for students who don't have one
    if (this.role === 'student' && this.isNew && !this.studentProfile.rollNumber) {
      const User = mongoose.model('Users');
      
      // Find the highest roll number
      const lastStudent = await User.findOne(
        { role: 'student', 'studentProfile.rollNumber': { $exists: true } },
        { 'studentProfile.rollNumber': 1 }
      ).sort({ 'studentProfile.rollNumber': -1 });
      
      // Assign next roll number (start from 1001 if no students exist)
      this.studentProfile.rollNumber = lastStudent?.studentProfile?.rollNumber 
        ? lastStudent.studentProfile.rollNumber + 1 
        : 1001;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware to delete job applicants before deleting the user
UserSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const userId = this._id; // Get the current user's ID

    const Notice = mongoose.model('Notice');
    const Job = mongoose.model('Job');

    // Remove the studentId from any jobs where the user is listed as an applicant
    await Job.updateMany(
      { 'applicants.studentId': userId }, // Find jobs with the user as an applicant
      { $pull: { applicants: { studentId: userId } } } // Remove the user from the applicants array
    );

    await Notice.updateMany(
      { "sender": userId }, // Find jobs with the user as an applicant
      { $pull: { sender: userId } } // Remove the user from the applicants array
    );

    next(); // Proceed with the user deletion
  } catch (error) {
    next(error); // Pass any errors to the next middleware
  }
});



export default mongoose.model('Users', UserSchema);
