import Meeting from '../../models/meeting.model.js';
import Users from '../../models/user.model.js';
import sendMail from '../../config/Nodemailer.js';

// Generate unique room name
const generateRoomName = () => {
  return `cpms-${Date.now()}-${Math.random().toString(36).substring(7)}`;
};

// Create meeting and send emails
export const createMeeting = async (req, res) => {
  try {
    const { title, description, scheduledTime, duration } = req.body;

    if (!title || !description || !scheduledTime || !duration) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (new Date(scheduledTime) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time must be in the future'
      });
    }

    const roomName = generateRoomName();
    const meetingLink = `https://meet.jit.si/${roomName}`;

    const meeting = await Meeting.create({
      title,
      description,
      scheduledTime,
      duration,
      roomName,
      hostId: req.user._id,
      hostName: `${req.user.first_name} ${req.user.last_name || ''}`.trim(),
      meetingLink
    });

    // Get all approved students
    const students = await Users.find({ 
      role: 'student',
      'studentProfile.isApproved': true
    }).select('email first_name last_name');

    // Send emails
    const emailPromises = students.map(async (student) => {
      const studentName = `${student.first_name} ${student.last_name || ''}`.trim();
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Meeting Scheduled</h1>
            </div>
            <div class="content">
              <p>Hello ${studentName},</p>
              <p>A new online meeting has been scheduled.</p>
              
              <div class="details">
                <p><strong>Title:</strong> ${title}</p>
                <p><strong>Description:</strong> ${description}</p>
                <p><strong>Date & Time:</strong> ${new Date(scheduledTime).toLocaleString('en-IN', { 
                  dateStyle: 'full', 
                  timeStyle: 'short',
                  timeZone: 'Asia/Kolkata'
                })}</p>
                <p><strong>Duration:</strong> ${duration} minutes</p>
              </div>

              <center>
                <a href="${meetingLink}" class="button" style="color: white;">Join Meeting</a>
              </center>

              <p>Best regards,<br><strong>CPMS Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        await sendMail(student.email, `Meeting Scheduled: ${title}`, html);
      } catch (error) {
        console.error(`Failed to send email to ${student.email}`);
      }
    });

    await Promise.all(emailPromises);

    res.status(201).json({
      success: true,
      message: 'Meeting created and invitations sent',
      meeting
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create meeting'
    });
  }
};

// Get all meetings
export const getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ hostId: req.user._id })
      .sort({ scheduledTime: -1 });

    res.json({ success: true, meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch meetings' });
  }
};

// Delete meeting
export const deleteMeeting = async (req, res) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Meeting deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete meeting' });
  }
};
