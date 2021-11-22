const empty = require('is-empty')
const validator = require("validator");

module.exports = validateLogin =(req) => {
    
    const email = !empty(req.email) ? req.email : ''
    const password = !empty(req.password) ? req.password : ''
    let errors = {}
    
    if(validator.isEmpty(email)){
        errors.email = 'Email field is required'
    } else if (!validator.isEmail(email)){
        errors.email = 'Please enter a valid email'
    }

    if(validator.isEmpty(password)){
        errors.password = 'Password field is required'
    } 

    return {
        errors,
        isValid: empty(errors)
    }
}