async function create(req, res) {
  try {
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating users",
      error: error.message,
    });
  }
}

async function findAll(req, res) {
  try {
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while finding all users",
      error: error.message,
    });
  }
}

async function findOne(req, res) {
  try {
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while finding only one user",
      error: error.message,
    });
  }
}

async function update(req, res) {
  try {
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating users",
      error: error.message,
    });
  }
}

async function remove(req, res) {
  try {
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting users",
      error: error.message,
    });
  }
}

export { create, findAll, findOne, update, remove };
