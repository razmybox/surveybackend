import express from 'express'
import { register, approval, login } from '../controllers/auth'
import {  validateLoginRequest, validateRequest } from '../validators/auth'
const router = express.Router()


router.post('/register',validateRequest, register)
router.post('/login', login)
router.post('/approval', approval)
router.post('/logout', (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "Signout success" });
      } catch (err) {
        console.log(err);
      }
})


module.exports = router 