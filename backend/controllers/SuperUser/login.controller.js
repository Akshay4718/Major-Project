import StudentUser from '../../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await StudentUser.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "User Doesn't Exist!" });

    const isMatch = await bcrypt.compare(password, user.password);
    
    
    if (!isMatch || user.role !== "superuser")
      return res.status(400).json({ msg: 'Credentials Not Matched!' });

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    user.token = token;
    await user.save();

    return res.json({ token });
  } catch (error) {
    console.log("admin.login.js => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
}

export default Login;
