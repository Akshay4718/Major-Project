const UserDetail = async (req, res) => {
  // console.log(req.user)
  return res.json({
    id: `${req.user.id}`,
    // common data
    first_name: `${req.user.first_name}`,
    middle_name: `${req.user.middle_name}`,
    last_name: `${req.user.last_name}`,
    email: `${req.user.email}`,
    number: `${req.user.number}`,
    password: `${req.user.password}`,
    profile: `${req.user.profile}`,
    gender: `${req.user.gender}`,
    dateOfBirth: `${req.user.dateOfBirth}`,
    createdAt: `${req.user.createdAt}`,

    fullAddress: {
      address: `${req.user.fullAddress.address}`,
      pincode: `${req.user.fullAddress.pincode}`,
    },

    role: `${req.user.role}`,
    isProfileCompleted: req.user.isProfileCompleted,

    // student data
    studentProfile: {
      USN: `${req.user.studentProfile?.USN || ''}`,
      rollNumber: req.user.studentProfile?.rollNumber || null,
      department: `${req.user.studentProfile?.department || ''}`,
      year: req.user.studentProfile?.year || null,
      addmissionYear: req.user.studentProfile?.addmissionYear || null,
      gap: req.user.studentProfile?.gap || false,
      activeBacklog: req.user.studentProfile?.activeBacklog || 0,
      resume: `${req.user.studentProfile?.resume || ''}`,
      SGPA: {
        sem1: req.user.studentProfile?.SGPA?.sem1 || null,
        sem2: req.user.studentProfile?.SGPA?.sem2 || null,
        sem3: req.user.studentProfile?.SGPA?.sem3 || null,
        sem4: req.user.studentProfile?.SGPA?.sem4 || null,
        sem5: req.user.studentProfile?.SGPA?.sem5 || null,
        sem6: req.user.studentProfile?.SGPA?.sem6 || null,
        sem7: req.user.studentProfile?.SGPA?.sem7 || null,
        sem8: req.user.studentProfile?.SGPA?.sem8 || null,
      },
      CGPA: req.user.studentProfile?.CGPA || null,
      isApproved: req.user.studentProfile?.isApproved || false,
      pastQualification: {
        sslc: {
          board: `${req.user.studentProfile?.pastQualification?.sslc?.board || ''}`,
          percentage: req.user.studentProfile?.pastQualification?.sslc?.percentage || null,
          year: req.user.studentProfile?.pastQualification?.sslc?.year || null
        },
        puc: {
          board: `${req.user.studentProfile?.pastQualification?.puc?.board || ''}`,
          percentage: req.user.studentProfile?.pastQualification?.puc?.percentage || null,
          year: req.user.studentProfile?.pastQualification?.puc?.year || null
        },
        diploma: {
          department: `${req.user.studentProfile?.pastQualification?.diploma?.department || ''}`,
          percentage: req.user.studentProfile?.pastQualification?.diploma?.percentage || null,
          year: req.user.studentProfile?.pastQualification?.diploma?.year || null
        },
      },
    }

  });
}

export default UserDetail;
