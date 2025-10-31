import User from '../../models/user.model.js';
import Job from '../../models/job.model.js';


const StudentDataYearBranchWise = async (req, res) => {
  try {
    // FIRST YEAR
    const firstYearCSE = await User.find({ role: "student", "studentProfile.department": "CSE", "studentProfile.year": 1 });
    const firstYearISE = await User.find({ role: "student", "studentProfile.department": "ISE", "studentProfile.year": 1 });
    const firstYearAIML = await User.find({ role: "student", "studentProfile.department": "AIML", "studentProfile.year": 1 });
    const firstYearMECH = await User.find({ role: "student", "studentProfile.department": "MECH", "studentProfile.year": 1 });
    const firstYearCIVIL = await User.find({ role: "student", "studentProfile.department": "CIVIL", "studentProfile.year": 1 });
    const firstYearECE = await User.find({ role: "student", "studentProfile.department": "ECE", "studentProfile.year": 1 });
    const firstYearEEE = await User.find({ role: "student", "studentProfile.department": "EEE", "studentProfile.year": 1 });

    // SECOND YEAR
    const secondYearCSE = await User.find({ role: "student", "studentProfile.department": "CSE", "studentProfile.year": 2 });
    const secondYearISE = await User.find({ role: "student", "studentProfile.department": "ISE", "studentProfile.year": 2 });
    const secondYearAIML = await User.find({ role: "student", "studentProfile.department": "AIML", "studentProfile.year": 2 });
    const secondYearMECH = await User.find({ role: "student", "studentProfile.department": "MECH", "studentProfile.year": 2 });
    const secondYearCIVIL = await User.find({ role: "student", "studentProfile.department": "CIVIL", "studentProfile.year": 2 });
    const secondYearECE = await User.find({ role: "student", "studentProfile.department": "ECE", "studentProfile.year": 2 });
    const secondYearEEE = await User.find({ role: "student", "studentProfile.department": "EEE", "studentProfile.year": 2 });

    // THIRD YEAR
    const thirdYearCSE = await User.find({ role: "student", "studentProfile.department": "CSE", "studentProfile.year": 3 });
    const thirdYearISE = await User.find({ role: "student", "studentProfile.department": "ISE", "studentProfile.year": 3 });
    const thirdYearAIML = await User.find({ role: "student", "studentProfile.department": "AIML", "studentProfile.year": 3 });
    const thirdYearMECH = await User.find({ role: "student", "studentProfile.department": "MECH", "studentProfile.year": 3 });
    const thirdYearCIVIL = await User.find({ role: "student", "studentProfile.department": "CIVIL", "studentProfile.year": 3 });
    const thirdYearECE = await User.find({ role: "student", "studentProfile.department": "ECE", "studentProfile.year": 3 });
    const thirdYearEEE = await User.find({ role: "student", "studentProfile.department": "EEE", "studentProfile.year": 3 });

    // FOURTH YEAR
    const fourthYearCSE = await User.find({ role: "student", "studentProfile.department": "CSE", "studentProfile.year": 4 });
    const fourthYearISE = await User.find({ role: "student", "studentProfile.department": "ISE", "studentProfile.year": 4 });
    const fourthYearAIML = await User.find({ role: "student", "studentProfile.department": "AIML", "studentProfile.year": 4 });
    const fourthYearMECH = await User.find({ role: "student", "studentProfile.department": "MECH", "studentProfile.year": 4 });
    const fourthYearCIVIL = await User.find({ role: "student", "studentProfile.department": "CIVIL", "studentProfile.year": 4 });
    const fourthYearECE = await User.find({ role: "student", "studentProfile.department": "ECE", "studentProfile.year": 4 });
    const fourthYearEEE = await User.find({ role: "student", "studentProfile.department": "EEE", "studentProfile.year": 4 });

    return res.json({
      // FIRST YEAR
      firstYearCSE,
      firstYearISE,
      firstYearAIML,
      firstYearMECH,
      firstYearCIVIL,
      firstYearECE,
      firstYearEEE,

      // SECOND YEAR
      secondYearCSE,
      secondYearISE,
      secondYearAIML,
      secondYearMECH,
      secondYearCIVIL,
      secondYearECE,
      secondYearEEE,

      // THIRD YEAR
      thirdYearCSE,
      thirdYearISE,
      thirdYearAIML,
      thirdYearMECH,
      thirdYearCIVIL,
      thirdYearECE,
      thirdYearEEE,

      // FOURTH YEAR
      fourthYearCSE,
      fourthYearISE,
      fourthYearAIML,
      fourthYearMECH,
      fourthYearCIVIL,
      fourthYearECE,
      fourthYearEEE
    });

  } catch (error) {
    console.log("student-data-for-admin.controller.js => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
}

const NotifyStudentStatus = async (req, res) => {
  try {
    const filteredStudents = await User.find({
      role: 'student',
      'studentProfile.appliedJobs.status': { $in: ['interview', 'hired'] }
    })
      .select('_id first_name last_name studentProfile.year studentProfile.department studentProfile.appliedJobs')
      .lean();

    const studentsWithJobDetails = [];

    for (const student of filteredStudents) {
      // Filter applied jobs with status 'interview' or 'hired'
      const appliedJobs = student.studentProfile.appliedJobs.filter(job => ['interview', 'hired'].includes(job.status));

      // Fetch job details for each jobId in the applied jobs
      const jobDetails = await Job.find({
        _id: { $in: appliedJobs.map(job => job.jobId) } // Match the job IDs
      })
        .populate('company', 'companyName')
        .select('company jobTitle _id') // Select company name and job title
        .lean();

      // Map through filtered applied jobs and add the job details (company and title)
      const jobsWithDetails = appliedJobs.map(job => {
        const jobDetail = jobDetails.find(jd => String(jd._id) === String(job.jobId)); // Match jobId
        return {
          status: job.status,
          companyName: jobDetail?.company?.companyName || 'Unknown Company',
          jobId: jobDetail?._id || 'Unknown JobId',
          jobTitle: jobDetail?.jobTitle || 'Unknown Job Title'
        };
      });

      // Push the student info along with only the filtered job details into the final array
      studentsWithJobDetails.push({
        _id: student._id,
        name: `${student.first_name} ${student.last_name}`,
        year: student.studentProfile.year,
        department: student.studentProfile.department,
        jobs: jobsWithDetails // Only the filtered jobs with status 'interview' or 'hired'
      });
    }

    return res.status(200).json({ studentsWithJobDetails });
  } catch (error) {
    console.log("student-data-for-admin.controller.js => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
}


export {
  StudentDataYearBranchWise,
  NotifyStudentStatus
};
