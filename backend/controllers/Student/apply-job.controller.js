import User from '../../models/user.model.js';
import jobSchema from '../../models/job.model.js';
import { checkPlacementEligibility } from '../../helpers/placementPolicy.js';


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

    const successMessage = applicationStatus === 'shortlisted' 
      ? "Applied Successfully! You have been automatically shortlisted based on eligibility criteria." 
      : "Applied Successfully!";

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
