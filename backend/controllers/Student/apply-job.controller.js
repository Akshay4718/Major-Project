import User from '../../models/user.model.js';
import jobSchema from '../../models/job.model.js';
import { checkPlacementEligibility } from '../../helpers/placementPolicy.js';
import sendMail from '../../config/Nodemailer.js';
import Company from '../../models/company.model.js';


const AppliedToJob = async (req, res) => {
  try {
    // console.log(req.params);
    // if studentId is not defined return
    if (req.params.studentId === "undefined") return;
    if (req.params.jobId === "undefined") return;

    const user = await User.findById(req.params.studentId);
    const job = await jobSchema.findById(req.params.jobId);

    // Check if job exists
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if application deadline has passed
    if (job.applicationDeadline) {
      const currentDate = new Date();
      const deadline = new Date(job.applicationDeadline);
      
      if (currentDate > deadline) {
        return res.status(400).json({ 
          msg: `Application deadline has passed. The deadline was ${deadline.toLocaleString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}` 
        });
      }
    }

    // retune if already applied
    if (user?.studentProfile?.appliedJobs?.some(job => job.jobId == req.params.jobId)) return res.json({ msg: "Already Applied!" });

    // Check Branch Eligibility
    console.log("\n🎓 === BRANCH ELIGIBILITY CHECK START ===");
    const studentBranch = user?.studentProfile?.department;
    console.log("Student Branch:", studentBranch);
    console.log("Job Eligible Branches:", job.eligibleBranches);
    
    if (job.eligibleBranches && job.eligibleBranches.length > 0) {
      if (!job.eligibleBranches.includes(studentBranch)) {
        console.log("❌ Branch NOT eligible");
        console.log("🎓 === BRANCH ELIGIBILITY CHECK END ===\n");
        return res.status(403).json({ 
          msg: `This job is only open for ${job.eligibleBranches.join(', ')} branches. Your branch (${studentBranch}) is not eligible.`,
          eligibleBranches: job.eligibleBranches,
          studentBranch: studentBranch
        });
      }
    }
    console.log("✅ Branch eligible");
    console.log("🎓 === BRANCH ELIGIBILITY CHECK END ===\n");

    // Check Placement Policy Eligibility (Ladder Policy)
    console.log("\n🎯 === PLACEMENT POLICY CHECK START ===");
    const policyCheck = await checkPlacementEligibility(req.params.studentId, req.params.jobId);
    console.log("Policy Check Result:", policyCheck);
    
    if (!policyCheck.eligible) {
      console.log("❌ Policy check FAILED:", policyCheck.reason);
      return res.status(403).json({ 
        msg: policyCheck.reason,
        currentPlacements: policyCheck.currentPlacements,
        allowedCategories: policyCheck.allowedCategories
      });
    }
    console.log("✅ Policy check PASSED");
    console.log("🎯 === PLACEMENT POLICY CHECK END ===\n");

    if (!user?.studentProfile?.resume) return res.json({ msg: 'Please Upload Resume First, Under "Placements" > "Placement Profile"' });

    // Check eligibility criteria if set and determine auto-shortlist
    let isEligible = true;
    let applicationStatus = 'applied';
    
    console.log("\n=== AUTO-SHORTLIST DEBUG START ===");
    console.log("Job ID:", req.params.jobId);
    console.log("Student ID:", req.params.studentId);
    console.log("Job has eligibilityCriteria?", !!job?.eligibilityCriteria);
    
    if (job?.eligibilityCriteria) {
      const criteria = job.eligibilityCriteria;
      const profile = user.studentProfile;
      
      console.log("Job eligibility criteria:", JSON.stringify(criteria));
      console.log("Student SSLC:", profile?.pastQualification?.sslc?.percentage);
      console.log("Student PUC:", profile?.pastQualification?.puc?.percentage);
      console.log("Student SGPA:", JSON.stringify(profile?.SGPA));
      
      // Check SSLC percentage
      if (criteria.sslcPercentage) {
        const studentSslc = profile?.pastQualification?.sslc?.percentage || 0;
        console.log(`Checking SSLC: ${studentSslc} >= ${criteria.sslcPercentage}?`, studentSslc >= criteria.sslcPercentage);
        if (studentSslc < criteria.sslcPercentage) {
          console.log("❌ SSLC check FAILED");
          return res.status(400).json({ 
            msg: `You don't meet the SSLC eligibility criteria. Required: ${criteria.sslcPercentage}%, Your: ${studentSslc}%` 
          });
        }
        console.log("✅ SSLC check PASSED");
      }
      
      // Check PUC percentage
      if (criteria.pucPercentage) {
        const studentPuc = profile?.pastQualification?.puc?.percentage || 0;
        console.log(`Checking PUC: ${studentPuc} >= ${criteria.pucPercentage}?`, studentPuc >= criteria.pucPercentage);
        if (studentPuc < criteria.pucPercentage) {
          console.log("❌ PUC check FAILED");
          return res.status(400).json({ 
            msg: `You don't meet the PUC eligibility criteria. Required: ${criteria.pucPercentage}%, Your: ${studentPuc}%` 
          });
        }
        console.log("✅ PUC check PASSED");
      }
      
      // Check Degree CGPA
      if (criteria.degreeCgpa) {
        // Calculate CGPA from SGPA
        const sgpaValues = [
          profile?.SGPA?.sem1, profile?.SGPA?.sem2, profile?.SGPA?.sem3, profile?.SGPA?.sem4,
          profile?.SGPA?.sem5, profile?.SGPA?.sem6, profile?.SGPA?.sem7, profile?.SGPA?.sem8
        ].filter(sgpa => sgpa !== null && sgpa !== undefined && sgpa !== '' && !isNaN(sgpa));
        
        const studentCgpa = sgpaValues.length > 0 
          ? sgpaValues.reduce((sum, sgpa) => sum + parseFloat(sgpa), 0) / sgpaValues.length 
          : 0;
        
        console.log(`SGPA values found: ${sgpaValues.length} semesters`);
        console.log(`Calculated CGPA: ${studentCgpa.toFixed(2)}`);
        console.log(`Checking CGPA: ${studentCgpa.toFixed(2)} >= ${criteria.degreeCgpa}?`, studentCgpa >= criteria.degreeCgpa);
        
        if (studentCgpa < criteria.degreeCgpa) {
          console.log("❌ CGPA check FAILED");
          return res.status(400).json({ 
            msg: `You don't meet the Degree CGPA eligibility criteria. Required: ${criteria.degreeCgpa}, Your: ${studentCgpa.toFixed(2)}` 
          });
        }
        console.log("✅ CGPA check PASSED");
      }
      
      // If all criteria passed and criteria exists, auto-shortlist
      if (criteria.sslcPercentage || criteria.pucPercentage || criteria.degreeCgpa) {
        applicationStatus = 'shortlisted';
        console.log("✅ All criteria passed! Auto-shortlisting student");
      }
      
      console.log("Final application status:", applicationStatus);
      console.log("=== END DEBUG ===\n");
    } else {
      console.log("⚠️  Job has NO eligibility criteria - status will be 'applied'");
      console.log("=== END DEBUG ===\n");
    }

    // Add to user's applied jobs with appropriate status
    user?.studentProfile?.appliedJobs?.push({ 
      jobId: req.params.jobId, 
      applicationStatus: applicationStatus 
    });
    
    // Add to job applicants with status and timestamp
    const applicantData = { 
      studentId: user._id,
      applicationStatus: applicationStatus,
      appliedAt: new Date()
    };
    
    // Add shortlistedAt timestamp if auto-shortlisted
    if (applicationStatus === 'shortlisted') {
      applicantData.shortlistedAt = new Date();
    }
    
    job?.applicants?.push(applicantData);
    await user.save();
    await job.save();

    // Send email notification
    try {
      const company = await Company.findById(job.company);
      const companyName = company?.companyName || 'the company';
      const studentName = `${user.first_name} ${user.last_name}`.trim() || user.email;
      const studentEmail = user.email;

      let emailSubject, emailContent;

      if (applicationStatus === 'shortlisted') {
        emailSubject = `🎉 You've been Shortlisted - ${job.jobTitle} at ${companyName}`;
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">You've been Shortlisted!</h2>
              
              <p style="color: #555; font-size: 16px; line-height: 1.6;">Dear ${studentName},</p>
              
              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Great news! Your application for <strong>${job.jobTitle}</strong> at <strong>${companyName}</strong> 
                has been <strong style="color: #10b981;">automatically shortlisted</strong> based on your excellent academic credentials!
              </p>

              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #059669; font-weight: bold;">✅ Auto-Shortlisted!</p>
                <p style="margin: 5px 0 0 0; color: #065f46; font-size: 14px;">
                  You met all the eligibility criteria and have been moved directly to the shortlist.
                </p>
              </div>

              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0; font-size: 18px;">📋 Job Details</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 40%;"><strong>Position:</strong></td>
                    <td style="padding: 8px 0; color: #333;">${job.jobTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Company:</strong></td>
                    <td style="padding: 8px 0; color: #333;">${companyName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Salary:</strong></td>
                    <td style="padding: 8px 0; color: #333;">₹${job.salary ? job.salary.toLocaleString() : 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
                    <td style="padding: 8px 0; color: #10b981; font-weight: bold;">Shortlisted ✓</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>⏰ Next Steps:</strong><br>
                  The TPO will contact you soon with details about the interview process. 
                  Keep checking your email and the placement portal for updates.
                </p>
              </div>

              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Best of luck with your interview!
              </p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0;">This is an automated notification from CPMS</p>
              </div>
            </div>
          </div>
        `;
      } else {
        emailSubject = `Application Received - ${job.jobTitle} at ${companyName}`;
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✅ Application Received</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Thank You for Applying!</h2>
              
              <p style="color: #555; font-size: 16px; line-height: 1.6;">Dear ${studentName},</p>
              
              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Your application for <strong>${job.jobTitle}</strong> at <strong>${companyName}</strong> 
                has been successfully received.
              </p>

              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0; font-size: 18px;">📋 Job Details</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 40%;"><strong>Position:</strong></td>
                    <td style="padding: 8px 0; color: #333;">${job.jobTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Company:</strong></td>
                    <td style="padding: 8px 0; color: #333;">${companyName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Salary:</strong></td>
                    <td style="padding: 8px 0; color: #333;">₹${job.salary ? job.salary.toLocaleString() : 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
                    <td style="padding: 8px 0; color: #3b82f6; font-weight: bold;">Applied ✓</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
                  <strong>⏰ What's Next:</strong><br>
                  The TPO will review your application and update you about the selection process. 
                  You'll receive an email notification if you are shortlisted.
                </p>
              </div>

              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Best wishes for your application!
              </p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0;">This is an automated notification from CPMS</p>
              </div>
            </div>
          </div>
        `;
      }

      await sendMail(studentEmail, emailSubject, emailContent);
      console.log(`✅ Email sent to ${studentEmail} - Status: ${applicationStatus}`);
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
      // Don't fail the application if email fails
    }

    const successMessage = applicationStatus === 'shortlisted' 
      ? "Applied Successfully! You have been automatically shortlisted based on eligibility criteria. Check your email for details!" 
      : "Applied Successfully! You will receive an email notification if you are shortlisted.";

    return res.status(201).json({ msg: successMessage, autoShortlisted: applicationStatus === 'shortlisted' });
  } catch (error) {
    console.log("apply-job.controller.js => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
}

const CheckAlreadyApplied = async (req, res) => {
  try {
    // if studentId is not defined return
    if (req.params.studentId === "undefined") return;
    if (req.params.jobId === "undefined") return;

    const user = await User.findById(req.params.studentId);

    // retune if already applied
    if (user?.studentProfile?.appliedJobs?.some(job => job.jobId == req.params.jobId)) return res.json({ applied: true });
    else return res.json({ applied: false });

  } catch (error) {
    console.log("apply-job.controller.js => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
}

export {
  AppliedToJob,
  CheckAlreadyApplied
};
