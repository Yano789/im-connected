const generateOTP = async()=>{
try {
    return (otp = `${Math.floor(Math.random()*1000000)}`.padStart(6,"0"));
} catch (error) {
    throw error;
}
};

module.exports = generateOTP;