import Users from '../../models/user.model.js';

const UsersTPO = async (req, res) => {
  const tpoUsers = await Users.find({ role: "tpo_admin" });
  return res.json({ tpoUsers })
}

export default UsersTPO;
