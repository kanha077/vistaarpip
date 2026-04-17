import { Router } from "express";
import User from "../models/User.js";
import HealthProfile from "../models/HealthProfile.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();
router.use(authMiddleware);

// GET /api/profile — get user health profile
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const profile = await HealthProfile.findOne({ userId: req.user.id });

    res.json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
});

// POST /api/profile — update profile data
router.post("/", async (req, res) => {
  try {
    const { name, age, gender, location, medicalHistory, familyHistory, lifestyle, currentSymptoms, ongoingMedicines, onboardingComplete } = req.body;

    // Update User basic info
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (location) user.location = location;
    await user.save();

    // Update or Create Health Profile
    let profile = await HealthProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new HealthProfile({ userId: req.user.id });
    }

    if (medicalHistory) profile.medicalHistory = medicalHistory;
    if (familyHistory) profile.familyHistory = familyHistory;
    if (lifestyle) profile.lifestyle = lifestyle;
    if (currentSymptoms) profile.currentSymptoms = currentSymptoms;
    if (req.body.medicines) profile.medicines = req.body.medicines;
    if (onboardingComplete !== undefined) profile.onboardingComplete = onboardingComplete;


    await profile.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          gender: user.gender,
          location: user.location
        },
        profile
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
});

export default router;