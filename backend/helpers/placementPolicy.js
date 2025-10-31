/**
 * Placement Policy Helper
 * 
 * Implements the Ladder Policy (One Job Policy):
 * - Mass → Can apply to Core, Dream, Open Dream
 * - Core → Can apply to Dream, Open Dream
 * - Dream → Can apply to Open Dream only
 * - Open Dream → Cannot apply to any other jobs
 * 
 * Rules:
 * - Max 2 job offers per student
 * - Exception: Dream internship with conversion allows Mass/Core backup
 */

import Job from '../models/job.model.js';
import User from '../models/user.model.js';

// Job category hierarchy (lower number = lower tier)
const CATEGORY_HIERARCHY = {
  'mass': 1,
  'core': 2,
  'dream': 3,
  'open_dream': 4
};

// Category display names
const CATEGORY_NAMES = {
  'mass': 'Mass',
  'core': 'Core',
  'dream': 'Dream',
  'open_dream': 'Open Dream'
};

/**
 * Check if student can apply to a job based on placement policy
 */
export const checkPlacementEligibility = async (studentId, targetJobId) => {
  try {
    console.log('\n🔍 Checking placement eligibility...');
    console.log('Student ID:', studentId);
    console.log('Target Job ID:', targetJobId);
    
    // Get target job details
    const targetJob = await Job.findById(targetJobId);
    if (!targetJob) {
      return {
        eligible: false,
        reason: 'Job not found'
      };
    }

    console.log('Target Job:', targetJob.jobTitle);
    console.log('Target Job Category:', targetJob.jobCategory);
    
    // Check if target job has category
    if (!targetJob.jobCategory) {
      console.warn('⚠️  Target job missing jobCategory field! Defaulting to eligible.');
      return {
        eligible: true,
        reason: '✅ Job category not set. Application allowed.'
      };
    }

    // Get student details with all applied jobs
    const student = await User.findById(studentId);
    if (!student) {
      return {
        eligible: false,
        reason: 'Student not found'
      };
    }

    // Get all jobs the student has applied to
    const appliedJobIds = student.studentProfile?.appliedJobs?.map(j => j.jobId) || [];
    console.log('Student has applied to', appliedJobIds.length, 'jobs');
    
    // Get full job details for placed/selected jobs
    const placedJobs = await Job.find({
      '_id': { $in: appliedJobIds },
      'applicants': {
        $elemMatch: {
          studentId: studentId,
          applicationStatus: { $in: ['placed'] }  // Only check 'placed' status
        }
      }
    });
    
    console.log('Student has', placedJobs.length, 'placed jobs');
    
    // Log details of placed jobs
    placedJobs.forEach((pJob, index) => {
      console.log(`Placed Job ${index + 1}:`, pJob.jobTitle, 'Category:', pJob.jobCategory || 'NOT SET');
    });

    // Filter out jobs without jobCategory (legacy jobs)
    const validPlacedJobs = placedJobs.filter(j => j.jobCategory);
    console.log('Valid placed jobs (with category):', validPlacedJobs.length);

    // Count current offers
    const offerCount = validPlacedJobs.length;

    // Rule 1: Max 2 offers (with exception)
    if (offerCount >= 2) {
      return {
        eligible: false,
        reason: '❌ You already have 2 job offers. Maximum limit reached.',
        currentPlacements: validPlacedJobs.map(j => ({
          title: j.jobTitle,
          category: CATEGORY_NAMES[j.jobCategory]
        }))
      };
    }

    // If student has no placements, they can apply
    if (offerCount === 0) {
      console.log('✅ No placed jobs with categories. Student can apply to any job.');
      return {
        eligible: true,
        reason: '✅ No current placements. You can apply.',
        currentPlacements: []
      };
    }

    // Rule 2: Check ladder policy for each existing placement
    const targetCategory = targetJob.jobCategory;
    const targetLevel = CATEGORY_HIERARCHY[targetCategory];
    
    console.log('Checking ladder policy...');
    console.log('Target Category:', targetCategory, 'Level:', targetLevel);

    for (const placedJob of validPlacedJobs) {
      const placedCategory = placedJob.jobCategory;
      const placedLevel = CATEGORY_HIERARCHY[placedCategory];
      
      console.log(`Comparing with placed job: ${placedJob.jobTitle}`);
      console.log(`Placed Category: ${placedCategory}, Level: ${placedLevel}`);

      // Check if target job is higher in hierarchy
      if (targetLevel <= placedLevel) {
        console.log(`❌ Target level (${targetLevel}) <= Placed level (${placedLevel})`);
        
        // Exception: Dream internship with conversion allows Mass/Core backup
        if (placedJob.isInternship && 
            placedJob.hasConversionOption && 
            placedCategory === 'dream' &&
            (targetCategory === 'mass' || targetCategory === 'core')) {
          console.log('✅ Exception: Dream internship with conversion, Mass/Core allowed as backup');
          continue;
        }

        console.log('🚫 BLOCKED: Cannot apply to same or lower category');
        return {
          eligible: false,
          reason: `❌ You are already placed in ${CATEGORY_NAMES[placedCategory]}. You can only apply to higher category jobs.`,
          currentPlacements: validPlacedJobs.map(j => ({
            title: j.jobTitle,
            category: CATEGORY_NAMES[j.jobCategory],
            isInternship: j.isInternship
          })),
          allowedCategories: getAllowedCategories(placedCategory)
        };
      } else {
        console.log(`✅ Target level (${targetLevel}) > Placed level (${placedLevel}) - Allowed`);
      }
    }

    // Check if second offer and validate hierarchy
    if (offerCount === 1) {
      const existingCategory = validPlacedJobs[0].jobCategory;
      const allowedCategories = getAllowedCategories(existingCategory);
      
      console.log('Student has 1 placement:', existingCategory);
      console.log('Allowed categories:', allowedCategories);
      
      if (!allowedCategories.includes(targetCategory)) {
        console.log('🚫 Target category not in allowed list');
        return {
          eligible: false,
          reason: `❌ With ${CATEGORY_NAMES[existingCategory]} placement, you can only apply to: ${allowedCategories.map(c => CATEGORY_NAMES[c]).join(', ')}`,
          currentPlacements: validPlacedJobs.map(j => ({
            title: j.jobTitle,
            category: CATEGORY_NAMES[j.jobCategory]
          })),
          allowedCategories
        };
      }
    }

    console.log('✅ All checks passed. Student can apply!');
    return {
      eligible: true,
      reason: `✅ You can apply. Current placement: ${CATEGORY_NAMES[validPlacedJobs[0].jobCategory]}`,
      currentPlacements: validPlacedJobs.map(j => ({
        title: j.jobTitle,
        category: CATEGORY_NAMES[j.jobCategory]
      }))
    };

  } catch (error) {
    console.error('Error checking placement eligibility:', error);
    return {
      eligible: false,
      reason: 'Error checking eligibility. Please try again.',
      error: error.message
    };
  }
};

/**
 * Get allowed categories based on current placement
 */
function getAllowedCategories(currentCategory) {
  const currentLevel = CATEGORY_HIERARCHY[currentCategory];
  
  return Object.keys(CATEGORY_HIERARCHY)
    .filter(cat => CATEGORY_HIERARCHY[cat] > currentLevel);
}

/**
 * Get student's current placement status
 */
export const getStudentPlacementStatus = async (studentId) => {
  try {
    const student = await User.findById(studentId);
    if (!student) {
      return null;
    }

    const appliedJobIds = student.studentProfile?.appliedJobs?.map(j => j.jobId) || [];
    
    const placedJobs = await Job.find({
      '_id': { $in: appliedJobIds },
      'applicants': {
        $elemMatch: {
          studentId: studentId,
          applicationStatus: { $in: ['placed'] }  // Only check 'placed' status
        }
      }
    }).populate('company', 'companyName');

    // Filter out jobs without jobCategory (legacy jobs)
    const validPlacedJobs = placedJobs.filter(j => j.jobCategory);

    return {
      offerCount: validPlacedJobs.length,
      maxOffersReached: validPlacedJobs.length >= 2,
      placements: validPlacedJobs.map(j => ({
        jobId: j._id,
        jobTitle: j.jobTitle,
        companyName: j.company?.companyName,
        category: j.jobCategory,
        categoryName: CATEGORY_NAMES[j.jobCategory],
        salary: j.salary,
        isInternship: j.isInternship,
        hasConversion: j.hasConversionOption
      })),
      highestCategory: validPlacedJobs.length > 0 
        ? Math.max(...validPlacedJobs.map(j => CATEGORY_HIERARCHY[j.jobCategory]))
        : 0,
      canApplyTo: validPlacedJobs.length > 0
        ? getAllowedCategories(validPlacedJobs[0].jobCategory)
        : ['mass', 'core', 'dream', 'open_dream']
    };
  } catch (error) {
    console.error('Error getting placement status:', error);
    return null;
  }
};

/**
 * Validate job category based on salary
 * Auto-determine category if not set correctly
 */
export const validateJobCategory = (salary, proposedCategory) => {
  // Open Dream: > 20 LPA
  if (salary > 20) {
    if (proposedCategory !== 'open_dream') {
      return {
        valid: false,
        suggestedCategory: 'open_dream',
        reason: 'Salary > 20 LPA must be Open Dream category'
      };
    }
  }
  
  // Dream: > 8 LPA (unless it's Open Dream)
  if (salary > 8 && salary <= 20) {
    if (proposedCategory !== 'dream' && proposedCategory !== 'open_dream') {
      return {
        valid: false,
        suggestedCategory: 'dream',
        reason: 'Salary > 8 LPA should be Dream category'
      };
    }
  }

  return {
    valid: true,
    category: proposedCategory
  };
};

export default {
  checkPlacementEligibility,
  getStudentPlacementStatus,
  validateJobCategory,
  CATEGORY_HIERARCHY,
  CATEGORY_NAMES
};
