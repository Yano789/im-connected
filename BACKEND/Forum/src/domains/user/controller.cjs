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

        if (existingUserEmail) {
            throw Error("User with provided email already exists");
        }

        else if (existingUsername) {
            throw Error("Username has been taken");
        }
        else {
            //hash password
            const hashedPassword = await hashData(password);
            const newUser = new User({
                name,
                name,
                username,
                email,
                number,
                number,
                password: hashedPassword,
                preferences: {
                    preferredLanguage: preferences.preferredLanguage || "English",
                    textSize: preferences.textSize || "Medium",
                    contentMode: preferences.contentMode || "Default",
                    topics: preferences.topics || [],
                },
                preferences: {
                    preferredLanguage: preferences.preferredLanguage || "English",
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
  const updatedUser = await User.findOneAndUpdate(
    { username },
    { preferences },
    {
      new: true,
      runValidators: true,
    }
  );
  return updatedUser;
};

const getUser = async (username)=>{
    try {
        const user = await User.findOne({username})
        return user
    } catch (error) {
        throw error
    }
    
}

module.exports = {createNewUser,authenticateUser, updateUserPreferences,getUser};