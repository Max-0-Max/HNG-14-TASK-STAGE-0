const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*"
}));

app.get("/", (req, res) => {
  res.send("Gender API is running 🚀");
});

function validateName(name) {
  if (name === undefined) {
    return { valid: false, code: 400, message: "Missing name parameter" };
  }

  if (typeof name !== "string") {
    return { valid: false, code: 422, message: "Name must be a string" };
  }

  if (name.trim() === "") {
    return { valid: false, code: 400, message: "Name cannot be empty" };
  }

  return { valid: true };
}

app.get("/api/classify", async (req, res) => {
  try {
    const { name } = req.query;

    const validation = validateName(name);
    if (!validation.valid) {
      return res.status(validation.code).json({
        status: "error",
        message: validation.message
      });
    }

    const response = await axios.get(
      `https://api.genderize.io?name=${encodeURIComponent(name)}`
    );

    const { gender, probability, count } = response.data;

    if (!gender || count === 0) {
      return res.status(422).json({
        status: "error",
        message: "No prediction available for the provided name"
      });
    }

    const sample_size = count;
    const is_confident = probability >= 0.7 && sample_size >= 100;

    const processed_at = new Date().toISOString();

    return res.status(200).json({
      status: "success",
      data: {
        name: name.toLowerCase(),
        gender,
        probability,
        sample_size,
        is_confident,
        processed_at
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(502).json({
        status: "error",
        message: "Upstream service error"
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
