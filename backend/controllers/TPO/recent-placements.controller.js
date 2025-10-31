import Job from '../../models/job.model.js';

// Get recent placements (finished within last 24 hours)
export const getRecentPlacements = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find jobs finished in last 24 hours
    const recentJobs = await Job.find({
      driveFinished: true,
      driveFinishedAt: { $gte: twentyFourHoursAgo }
    })
      .populate('company', 'companyName companyLocation')
      .populate('applicants.studentId', 'first_name last_name USN department email')
      .sort({ driveFinishedAt: -1 });

    // Extract placed students from each job
    const placementUpdates = [];
    
    for (const job of recentJobs) {
      const placedStudents = job.applicants.filter(a => a.applicationStatus === 'placed');
      
      if (placedStudents.length > 0) {
        placementUpdates.push({
          jobId: job._id,
          jobTitle: job.jobTitle,
          company: {
            name: job.company.companyName,
            location: job.company.companyLocation
          },
          salary: job.salary,
          driveFinishedAt: job.driveFinishedAt,
          placedStudents: placedStudents.map(ps => ({
            studentId: ps.studentId._id,
            name: `${ps.studentId.first_name} ${ps.studentId.last_name}`,
            usn: ps.studentId.USN,
            department: ps.studentId.department,
            email: ps.studentId.email,
            placedAt: ps.placedAt
          })),
          placedCount: placedStudents.length
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: placementUpdates.length,
      placements: placementUpdates
    });
  } catch (error) {
    console.error('Error fetching recent placements:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent placements'
    });
  }
};
