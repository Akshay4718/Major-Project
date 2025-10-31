import User from '../../models/user.model.js';
import jobSchema from '../../models/job.model.js';
import sendMail from '../../config/Nodemailer.js';

const notifyEligibleStudents = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await jobSchema.findById(jobId).populate('company').populate('applicants.studentId');
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Get only students who have APPLIED to this job with "applied" status
    const appliedStudents = job.applicants.filter(a => a.applicationStatus === 'applied');
    
    if (!appliedStudents || appliedStudents.length === 0) {
      return res.status(200).json({ 
        msg: 'No students with "applied" status found for this job',
        eligibleCount: 0,
        totalApplicants: job.applicants.length
      });
    }

    console.log(`\n=== AUTO-SHORTLIST FOR JOB: ${job.jobTitle} ===`);
    console.log(`Total applicants: ${job.applicants.length}`);
    console.log(`Students with "applied" status: ${appliedStudents.length}`);
    console.log(`Eligibility Criteria:`, job.eligibilityCriteria);

    // Filter eligible students from those who applied, based on criteria
    const eligibleStudents = appliedStudents.filter(applicant => {
      const student = applicant.studentId;
      const profile = student.studentProfile;
      const criteria = job.eligibilityCriteria;

      const studentName = `${student.first_name} ${student.last_name}`;
      console.log(`\nChecking: ${studentName}`);

      // If no criteria set, all students are eligible
      if (!criteria || (!criteria.sslcPercentage && !criteria.pucPercentage && !criteria.degreeCgpa)) {
        console.log(`  ✓ No criteria set - eligible by default`);
        return true;
      }

      // Check SSLC
      if (criteria.sslcPercentage) {
        const studentSslc = profile?.pastQualification?.sslc?.percentage || 0;
        console.log(`  SSLC: ${studentSslc}% (required: ${criteria.sslcPercentage}%)`);
        if (studentSslc < criteria.sslcPercentage) {
          console.log(`  ✗ FAILED - SSLC too low`);
          return false;
        }
      }

      // Check PUC
      if (criteria.pucPercentage) {
        const studentPuc = profile?.pastQualification?.puc?.percentage || 0;
        console.log(`  PUC: ${studentPuc}% (required: ${criteria.pucPercentage}%)`);
        if (studentPuc < criteria.pucPercentage) {
          console.log(`  ✗ FAILED - PUC too low`);
          return false;
        }
      }

      // Check CGPA
      if (criteria.degreeCgpa) {
        const sgpaValues = [
          profile?.SGPA?.sem1, profile?.SGPA?.sem2, profile?.SGPA?.sem3, profile?.SGPA?.sem4,
          profile?.SGPA?.sem5, profile?.SGPA?.sem6, profile?.SGPA?.sem7, profile?.SGPA?.sem8
        ].filter(sgpa => sgpa !== null && sgpa !== undefined && sgpa !== '' && !isNaN(sgpa));
        
        const studentCgpa = sgpaValues.length > 0 
          ? sgpaValues.reduce((sum, sgpa) => sum + parseFloat(sgpa), 0) / sgpaValues.length 
          : 0;
        
        console.log(`  CGPA: ${studentCgpa.toFixed(2)} (required: ${criteria.degreeCgpa})`);
        if (studentCgpa < criteria.degreeCgpa) {
          console.log(`  ✗ FAILED - CGPA too low`);
          return false;
        }
      }

      console.log(`  ✓ PASSED - Student is eligible`);
      return true;
    });

    console.log(`\n📊 Results: ${eligibleStudents.length} of ${appliedStudents.length} students are eligible`);

    if (eligibleStudents.length === 0) {
      return res.status(200).json({ 
        msg: 'No eligible students found based on eligibility criteria. All applied students failed to meet the requirements.',
        eligibleCount: 0,
        totalApplied: appliedStudents.length,
        criteriaChecked: job.eligibilityCriteria
      });
    }

    // Prepare email content
    const eligibilityCriteriaText = job.eligibilityCriteria 
      ? `
        <h3 style="color: #4F46E5;">Eligibility Criteria:</h3>
        <ul>
          ${job.eligibilityCriteria.sslcPercentage ? `<li>SSLC Percentage: ${job.eligibilityCriteria.sslcPercentage}%</li>` : ''}
          ${job.eligibilityCriteria.pucPercentage ? `<li>PUC Percentage: ${job.eligibilityCriteria.pucPercentage}%</li>` : ''}
          ${job.eligibilityCriteria.degreeCgpa ? `<li>Degree CGPA: ${job.eligibilityCriteria.degreeCgpa}</li>` : ''}
        </ul>
      `
      : '';

    // Send emails to all eligible students using sendMail helper
    const emailPromises = eligibleStudents.map(applicant => {
      const student = applicant.studentId;
      const subject = `Congratulations! You've been shortlisted for ${job.jobTitle}`;
      const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #4F46E5; text-align: center;">🎉 Congratulations! You've Been Shortlisted!</h2>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0;">${job.jobTitle}</h3>
              <p style="margin: 5px 0;"><strong>Company:</strong> ${job.company.companyName}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${job.company.companyLocation || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Salary:</strong> ₹${job.salary} LPA</p>
            </div>

            ${eligibilityCriteriaText}

            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #374151; margin-top: 0;">Dear ${student.first_name},</h4>
              <p style="color: #6b7280; line-height: 1.6;">
                Great news! Based on your academic profile, you have been automatically shortlisted for the position of <strong>${job.jobTitle}</strong> at <strong>${job.company.companyName}</strong>.
              </p>
              <p style="color: #6b7280; line-height: 1.6;">
                You met all the eligibility criteria and have been moved to the shortlisted candidates list. The TPO will contact you with further details about the next steps in the recruitment process.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                View Your Dashboard
              </a>
            </div>

            <div style="border-top: 1px solid #e0e0e0; margin-top: 20px; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
              <p>This is an automated notification from the College Placement Management System.</p>
              <p>If you have any questions, please contact the TPO office.</p>
            </div>
          </div>
        `;
      
      return sendMail(student.email, subject, html);
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    // Update status of eligible applicants from "applied" to "shortlisted"
    console.log('\n📝 Updating applicant statuses...');
    
    for (const eligibleApplicant of eligibleStudents) {
      // Find the applicant in the job.applicants array and update
      const applicant = job.applicants.find(
        a => a.studentId._id.toString() === eligibleApplicant.studentId._id.toString()
      );
      
      if (applicant) {
        applicant.applicationStatus = 'shortlisted';
        applicant.shortlistedAt = new Date();
        console.log(`  ✓ ${eligibleApplicant.studentId.first_name} ${eligibleApplicant.studentId.last_name} → shortlisted`);
      }
    }
    
    // Save updated job
    await job.save();

    console.log(`\n✅ Auto-shortlist complete!`);
    console.log(`   Shortlisted: ${eligibleStudents.length} students`);
    console.log(`   Emails sent: ${eligibleStudents.length}`);

    return res.status(200).json({ 
      msg: `Successfully shortlisted ${eligibleStudents.length} eligible student(s) and sent email notifications`,
      eligibleCount: eligibleStudents.length,
      totalApplied: appliedStudents.length,
      eligibleEmails: eligibleStudents.map(a => a.studentId.email),
      autoShortlisted: true
    });

  } catch (error) {
    console.log("notify-eligible-students.controller.js => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

export { notifyEligibleStudents };
