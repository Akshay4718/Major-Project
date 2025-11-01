import JobSchema from '../../models/job.model.js';

const PostJob = async (req, res) => {
  try {
    const company = req.body.company;
    const jobTitle = req.body.jobTitle;
    const jobDescription = req.body.jobDescription;
    const eligibility = req.body.eligibility;
    const salary = req.body.salary;
    const howToApply = req.body.howToApply;
    const applicationDeadline = req.body.applicationDeadline;
    
    // New placement policy fields
    const jobCategory = req.body.jobCategory;
    const isInternship = req.body.isInternship || false;
    const hasConversionOption = req.body.hasConversionOption || false;
    
    // Eligibility criteria fields
    const eligibilityCriteria = req.body.eligibilityCriteria;
    
    // Eligible branches
    const eligibleBranches = req.body.eligibleBranches || [];

    console.log('📋 Creating/Updating job with category:', jobCategory);
    console.log('🎓 Eligible branches:', eligibleBranches);

    if (!jobTitle || !jobDescription || !eligibility || !company) {
      return res.status(400).json({ msg: 'Job title, job description, eligibility and company name are required.' });
    }
    
    if (!jobCategory) {
      return res.status(400).json({ msg: 'Job category is required for placement policy.' });
    }
    
    if (!eligibleBranches || eligibleBranches.length === 0) {
      return res.status(400).json({ msg: 'Please select at least one eligible branch.' });
    }

    const job = await JobSchema.findById(req.body._id);

    if (job) {
      await job.updateOne({
        company,
        jobTitle,
        jobDescription,
        eligibility,
        salary,
        howToApply,
        applicationDeadline,
        jobCategory,
        isInternship,
        hasConversionOption,
        eligibilityCriteria,
        eligibleBranches
      });
      console.log('✅ Job updated with category:', jobCategory);
      console.log('✅ Eligible branches:', eligibleBranches);
      res.status(201).json({ msg: 'Job Updated successfully' });
    } else {
      // Create a new job object
      const newJob = new JobSchema({
        jobTitle,
        jobDescription,
        eligibility,
        salary,
        howToApply,
        postedAt: new Date(),
        applicationDeadline,
        company,
        jobCategory,
        isInternship,
        hasConversionOption,
        eligibilityCriteria,
        eligibleBranches
      });
      await newJob.save();
      console.log('✅ Job created with category:', jobCategory);
      console.log('✅ Eligible branches:', eligibleBranches);
      return res.status(201).json({ msg: 'Job posted successfully' });
    }

  } catch (error) {
    console.log("tpo.post-job.controller.js => ", error);
    return res.status(500).json({ msg: 'Server error', error: error });
  }
}

export default PostJob;
