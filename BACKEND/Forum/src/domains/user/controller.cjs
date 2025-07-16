const User = require("./model.cjs");
const {hashData,verifyHashedData} = require("../../utils/hashData.cjs");
const createToken = require("../../utils/createToken.cjs");
const authenticateUser = async(data)=>{
    try {
        const{username,password} = data;
        const fetchedUser = await User.findOne({username});
        if(!fetchedUser){
            throw Error("Invalid Username Given!");
        }
        if(!fetchedUser.verified){
            throw Error ("Email hasn't been verified yet. Check your inbox.");
        }
        const hashedPassword = fetchedUser.password;
        const passwordMatch = await verifyHashedData(password,hashedPassword);
        if(!passwordMatch){
            throw Error ("Incorrect Password Given!");
        }
        //Create User Token
        const tokenData = {userId: fetchedUser._id,email: fetchedUser.email,username:fetchedUser.username};
        const token = await createToken(tokenData);

        //assign user token
        const authenticatedUser = await User.findOneAndUpdate({username},{token:token},{new:true})
        return authenticatedUser;
    } catch (error) {
        throw error;
    }
};









const createNewUser = async(data) =>{
    try {
        const {firstName,lastName,username,email,password} = data;
        //Check if user already exists
        const existingUserEmail = await User.findOne({email});
        const existingUsername = await User.findOne({username});

        if(existingUserEmail){
            throw Error("User with provided email already exists");
        }

        else if(existingUsername){
            throw Error("Username has been taken");
        }
        else{
            //hash password
            const hashedPassword = await hashData(password);
            const newUser = new User({
                firstName,
                lastName,
                username,
                email,
                password: hashedPassword,
            });
            const createdUser = await newUser.save();
            return createdUser;
        }

    } catch (error) {
        throw error;
    }
};

module.exports = {createNewUser,authenticateUser}