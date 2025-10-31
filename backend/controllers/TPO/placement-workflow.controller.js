import Job from '../../models/job.model.js';
import Users from '../../models/user.model.js';
import sendMail from '../../config/Nodemailer.js';
import ExcelJS from 'exceljs';

// Step 1: Export applicants list to Excel
export const exportApplicantsToExcel = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.query; // Get status filter from query parameter
    
    const job = await Job.findById(jobId)
      .populate('company', 'companyName companyLocation')
      .populate('applicants.studentId', 'first_name last_name email studentProfile');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Filter applicants by status if provided
    let applicantsToExport = job.applicants;
    if (status && status !== 'all') {
      applicantsToExport = job.applicants.filter(a => a.applicationStatus === status);
      console.log(`📊 Exporting ${applicantsToExport.length} applicants with status: ${status}`);
    } else {
      console.log(`📊 Exporting all ${applicantsToExport.length} applicants`);
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const statusLabel = status && status !== 'all' ? status.charAt(0).toUpperCase() + status.slice(1) : 'All';
    const worksheet = workbook.addWorksheet(`${statusLabel} Applicants`);

    // Define columns
    worksheet.columns = [
      { header: 'S.No', key: 'sno', width: 8 },
      { header: 'USN', key: 'usn', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Department', key: 'department', width: 12 },
      { header: 'Year', key: 'year', width: 8 },
      { header: 'CGPA', key: 'cgpa', width: 10 },
      { header: 'SSLC %', key: 'sslc', width: 10 },
      { header: 'PUC %', key: 'puc', width: 10 },
      { header: 'Active Backlogs', key: 'backlogs', width: 15 },
      { header: 'Resume Link', key: 'resume', width: 50 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Calculate CGPA
    const calculateCGPA = (sgpa) => {
      if (!sgpa) return 'N/A';
      const semesters = Object.values(sgpa).filter(val => val && val > 0);
      if (semesters.length === 0) return 'N/A';
      const total = semesters.reduce((sum, val) => sum + val, 0);
      return (total / semesters.length).toFixed(2);
    };

    // Add data rows
    applicantsToExport.forEach((applicant, index) => {
      const student = applicant.studentId;
      if (student) {
        const profile = student.studentProfile || {};
        const rowData = {
          sno: index + 1,
          usn: profile.USN || 'N/A',
          name: `${student.first_name} ${student.last_name || ''}`.trim(),
          email: student.email,
          department: profile.department || 'N/A',
          year: profile.year || 'N/A',
          cgpa: calculateCGPA(profile.SGPA),
          sslc: profile.pastQualification?.sslc?.percentage || 'N/A',
          puc: profile.pastQualification?.puc?.percentage || 'N/A',
          backlogs: profile.activeBacklog || 0,
          resume: profile.resume || 'N/A',
          status: applicant.applicationStatus || 'applied'
        };
        
        const row = worksheet.addRow(rowData);
        
        // Make resume link clickable if it exists
        if (profile.resume && profile.resume !== 'N/A') {
          const resumeCell = row.getCell('resume');
          resumeCell.value = {
            text: 'View Resume',
            hyperlink: profile.resume
          };
          resumeCell.font = { color: { argb: 'FF0000FF' }, underline: true };
        }
      }
    });

    // Update job export status
    job.applicantsExported = true;
    job.exportedAt = new Date();
    await job.save();

    // Set response headers with status in filename
    const filename = status && status !== 'all' 
      ? `${statusLabel}_Students_${job.jobTitle.replace(/\s+/g, '_')}_${Date.now()}.xlsx`
      : `All_Applicants_${job.jobTitle.replace(/\s+/g, '_')}_${Date.now()}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ success: false, message: 'Failed to export applicants' });
  }
};

// Step 2: Mark shortlisted students
export const markShortlistedStudents = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { shortlistedStudentIds, rejectedStudentIds } = req.body;

    const job = await Job.findById(jobId).populate('applicants.studentId', 'email first_name last_name');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const updatedApplicants = [];

    // Mark shortlisted students
    for (const studentId of shortlistedStudentIds || []) {
      const applicant = job.applicants.find(a => a.studentId._id.toString() === studentId);
      if (applicant) {
        applicant.applicationStatus = 'shortlisted';
        applicant.shortlistedAt = new Date();
        updatedApplicants.push({
          student: applicant.studentId,
          status: 'shortlisted'
        });

        // Update user model
        await Users.updateOne(
          { _id: studentId, 'studentProfile.appliedJobs.jobId': jobId },
          { $set: { 'studentProfile.appliedJobs.$.applicationStatus': 'shortlisted' } }
        );
      }
    }

    // Mark rejected students
    for (const studentId of rejectedStudentIds || []) {
      const applicant = job.applicants.find(a => a.studentId._id.toString() === studentId);
      if (applicant) {
        applicant.applicationStatus = 'rejected';
        applicant.rejectedAt = new Date();
        updatedApplicants.push({
          student: applicant.studentId,
          status: 'rejected'
        });

        // Update user model
        await Users.updateOne(
          { _id: studentId, 'studentProfile.appliedJobs.jobId': jobId },
          { $set: { 'studentProfile.appliedJobs.$.applicationStatus': 'rejected' } }
        );
      }
    }

    job.shortlistReceived = true;
    job.shortlistReceivedAt = new Date();
    job.placementStage = 'interviewing';
    await job.save();

    // Populate company details for emails
    await job.populate('company', 'companyName companyLocation');

    // Send emails to ALL updated applicants (shortlisted AND rejected)
    const emailPromises = updatedApplicants.map(async (item) => {
      let subject, html;
      
      if (item.status === 'shortlisted') {
        subject = `🎉 You've been Shortlisted for ${job.jobTitle}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #10B981; text-align: center;">Congratulations! You've been Shortlisted</h2>
            <p>Dear ${item.student.first_name},</p>
            <p>We are pleased to inform you that you have been <strong>shortlisted</strong> for the position of <strong>${job.jobTitle}</strong> at <strong>${job.company?.companyName || 'the company'}</strong>.</p>
            <p>The interview process will begin soon. Please check your dashboard regularly for updates and further instructions.</p>
            <p style="margin-top: 20px;">Best wishes,<br><strong>CPMS Team</strong></p>
          </div>
        `;
      } else if (item.status === 'rejected') {
        subject = `Application Update - ${job.jobTitle}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #4F46E5; text-align: center;">Application Status Update</h2>
            <p>Dear ${item.student.first_name},</p>
            <p>Thank you for your interest in the position of <strong>${job.jobTitle}</strong> at <strong>${job.company?.companyName || 'the company'}</strong>.</p>
            <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
            <p>We encourage you to continue applying for other opportunities on the placement portal. Remember, this is just one opportunity, and there are many more ahead!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/student/jobs" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View More Jobs</a>
            </div>
            <p style="margin-top: 20px;">Best regards,<br><strong>CPMS Team</strong></p>
          </div>
        `;
      }
      
      if (subject && html) {
        try {
          await sendMail(item.student.email, subject, html);
          console.log(`✉️  ✅ Email sent to ${item.student.email} for status: ${item.status}`);
        } catch (error) {
          console.error(`❌ Failed to send email to ${item.student.email}:`, error.message);
        }
      }
    });

    await Promise.all(emailPromises);

    res.json({
      success: true,
      message: `${shortlistedStudentIds?.length || 0} students shortlisted, ${rejectedStudentIds?.length || 0} rejected`,
      updatedCount: updatedApplicants.length
    });
  } catch (error) {
    console.error('Error marking shortlisted students:', error);
    res.status(500).json({ success: false, message: 'Failed to update shortlist' });
  }
};

// Step 3: Update interview round status
export const updateInterviewRound = async (req, res) => {
  try {
    const { jobId, studentId } = req.params;
    const { roundName, roundDate, status, remarks } = req.body;

    const job = await Job.findById(jobId).populate('applicants.studentId', 'email first_name last_name');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const applicant = job.applicants.find(a => a.studentId._id.toString() === studentId);

    if (!applicant) {
      return res.status(404).json({ success: false, message: 'Applicant not found' });
    }

    // Add or update round
    const existingRoundIndex = applicant.interviewRounds.findIndex(r => r.roundName === roundName);
    
    if (existingRoundIndex >= 0) {
      applicant.interviewRounds[existingRoundIndex] = {
        ...applicant.interviewRounds[existingRoundIndex].toObject(),
        roundDate,
        status,
        remarks,
        updatedAt: new Date()
      };
    } else {
      applicant.interviewRounds.push({
        roundName,
        roundDate,
        status,
        remarks,
        updatedAt: new Date()
      });
    }

    applicant.currentRound = roundName;
    applicant.applicationStatus = 'in-process';

    // Update user model
    await Users.updateOne(
      { _id: studentId, 'studentProfile.appliedJobs.jobId': jobId },
      { 
        $set: { 
          'studentProfile.appliedJobs.$.applicationStatus': 'in-process',
          'studentProfile.appliedJobs.$.currentRound': roundName
        } 
      }
    );

    await job.save();

    res.json({
      success: true,
      message: 'Interview round updated successfully',
      applicant
    });
  } catch (error) {
    console.error('Error updating interview round:', error);
    res.status(500).json({ success: false, message: 'Failed to update interview round' });
  }
};

// Step 4: Mark students as placed/selected
export const markStudentsAsPlaced = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { placedStudents } = req.body; // [{ studentId, package, joiningDate }]

    const job = await Job.findById(jobId)
      .populate('company', 'companyName companyLocation')
      .populate('applicants.studentId', 'email first_name last_name');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const placedCount = [];

    for (const placementInfo of placedStudents) {
      const applicant = job.applicants.find(
        a => a.studentId._id.toString() === placementInfo.studentId
      );

      if (applicant) {
        applicant.applicationStatus = 'placed';
        applicant.isSelected = true;
        applicant.selectionDate = new Date();
        applicant.package = placementInfo.package;
        applicant.joiningDate = placementInfo.joiningDate;
        applicant.placedAt = new Date();

        // Update user model
        await Users.updateOne(
          { _id: placementInfo.studentId, 'studentProfile.appliedJobs.jobId': jobId },
          { 
            $set: { 
              'studentProfile.appliedJobs.$.applicationStatus': 'placed',
              'studentProfile.appliedJobs.$.package': placementInfo.package,
              'studentProfile.appliedJobs.$.isPlaced': true
            } 
          }
        );

        placedCount.push(applicant);

        // Send congratulations email
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">🎉 Congratulations! You're Placed!</h2>
            <p>Dear ${applicant.studentId.first_name},</p>
            <p>We are delighted to inform you that you have been <strong>selected</strong> for the position of <strong>${job.jobTitle}</strong> at <strong>${job.company.companyName}</strong>!</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Package:</strong> ₹${placementInfo.package} LPA</p>
              <p><strong>Joining Date:</strong> ${placementInfo.joiningDate ? new Date(placementInfo.joiningDate).toLocaleDateString('en-IN') : 'TBD'}</p>
            </div>
            <p>Further details will be shared soon. Congratulations once again!</p>
            <p>Best wishes for your future,<br><strong>CPMS Team</strong></p>
          </div>
        `;

        try {
          await sendMail(
            applicant.studentId.email,
            `🎉 Placement Confirmation: ${job.jobTitle}`,
            html
          );
        } catch (error) {
          console.error(`Failed to send email to ${applicant.studentId.email}`);
        }
      }
    }

    await job.save();

    res.json({
      success: true,
      message: `${placedCount.length} students marked as placed`,
      placedStudents: placedCount
    });
  } catch (error) {
    console.error('Error marking students as placed:', error);
    res.status(500).json({ success: false, message: 'Failed to mark students as placed' });
  }
};

// Get job workflow status
// Finish drive - locks the job and creates placement updates
export const finishDrive = async (req, res) => {
  try {
    const { jobId } = req.params;
    const tpoId = req.user?.userId || req.body.tpoId;
    
    const job = await Job.findById(jobId)
      .populate('company', 'companyName companyLocation')
      .populate('applicants.studentId', 'first_name last_name email USN department');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.driveFinished) {
      return res.status(400).json({ success: false, message: 'Drive already finished' });
    }

    // Mark drive as finished
    job.driveFinished = true;
    job.driveFinishedAt = new Date();
    job.driveFinishedBy = tpoId;
    job.placementStage = 'completed';
    
    await job.save();

    // Get placed students
    const placedStudents = job.applicants.filter(a => a.applicationStatus === 'placed');

    console.log(`✅ Drive finished for job: ${job.jobTitle}`);
    console.log(`   Placed students: ${placedStudents.length}`);

    return res.status(200).json({ 
      success: true,
      message: `Drive finished successfully! ${placedStudents.length} student(s) placed.`,
      placedCount: placedStudents.length,
      job: {
        _id: job._id,
        jobTitle: job.jobTitle,
        company: job.company,
        driveFinished: job.driveFinished,
        driveFinishedAt: job.driveFinishedAt
      }
    });
  } catch (error) {
    console.error('Error finishing drive:', error);
    res.status(500).json({ success: false, message: 'Failed to finish drive' });
  }
};

export const getJobWorkflowStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId)
      .populate('company', 'companyName companyLocation')
      .populate('applicants.studentId', 'first_name last_name email studentProfile');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const stats = {
      total: job.applicants.length,
      applied: job.applicants.filter(a => a.applicationStatus === 'applied').length,
      shortlisted: job.applicants.filter(a => a.applicationStatus === 'shortlisted').length,
      rejected: job.applicants.filter(a => a.applicationStatus === 'rejected').length,
      inProcess: job.applicants.filter(a => a.applicationStatus === 'in-process').length,
      placed: job.applicants.filter(a => a.applicationStatus === 'placed').length
    };

    res.json({
      success: true,
      job: {
        _id: job._id,
        jobTitle: job.jobTitle,
        company: job.company,
        placementStage: job.placementStage,
        applicantsExported: job.applicantsExported,
        exportedAt: job.exportedAt,
        shortlistReceived: job.shortlistReceived,
        shortlistReceivedAt: job.shortlistReceivedAt,
        eligibilityCriteria: job.eligibilityCriteria,
        driveFinished: job.driveFinished,
        driveFinishedAt: job.driveFinishedAt,
        driveFinishedBy: job.driveFinishedBy
      },
      stats,
      applicants: job.applicants
    });
  } catch (error) {
    console.error('Error fetching workflow status:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch workflow status' });
  }
};
