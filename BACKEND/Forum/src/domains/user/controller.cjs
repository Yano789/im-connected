const User = require("./model.cjs");
const { hashData, verifyHashedData } = require("../../utils/hashData.cjs");
const createToken = require("../../utils/createToken.cjs");

const authenticateUser = async (data) => {
    try {
        const { username, password } = data;
        const fetchedUser = await User.findOne({ username });
        if (!fetchedUser) {
            throw Error("Invalid credentials");
        }
        if (!fetchedUser.verified) {
            throw Error("Email hasn't been verified yet. Check your inbox.");
        }
        const hashedPassword = fetchedUser.password;
        const passwordMatch = await verifyHashedData(password, hashedPassword);
        if (!passwordMatch) {
            throw Error("Invalid credentials");
        }
        //Create User Token
        const tokenData = { userId: fetchedUser._id, email: fetchedUser.email, username: fetchedUser.username };
        const token = await createToken(tokenData);

        //assign user token
        const authenticatedUser = await User.findOne({ username })
        return { token, authenticatedUser };
    } catch (error) {
        throw error;
    }
};

const createNewUser = async (data) => {
    try {
        const { name, username, email, number, password, preferences = {} } = data;
        //Check if user already exists
        const existingUserEmail = await User.findOne({ email });
        const existingUsername = await User.findOne({ username });
        const existingNumber = await User.findOne({number})

        if (existingUserEmail) {
            throw Error("User with provided email already exists");
        }

        else if (existingUsername) {
            throw Error("Username has been taken");
        }
        else if(existingNumber){
            throw Error("Mobile number has been taken")
        }
        else {
            //hash password
            const hashedPassword = await hashData(password);
            const newUser = new User({
                name,
                username,
                email,
                number,
                password: hashedPassword,
                preferences: {
                    preferredLanguage: preferences.preferredLanguage || "en",
                    textSize: preferences.textSize || "Medium",
                    contentMode: preferences.contentMode || "Default",
                    topics: preferences.topics || [],
                },
            });
            const createdUser = await newUser.save();
            return createdUser;
        }

    } catch (error) {
        throw error;
    }
};


const updateUserPreferences = async ({ username, preferences }) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { username },
            { preferences },
            {
                new: true,
                runValidators: true,
            });
        if (!updatedUser) {
            throw new Error("User not found");
        }
        return updatedUser;
    } catch (error) {
        throw error;
    }
};


const updateUserDetails = async(data) => {
  try {
    const { name, username, newUsername, number, email } = data;
    const callingUser = await User.findOne({ username });
    if (!callingUser) {
      throw new Error("User not found");
    }
    let errorMessage = [];

    if (username !== newUsername) {
      const preexistingUsername = await User.findOne({ username: newUsername });
      if (preexistingUsername) {
        errorMessage.push("Username is used. Please use another username.\n");
      }
    }

    if (callingUser.email !== email) {
      const preexistingEmail = await User.findOne({ email });
      if (preexistingEmail) {
        errorMessage.push("Email is used! Please choose another email\n");
      }
    }

    if (callingUser.number !== number) {
      const preexistingNumber = await User.findOne({ number });
      if (preexistingNumber) {
        errorMessage.push("Number is used! Please choose another mobile number\n");
      }
    }

    if (errorMessage.length > 0) {
      throw new Error(errorMessage.join(''));
    }

    const newUser = await User.findOneAndUpdate(
      { username: username },
      { name: name, username: newUsername, email: email, number: number },
      { new: true }
    );
    const tokenData = { userId: newUser._id, email: newUser.email, username: newUser.username };
    const token = await createToken(tokenData);
    return { token, newUser };
  } catch (error) {
    throw error;
  }
};


const getUser = async (username)=>{
    try {
        const user = await User.findOne({username})
        if (!user) {
            throw new Error("User not found");
        }
        return user
    } catch (error) {
        throw error
    }
    
}

module.exports = {createNewUser,authenticateUser, updateUserPreferences,getUser,updateUserDetails};