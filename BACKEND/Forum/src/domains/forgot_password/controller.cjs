const User = require("../user/model.cjs");
const  {sendOTP,verifyOTP,deleteOTP} = require("./../otp/controller.cjs");
const {hashData} = require("../../utils/hashData.cjs");

const resetUserPassword = async({email,otp,newPassword})=>{
    try {
        const validOTP = await verifyOTP({email,otp});
        if(!validOTP){
            throw Error ("invalid code passed. Check your inbox.");
        }

        //update user record with new password
        if(!/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(newPassword)){
            throw Error("Password needs to have at least one Uppercase Letter, one special character and is more than 8 characters long.");
        } 

        const hashedNewPassword = await hashData(newPassword);
        await User.updateOne({email},{password: hashedNewPassword});
        await deleteOTP(email);
        return;
    }catch (error) {
        throw error;
    }
};



const sendPasswordResetOTPEmail = async(email)=>{
    try {
        //check if account exists
        const existingUser = await User.findOne({email});
        if(!existingUser){
            throw Error("There's no account for the provided email.")
        }
        if(!existingUser.verified){
            throw Error("Email hasn't been verified yet. Check your inbox.");
        }
        const otpDetails = {
            email,
            subject: "Password Reset",
            message:"Enter the code below to reset your password.",
            duration: 1,
        };
        const createdOTP = await sendOTP(otpDetails);
        return createdOTP;
    } catch (error) {
        throw error;
    }
};
module.exports = {sendPasswordResetOTPEmail,resetUserPassword};