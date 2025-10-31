import Meeting from '../../models/meeting.model.js';

// Get upcoming meetings
export const getUpcomingMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      status: 'scheduled',
      scheduledTime: { $gte: new Date() }
    })
      .sort({ scheduledTime: 1 })
      .select('-__v');

    res.json({ success: true, meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch meetings' });
  }
};

// Get meeting details
export const getMeetingDetails = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    res.json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch meeting' });
  }
};
