import User from '../../models/user.model.js';
import JobSchema from '../../models/job.model.js';
import sendMail from '../../config/Nodemailer.js';


const UpdateJobStatus = async (req, res) => {
  try {
    const job = await JobSchema.findById(req.params.jobId).populate('company');
    const student = await User.findById(req.params.studentId)

    if (!job || !student) return res.json({ msg: "Student or Job Not Found!" })

    const newStatus = req.body.applicant.applicationStatus;
    let statusChanged = false;
    let oldStatus = null;

    job.applicants.find(app => {
      if (app.studentId == req.params.studentId) {
        // Check if status is changing
        if (newStatus && app.applicationStatus !== newStatus) {
          oldStatus = app.applicationStatus;
          statusChanged = true;
          console.log(`🔄 Status changing: ${oldStatus} → ${newStatus} for ${student.first_name} ${student.last_name}`);
        }
        
        if (req.body.applicant.currentRound) app.currentRound = req.body.applicant.currentRound;
        if (req.body.applicant.roundStatus) app.roundStatus = req.body.applicant.roundStatus;
        if (req.body.applicant.selectionDate) app.selectionDate = req.body.applicant.selectionDate;
        if (req.body.applicant.joiningDate) app.joiningDate = req.body.applicant.joiningDate;
        if (req.body.applicant.offerLetter) app.offerLetter = req.body.applicant.offerLetter;
        if (req.body.applicant.status) app.status = req.body.applicant.status;
        if (req.body.applicant.applicationStatus) {
          app.applicationStatus = req.body.applicant.applicationStatus;
          app.status = req.body.applicant.applicationStatus; // Keep both in sync
          
          // Update timestamp based on status
          if (newStatus === 'shortlisted') app.shortlistedAt = new Date();
          if (newStatus === 'placed') app.placedAt = new Date();
          if (newStatus === 'rejected') app.rejectedAt = new Date();
        }
      }
    });

    student?.studentProfile?.appliedJobs?.find(app => {
      if (app.jobId == req.params.jobId) {
        if (req.body.applicant.status) app.status = req.body.applicant.status;
        if (req.body.applicant.applicationStatus) {
          app.applicationStatus = req.body.applicant.applicationStatus;
          app.status = req.body.applicant.applicationStatus; // Keep both in sync
        }
        if (req.body.applicant.package) app.package = req.body.applicant.package;
      }
    })

    await student.save();
    await job.save();

    // Send email notification if status changed
    if (statusChanged && newStatus) {
      try {
        console.log(`📧 Preparing email for ${newStatus} status...`);
        const emailSubject = getEmailSubject(newStatus, job);
        const emailBody = getEmailBody(newStatus, student, job);
        
        console.log(`📧 Sending email to: ${student.email}`);
        console.log(`📧 Subject: ${emailSubject}`);
        
        await sendMail(student.email, emailSubject, emailBody);
        console.log(`✉️  ✅ Email successfully sent to ${student.email} for status: ${newStatus}`);
      } catch (emailError) {
        console.error(`❌ Error sending status update email to ${student.email}:`, emailError);
        console.error('Email error details:', emailError.message);
        // Don't fail the request if email fails
      }
    } else {
      if (!statusChanged) {
        console.log(`ℹ️  No status change detected for ${student.first_name} ${student.last_name}`);
      }
    }

    return res.json({ msg: "Job Status Updated Successfully!" });
  } catch (error) {
    console.log("update-job-status.controller.js => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
}

// Helper function to generate email subject
const getEmailSubject = (status, job) => {
  const statusMessages = {
    'shortlisted': `🎉 You've been Shortlisted for ${job.jobTitle}`,
    'in-process': `📋 Your Application is In Process - ${job.jobTitle}`,
    'placed': `🎊 Congratulations! You've been Placed at ${job.company.companyName}`,
    'rejected': `Application Update - ${job.jobTitle}`
  };
  return statusMessages[status] || `Application Status Update - ${job.jobTitle}`;
};

// Helper function to generate email body
const getEmailBody = (status, student, job) => {
  const commonHeader = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0;">${job.jobTitle}</h3>
        <p style="margin: 5px 0;"><strong>Company:</strong> ${job.company.companyName}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${job.company.companyLocation || 'N/A'}</p>
      </div>
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #374151; margin-top: 0;">Dear ${student.first_name},</h4>
  `;

  const commonFooter = `
      </div>
      <div style="border-top: 1px solid #e0e0e0; margin-top: 20px; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p>This is an automated notification from the College Placement Management System.</p>
        <p>If you have any questions, please contact the TPO office.</p>
      </div>
    </div>
  `;

  const statusContent = {
    'shortlisted': `
      <h2 style="color: #4F46E5; text-align: center;">🎉 Congratulations! You've Been Shortlisted!</h2>
      <p style="color: #6b7280; line-height: 1.6;">
        We are pleased to inform you that you have been shortlisted for the position of <strong>${job.jobTitle}</strong> at <strong>${job.company.companyName}</strong>.
      </p>
      <p style="color: #6b7280; line-height: 1.6;">
        The TPO will contact you shortly with further details about the next steps in the recruitment process.
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/dashboard" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
          View Dashboard
        </a>
      </div>
    `,
    'in-process': `
      <h2 style="color: #4F46E5; text-align: center;">📋 Your Application is In Process</h2>
      <p style="color: #6b7280; line-height: 1.6;">
        Your application for <strong>${job.jobTitle}</strong> at <strong>${job.company.companyName}</strong> is currently being processed.
      </p>
      <p style="color: #6b7280; line-height: 1.6;">
        You are progressing through the recruitment stages. Please stay available and check your email regularly for updates about interview schedules or next steps.
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/dashboard" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
          View Dashboard
        </a>
      </div>
    `,
    'placed': `
      <h2 style="color: #4F46E5; text-align: center;">🎊 Congratulations! You've Been Placed!</h2>
      <p style="color: #6b7280; line-height: 1.6;">
        <strong>Congratulations!</strong> We are thrilled to inform you that you have been successfully placed at <strong>${job.company.companyName}</strong> for the position of <strong>${job.jobTitle}</strong>!
      </p>
      <p style="color: #6b7280; line-height: 1.6;">
        This is a significant achievement and marks the beginning of an exciting professional journey. The TPO office will contact you soon with details about the offer letter, joining date, and other formalities.
      </p>
      <p style="color: #6b7280; line-height: 1.6;">
        <strong>Package:</strong> ₹${job.salary} LPA
      </p>
      <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #065f46;">
          <strong>Next Steps:</strong> Please check your email regularly for communication from the TPO office and the company regarding joining formalities.
        </p>
      </div>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/dashboard" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
          View Dashboard
        </a>
      </div>
    `,
    'rejected': `
      <h2 style="color: #4F46E5; text-align: center;">Application Status Update</h2>
      <p style="color: #6b7280; line-height: 1.6;">
        Thank you for your interest in the position of <strong>${job.jobTitle}</strong> at <strong>${job.company.companyName}</strong>.
      </p>
      <p style="color: #6b7280; line-height: 1.6;">
        After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.
      </p>
      <p style="color: #6b7280; line-height: 1.6;">
        We encourage you to continue applying for other opportunities on the placement portal. Remember, this is just one opportunity, and there are many more ahead!
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/job-listings" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
          View More Jobs
        </a>
      </div>
    `
  };

  return commonHeader + (statusContent[status] || '') + commonFooter;
};


export {
  UpdateJobStatus
};
