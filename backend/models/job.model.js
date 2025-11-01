import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const jobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  jobDescription: { type: String, required: true },
  eligibility: { type: String },
  salary: { type: Number },
  howToApply: { type: String },
  postedAt: { type: Date, default: Date.now },
  applicationDeadline: { type: Date },
  
  // Job Category for Placement Policy
  jobCategory: {
    type: String,
    enum: ['mass', 'core', 'dream', 'open_dream'],
    required: true
  },
  
  // Internship with conversion option (for policy exception)
  isInternship: { type: Boolean, default: false },
  hasConversionOption: { type: Boolean, default: false },
  
  // Eligibility Criteria (Optional)
  eligibilityCriteria: {
    sslcPercentage: { type: Number, min: 0, max: 100 }, // 10th percentage
    pucPercentage: { type: Number, min: 0, max: 100 },  // 12th percentage
    degreeCgpa: { type: Number, min: 0, max: 10 }       // Degree CGPA
  },
  
  // Eligible Branches/Departments
  eligibleBranches: [{
    type: String,
    enum: ['CSE', 'ISE', 'AIML', 'MECH', 'CIVIL', 'ECE', 'EEE']
  }],
  
  // company details
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  
  // Placement workflow stages
  placementStage: {
    type: String,
    enum: ['open', 'closed', 'shortlisting', 'interviewing', 'completed'],
    default: 'open'
  },
  
  // Excel export tracking
  applicantsExported: { type: Boolean, default: false },
  exportedAt: { type: Date },
  
  // Shortlist tracking
  shortlistReceived: { type: Boolean, default: false },
  shortlistReceivedAt: { type: Date },
  
  // applicants details with enhanced workflow
  applicants: [
    {
      studentId: { type: Schema.Types.ObjectId, ref: 'Users' },
      
      // Application stage tracking
      applicationStatus: {
        type: String,
        enum: ['applied', 'shortlisted', 'rejected', 'in-process', 'selected', 'placed'],
        default: 'applied'
      },
      
      // Interview rounds tracking
      interviewRounds: [
        {
          roundName: { type: String }, // e.g., "Aptitude Test", "Technical Round 1"
          roundDate: { type: Date },
          status: { type: String, enum: ['scheduled', 'cleared', 'failed', 'pending'], default: 'pending' },
          remarks: { type: String },
          updatedAt: { type: Date, default: Date.now }
        }
      ],
      
      // Current active round
      currentRound: { type: String },
      
      // Selection details
      isSelected: { type: Boolean, default: false },
      selectionDate: { type: Date },
      package: { type: Number },
      joiningDate: { type: Date },
      offerLetter: { type: String },
      
      // Timestamps
      appliedAt: { type: Date, default: Date.now },
      shortlistedAt: { type: Date },
      rejectedAt: { type: Date },
      placedAt: { type: Date },
      
      // Notes by TPO
      tpoRemarks: { type: String }
    }
  ],
  
  // Drive completion tracking
  driveFinished: { type: Boolean, default: false },
  driveFinishedAt: { type: Date },
  driveFinishedBy: { type: Schema.Types.ObjectId, ref: 'Users' }
});


// Middleware to delete the jobId from user's appliedJobs array before deleting the job
jobSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const jobId = this._id; // Get the current job's ID

    const User = mongoose.model('Users');

    // Remove the jobId from all users' appliedJobs array
    await User.updateMany(
      { 'studentProfile.appliedJobs.jobId': jobId }, // Find users who applied to this job
      { $pull: { 'studentProfile.appliedJobs': { jobId: jobId } } } // Remove the jobId from appliedJobs array
    );

    next(); // Proceed with the job deletion
  } catch (error) {
    next(error); // Pass any errors to the next middleware
  }
});


export default mongoose.model('Job', jobSchema);
