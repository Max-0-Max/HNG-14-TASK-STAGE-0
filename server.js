const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Gender API is running 🚀");
});

app.get("/api/classify", async (req, res) => {
  try {
    const { name } = req.query;

    if (name === undefined || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Missing name parameter"
      });
    }

    if (typeof name !== "string") {
      return res.status(422).json({
        status: "error",
        message: "Name must be a string"
      });
    }

    const response = await axios.get(
      `https://api.genderize.io?name=${encodeURIComponent(name)}`
    );

    const { gender, probability, count } = response.data;

    if (gender === null || count === 0) {
      return res.status(422).json({
        status: "error",
        message: "No prediction available for the provided name"
      });
    }

    const sample_size = count;
    const is_confident = probability >= 0.7 && sample_size >= 100;

    return res.status(200).json({
      status: "success",
      data: {
        name: name.toLowerCase(),
        gender,
        probability,
        sample_size,
        is_confident,
        processed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(502).json({
        status: "error",
        message: "Upstream service error"
      });
    }

    // ✅ Server failure
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
