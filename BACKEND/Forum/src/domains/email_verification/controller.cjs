const User = require("../user/model.cjs");
const {sendOTP,verifyOTP,deleteOTP} = require("../otp/controller.cjs");
const verifyUserEmail = async({email,otp})=>{
    try {
        const validOTP = await verifyOTP({email,otp});
        if(!validOTP){
            throw Error("Invalid code passed. Check your inbox.");
        }
        //update user record to show that it is verified
        await User.updateOne({email},{verified:true});
        await deleteOTP(email);
        
        //get verified user data
        const verifiedUser = await User.findOne({email});
        return verifiedUser;
    } catch (error) {
        throw error;
    }
};



const sendVerificationOTPEmail = async(email)=>{
    try {
       const existingUser = await User.findOne({email});
       if(!existingUser) {
        throw Error("There's no account for the provided email.");
       }
       const otpDetails = {
            email,
            subject:"Email Verification",
            message:"Verify your email with the code below.",
            duration: 1,

       };
       const createdOTP = await sendOTP(otpDetails);
       return createdOTP
    } catch (error) {
        throw error;
    }
};

module.exports = {sendVerificationOTPEmail,verifyUserEmail};