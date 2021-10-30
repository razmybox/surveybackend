import express from "express";
import { register, approval, login, personal } from "../controllers/auth";
import { validateRequest } from "../validators/auth";
const router = express.Router();

router.post("/register", validateRequest, register);
router.post("/login", login);
router.post("/approval", approval);
router.post("/personal", personal);
router.post("/logout", (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "See you soon" });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
