import User from "../models/user.model.js";

async function register(req, res) {
  try {
    const { firstName, lastName, phone, email, password, role } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email || null }, { phone: phone || null }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "phone";
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while registering the user",
      error: error.message,
    });
  }
}

export { register };
