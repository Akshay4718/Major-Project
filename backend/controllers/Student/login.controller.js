import StudentUser from '../../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await StudentUser.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "User Doesn't Exist!" });

    // password match 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch || user.role !== "student")
      return res.status(400).json({ msg: 'Credentials Not Matched!' });

    // check if tpo has approved student
    // if (!user.studentProfile.isApproved) 
    //   return res.status(400).json({ msg: 'TPO has not approved you application, please try after some time!' });

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    user.token = token;
    await user.save();

    return res.json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isProfileCompleted: user.isProfileCompleted,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    console.log("student.login.controller.js => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
}

export default Login;
