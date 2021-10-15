import User from "../models/user";
import Approval from "../models/approval";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

const comparePassword = (password, hashed) => {
  return bcrypt.compare(password, hashed)
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //validation
    if (!name) return res.status(400).send("Name is required");
    if (!password) {
      return res.status(400).send("Password is required");
    }
    if (password < 8) {
      return res.status(400).send("Password must be at least 8 characters");
    }

    let userExist = await User.findOne({ email }).exec();
    if (userExist)
      return res
        .status(400)
        .send("This email is associated with an application");

    //hashed password
    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    console.log("saved", newUser);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send(
        "Please ensure that all the fields are entered and do not duplicate any of the fields"
      );
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).json("User not found");
    //password validation
    const isMatch = await comparePassword(password, user.password);
    //sign in jwt
    const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    user.password = undefined;
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true
    });
    res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).json("Error. Try Again");
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Signout success" });
  } catch (err) {
    console.log(err);
  }
};

export const approval = async (req, res) => {
  try {
    const { phone, ssn, bank, routing, account } = req.body;
    if (!phone) return res.status(400).send("Your phone number is required");
    if (!ssn)
      return res
        .status(400)
        .send("social security is required to verify identity");
    if (!bank) return res.status(400).send("Bank is required");
    if (!routing)
      return res.status(400).send("Account routing number is required");
    if (!account) return res.status(400).send("Account number is required");

    const newApproval = new Approval({ phone, ssn, bank, routing, account });
    await newApproval.save();
    console.log("saved", newApproval);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("ERROR, TRY AGAIN");
  }
};
