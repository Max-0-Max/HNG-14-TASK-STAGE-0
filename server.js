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

    // Only reject if name is completely missing
    if (name === undefined || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Missing name parameter"
      });
    }

    const response = await axios.get(
      `https://api.genderize.io?name=${encodeURIComponent(name.trim())}`
    );

    const { gender, probability, count } = response.data;

    // Always return 200 with data — even if gender is null/unknown
    return res.status(200).json({
      status: "success",
      data: {
        name: name.trim().toLowerCase(),
        gender: gender ?? "unknown",
        probability: probability ?? 0,
        sample_size: count ?? 0,
        is_confident: (probability ?? 0) >= 0.9 && (count ?? 0) >= 100,
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
