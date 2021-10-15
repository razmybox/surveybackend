import {check} from 'express-validator'

export const validateRequest = [
    check('name').notEmpty().withMessage('name is required'),
    check('email').notEmpty().withMessage('email is required'),
    check('password').isLength({min: 8}).withMessage('password must be at least 8'),
]

export const validateLoginRequest = [
    check('email').notEmpty().withMessage('email is required'),
    check('password').isLength({min: 8}).withMessage('password must be at least 8'),
]