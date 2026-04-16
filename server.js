const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*" }));
app.set("trust proxy", true);
app.set("strict routing", false);

app.get("/", (req, res) => {
  res.send("Gender API is running 🚀");
});

app.get("/ping", (req, res) => {
  res.json({ version: "v6-final", time: new Date().toISOString() });
});

app.get(["/api/classify", "/api/classify/"], async (req, res) => {
  try {
    const rawName = req.query.name;

    // Catch ALL falsy/empty cases
    if (
      rawName === undefined ||
      rawName === null ||
      String(rawName).trim() === "" ||
      !("name" in req.query)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Missing or empty name parameter"
      });
    }

    let name = String(rawName).trim();
    name = name.split("?")[0].split("/")[0].trim();

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name cannot be empty"
      });
    }

    const response = await axios.get(
      `https://api.genderize.io?name=${encodeURIComponent(name)}`
    );

    const { gender, probability, count } = response.data;

    const isUnknown = !gender;
    const safeProb = typeof probability === "number" ? probability : 0;
    const safeCount = typeof count === "number" ? count : 0;
    const is_confident = !isUnknown && safeProb >= 0.9 && safeCount >= 100;

    return res.status(200).json({
      status: "success",
      data: {
        name: name.toLowerCase(),
        gender: isUnknown ? "unknown" : gender,
        probability: safeProb,
        sample_size: safeCount,
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
