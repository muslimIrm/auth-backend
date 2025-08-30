const mongoose = require("mongoose");
const Joi = require('joi');
const jwt = require("jsonwebtoken")
const usersSchema = mongoose.Schema({
    
    username: {
        type: String,
        maxlength: 20,
        minlength: 3,
        trim: true,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
}, { timestamps: true });

usersSchema.methods.generateToken = function () {
    console.log(this.email)
    console.log(process.env.Email)
    if (this.email === process.env.Email) {
        console.log(true)
        return jwt.sign(
            { id: this._id, username: this.username, email: this.email, isAdmin: true },
            process.env.SECRET);
    }
    return jwt.sign(
        { id: this._id, username: this.username, email: this.email, isAdmin: false },
        process.env.SECRET);
};


const Users = mongoose.model("Users", usersSchema);


const validationRegister = (obj) => {
    const userSchema = Joi.object({
        username: Joi.string()
            .trim()
            .min(3)
            .max(20)
            .pattern(/^[a-zA-Z0-9._-]+$/)
            .required()
            .messages({
                'string.empty': 'اسم المستخدم مطلوب',
                'string.min': 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
                'string.max': 'اسم المستخدم يجب أن يكون 20 حرف كحد أقصى',
                'string.pattern.base': 'اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام فقط',
                'any.required': 'اسم المستخدم مطلوب'
            }),

        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
            .pattern(/^[^\u0600-\u06FF]*$/)
            .required()
            .messages({
                'string.empty': 'كلمة المرور مطلوبة',
                'string.min': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
                'string.pattern.base': 'كلمة المرور يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، ورمز خاص ولا تحتوي على أحرف عربية',
                'any.required': 'كلمة المرور مطلوبة'
            }),

        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.empty': 'البريد الإلكتروني مطلوب',
                'string.email': 'البريد الإلكتروني غير صحيح',
                'any.required': 'البريد الإلكتروني مطلوب'
            }),

    });

    return userSchema.validate(obj, { abortEarly: false });
};

const validationLogin = (obj) => {
    const userSchema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.empty': 'البريد الإلكتروني مطلوب',
                'string.email': 'البريد الإلكتروني غير صحيح',
                'any.required': 'البريد الإلكتروني مطلوب'
            }),

        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
            .pattern(/^[^\u0600-\u06FF]*$/)
            .required()
            .messages({
                'string.empty': 'كلمة المرور مطلوبة',
                'string.min': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
                'string.pattern.base': 'كلمة المرور يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، ورمز خاص ولا تحتوي على أحرف عربية',
                'any.required': 'كلمة المرور مطلوبة'
            }),
    });

    return userSchema.validate(obj, { abortEarly: false });
};


module.exports = { Users, validationRegister, validationLogin }