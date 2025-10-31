import { getStudentPlacementStatus } from '../../helpers/placementPolicy.js';

/**
 * Get student's current placement status
 * Shows current offers and eligibility for new applications
 */
const GetPlacementStatus = async (req, res) => {
  try {
    const studentId = req.user?.userId || req.params.studentId;
    
    if (!studentId) {
      return res.status(400).json({ 
        success: false,
        msg: 'Student ID required' 
      });
    }

    const placementStatus = await getStudentPlacementStatus(studentId);
    
    if (!placementStatus) {
      return res.status(404).json({ 
        success: false,
        msg: 'Student not found' 
      });
    }

    return res.status(200).json({
      success: true,
      status: placementStatus
    });
    
  } catch (error) {
    console.error('Error getting placement status:', error);
    return res.status(500).json({ 
      success: false,
      msg: 'Failed to get placement status' 
    });
  }
};

export default GetPlacementStatus;
