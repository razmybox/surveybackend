import User from "../models/user";
import Approval from "../models/approval";
import Personal from "../models/personal";
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
  return bcrypt.compare(password, hashed);
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //validation
    if (!name) return res.status(400).send("Name is required");
    if (!password) {
      return res.status(400).send("Password is required");
    }
    if (password.length < 8)
      return res.status(400).send("Password must be at least 8 characters");

    const userExist = await User.findOne({ email }).exec();
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
    if (!user) return res.status(400).send("User not found");
    //password validation
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password" });
    }
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

export const approval = async (req, res) => {
  try {
    res.status(200).json({ file: req.file, body: req.body });
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

export const personal = async (req, res) => {
  const { firstName, lastName, dob, email, street, city, state } = req.body;
  console.log(req.body);
  if (!firstName) return res.status(400).send("First Name required");
  if (!lastName) return res.status(400).send("Last Name required");
  if (!dob) return res.status(400).send("Date of Birth required");
  if (!email) return res.status(400).send("Email required");
  if (!street) return res.status(400).send("Street required");
  if (!city) return res.status(400).send("City required");
  if (!state) return res.status(400).send("State required");
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  let newPersonal = new Personal({
    firstName,
    lastName,
    dob,
    email,
    street,
    city,
    state,
  });

  
  let image = req.files.image;
  let uploadPath = __dirname + "/uploads/" + image.name;
  uploadPath = uploadPath.split("controllers/").join("");
  console.log(uploadPath);

  console.log(uploadPath.split("uploads/")[1]);
  newPersonal.imageUrl = image.name;

  image.mv(uploadPath, async (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    await newPersonal.save();

    console.log("file saved");
    return res.json({ ok: true });
  });
  console.log("saved", newPersonal);
};
