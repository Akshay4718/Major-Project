import User from '../../models/user.model.js';
import JobSchema from '../../models/job.model.js';


const AllJobs = async (req, res) => {
  try {
    const jobs = await JobSchema.find();
    return res.json({ data: jobs });
  } catch (error) {
    console.log("user.all-jobs.controller.js => ", error);
    return res.status(500).json({ msg: 'Server Error' });
  }
}

const DeleteJob = async (req, res) => {
  try {
    if (req.body.jobId) {
      // console.log(req.body.jobId)
      const job = await JobSchema.findById(req.body.jobId);

      // before this middleware pre will run to delete student's appliedJobs
      await job.deleteOne();
      return res.status(200).json({ msg: 'Job deleted successfully!' });
    }
  } catch (error) {
    console.log("user.all-jobs.controller.js => ", error);
    return res.status(500).json({ msg: 'Server Error' });
  }
}


const JobData = async (req, res) => {
  try {
    // pass if tpo is creating new post
    if (req.params.jobId !== 'undefined') {
      const job = await JobSchema.findById(req.params.jobId);
      return res.status(200).json(job);
    }
  } catch (error) {
    // checking if userId is exist or not
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'job data not found' });
    }
    console.log("user.all-jobs.controller.js => ", error);
    return res.status(500).json({ msg: 'Server Error' });
  }
}

const JobWithApplicants = async (req, res) => {
  try {
    const job = await JobSchema.findById(req.params.jobId)
      .populate({
        path: 'applicants.studentId',
        select: '_id first_name last_name email' // Select only name and email fields
      });

    if (!job) {
      return res.status(404).json({ msg: 'Job not found!' });
    }

    // Transform the applicants data for your table
    const applicantsList = job.applicants.map(applicant => ({
      id: applicant.studentId._id,
      name: applicant.studentId.first_name + " " + applicant.studentId.last_name,
      email: applicant.studentId.email,
      currentRound: applicant.currentRound,
      status: applicant.status, // Legacy field for backward compatibility
      applicationStatus: applicant.applicationStatus || applicant.status || 'applied',
      appliedAt: applicant.appliedAt,
    }));

    return res.status(200).json({ applicantsList });
  } catch (error) {
    console.log("Error fetching job with applicants => ", error);
    return res.status(500).json({ msg: 'Server Error' });
  }
};


const StudentJobsApplied = async (req, res) => {
  try {
    // Find all jobs where the student has applied
    const appliedJobs = await JobSchema.find({ 'applicants.studentId': req.params.studentId })
      .populate('company', 'companyName') // Populates the company field to get companyName
      .select('jobTitle _id salary applicationDeadline applicants company') // Select the required fields
      .lean(); // Use lean to return plain JS objects, making it faster for read operations
    // console.log(appliedJobs)
    // Add the number of applicants for each job
    const result = appliedJobs.map(job => {
      const applicantDetails = job.applicants.find(applicant => applicant.studentId.toString() === req.params.studentId);
      return {
        jobTitle: job.jobTitle,
        jobId: job._id,
        salary: job.salary,
        applicationDeadline: job.applicationDeadline,
        companyName: job.company.companyName,
        numberOfApplicants: job.applicants.length, // Count number of applicants
        appliedAt: applicantDetails.appliedAt, // Fetch the appliedAt date for this student
        status: applicantDetails.status, // Legacy field
        applicationStatus: applicantDetails.applicationStatus || applicantDetails.status || 'applied'
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching student applied jobs => ", error);
    return res.status(500).json({ msg: 'Server error' });
  }
};




export {
  AllJobs,
  DeleteJob,
  JobData,
  JobWithApplicants,
  StudentJobsApplied
};
