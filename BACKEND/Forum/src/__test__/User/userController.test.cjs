jest.mock("./../../domains/user/model.cjs")
jest.mock("./../../domains/post/model.cjs")
jest.mock("./../../domains/savedPosts/model.cjs")
jest.mock("./../../domains/likes/model.cjs")
jest.mock("./../../domains/comment/model.cjs")
jest.mock("./../../domains/medication/model.cjs")
jest.mock("./../../utils/hashData.cjs")
jest.mock("./../../utils/createToken.cjs")



const User = require("./../../domains/user/model.cjs")
const {Post} = require("./../../domains/post/model.cjs")
const savedPost = require("./../../domains/savedPosts/model.cjs")
const likedPost = require("./../../domains/likes/model.cjs")
const Comment = require("./../../domains/comment/model.cjs")
const { hashData, verifyHashedData } = require("./../../utils/hashData.cjs")
const createToken = require("./../../utils/createToken.cjs")
const { createNewUser,authenticateUser, updateUserPreferences,getUser ,updateUserDetails} = require("./../../domains/user/controller.cjs")
const { CareRecipient, Medication } = require("./../../domains/medication/model.cjs");

describe("createNewUser", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    test("Creating a user", async () => {
        const mockData = {
            name: "John Doe",
            username: "johndoe",
            email: "john@example.com",
            password: "password123"
        };
        User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
        hashData.mockResolvedValue("hashedpassword")


        const saveMock = jest.fn().mockResolvedValue({
            ...mockData,
            password: "hashedpassword",
            _id: "123"
        });

        User.mockImplementation(() => ({
            save: saveMock
        }));

        const user = await createNewUser(mockData);
        expect(User.findOne).toHaveBeenCalledTimes(3);
        expect(hashData).toHaveBeenCalledWith("password123");
        expect(saveMock).toHaveBeenCalled();
        expect(user.password).toBe("hashedpassword");
    })

    test("should throw error if email already exists", async () => {
    User.findOne
      .mockResolvedValueOnce({ email: "exists@example.com" }) // email exists
      .mockResolvedValueOnce(null) // username check (won't reach)
      .mockResolvedValueOnce(null);

    const mockData = {
      name: "John Doe",
      username: "johndoe",
      email: "exists@example.com",
      password: "password123",
      number: "1234567890",
    };

    await expect(createNewUser(mockData)).rejects.toThrow(
      "User with provided email already exists"
    );
  });

  test("should throw error if username already taken", async () => {
    User.findOne
      .mockResolvedValueOnce(null) // email not exists
      .mockResolvedValueOnce({ username: "johndoe" }) // username exists
      .mockResolvedValueOnce(null);

    const mockData = {
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "password123",
      number: "1234567890",
    };

    await expect(createNewUser(mockData)).rejects.toThrow(
      "Username has been taken"
    );
  });

  test("should throw error if mobile number already taken", async () => {
    User.findOne
      .mockResolvedValueOnce(null) // email not exists
      .mockResolvedValueOnce(null) // username not exists
      .mockResolvedValueOnce({ number: "1234567890" }); // number exists

    const mockData = {
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "password123",
      number: "1234567890",
    };

    await expect(createNewUser(mockData)).rejects.toThrow(
      "Mobile number has been taken"
    );
  });
})


describe("authenticateUser", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    test("Authenticate User with the correct password", async () => {
        const mockUser = {
            _id: "user123",
            username: "johndoe",
            email: "john@example.com",
            password: "hashedpassword",
            verified: true
        }

        const updatedUser = { ...mockUser, token: "fake-jwt-token" }
        User.findOne.mockResolvedValueOnce(mockUser)
        User.findOne.mockResolvedValueOnce(updatedUser)
        verifyHashedData.mockResolvedValue(true)
        createToken.mockResolvedValue("fake-jwt-token")

        const authenticated = await authenticateUser({
            username: "johndoe",
            password: "password123"
        });
        console.log(authenticated)
        expect(verifyHashedData).toHaveBeenCalledWith("password123", "hashedpassword");
        expect(createToken).toHaveBeenCalledWith({
            userId: "user123",
            email: "john@example.com",
            username: "johndoe"
        });
        expect(authenticated.token).toBe("fake-jwt-token");
        expect(authenticated.authenticatedUser).toBe(updatedUser)
    });

    test("should throw error for invalid username", async () => {
        User.findOne.mockResolvedValueOnce(null);
        await expect(authenticateUser({ username: "wronguser", password: "123" }))
            .rejects.toThrow("Invalid credentials");
    });

    test("should throw error if email not verified", async () => {
        User.findOne.mockResolvedValueOnce({ username: "johndoe", verified: false });
        await expect(authenticateUser({ username: "johndoe", password: "123" }))
            .rejects.toThrow("Email hasn't been verified yet. Check your inbox.");
    });

    test("should throw error for incorrect password", async () => {
        const mockUser = {
            username: "johndoe",
            password: "hashedpassword",
            verified: true
        };
        User.findOne.mockResolvedValueOnce(mockUser);
        verifyHashedData.mockResolvedValue(false);

        await expect(authenticateUser({ username: "johndoe", password: "wrong" }))
            .rejects.toThrow("Invalid credentials");
    });



})

describe("updateUserPreferences", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    test("Update User Preferences", async () => {
        const mockUser = {
            name:"john",
            username: "johndoe",
            number:"+6512345678",
            email:"john@example.com",
            pasword:"hashedpassword",
            verified: false,
            threadId: null,
            preferences: {}
        };

        const updatedPreferences = {
            preferredLanguage: "English",
            textSize: "Medium",
            contentMode: "Default",
            topics: ["Mental Health"]
        };
        User.findOneAndUpdate.mockResolvedValue({
            ...mockUser,
            preferences: updatedPreferences
        });
        const updatedUser = await updateUserPreferences({
            username: "johndoe",
            preferences: updatedPreferences
        });
        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
            { username: "johndoe" },
            { preferences: updatedPreferences },
            { new: true , runValidators: true }
        );
        expect(updatedUser.preferences).toEqual(updatedPreferences);
        expect(updatedUser.preferences.preferredLanguage).toBe("English");
        expect(updatedUser.preferences.textSize).toBe("Medium");
        expect(updatedUser.preferences.contentMode).toBe("Default");
        expect(updatedUser.preferences.topics).toEqual(["Mental Health"]);

    }) 
    test("should throw error if user not found", async () => {
        User.findOneAndUpdate.mockResolvedValue(null);
        await expect(updateUserPreferences({
            username: "nonexistentuser",
            preferences: {}
        })).rejects.toThrow("User not found");
    });

})

describe("getUser", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    test("Get User by username", async () => {
        const mockUser = {
            name:"John",
            username: "johndoe",
            email: "john@example.com",
            number: "+6512345678",
            password: "hashedpassword",
            verified: true,
            threadId: null,
            preferences: {
                preferredLanguage: "English",
                textSize: "Medium",
                contentMode: "Default",
                topics: []
            }
        };
        User.findOne.mockResolvedValueOnce(mockUser);
        const user = await getUser("johndoe");
        expect(user).toEqual(mockUser);
    });
    test("should throw error if user not found", async () => {
        User.findOne.mockResolvedValueOnce(null);
        await expect(getUser("nonexistentuser")).rejects.toThrow("User not found");
    });
});


describe("updateUserDetails", () => {
  const mockUser = {
    _id: "user123",
    name: "John",
    username: "johndoe",
    number: "+6512341234",
    email: "johndoe@example.com",
    password: "hashedpassword",
    verified: true,
    threadId: null,
    preferences: {
      preferredLanguage: "en",
      textSize: "Medium",
      contentMode: "Default",
      topics: ["Mental Disability"]
    }
  };

  const updatedUser = {
    _id: "user123",
    name: "Jane",
    username: "janedoe",
    number: "+6512341235",
    email: "janedoe@example.com",
    password: "hashedpassword",
    verified: true,
    threadId: null,
    preferences: {
      preferredLanguage: "en",
      textSize: "Medium",
      contentMode: "Default",
      topics: ["Mental Disability"]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should update user details and return token", async () => {

  User.findOne.mockResolvedValueOnce(mockUser);


  User.findOne
    .mockResolvedValueOnce(null)  // check newUsername
    .mockResolvedValueOnce(null)  // check email
    .mockResolvedValueOnce(null); // check number

  User.findOneAndUpdate.mockResolvedValue(updatedUser);
  Post.updateMany.mockResolvedValue({});
  savedPost.updateMany.mockResolvedValue({});
  likedPost.updateMany.mockResolvedValue({});
  Comment.updateMany.mockResolvedValue({});
  CareRecipient.updateMany.mockResolvedValue({});
  Medication.updateMany.mockResolvedValue({});

  createToken.mockResolvedValue("mock.jwt.token");

  const data = {
    name: "Jane",
    username: "johndoe",
    newUsername: "janedoe",
    number: "+6512341235",
    email: "janedoe@example.com"
  };

  const result = await updateUserDetails(data);



  expect(User.findOne).toHaveBeenCalledTimes(4);

  expect(User.findOne).toHaveBeenNthCalledWith(1, { username: "johndoe" });     // get current user
  expect(User.findOne).toHaveBeenNthCalledWith(2, { username: "janedoe" });     // newUsername conflict check
  expect(User.findOne).toHaveBeenNthCalledWith(3, { email: "janedoe@example.com" }); // email conflict check
  expect(User.findOne).toHaveBeenNthCalledWith(4, { number: "+6512341235" });   // number conflict check

  expect(User.findOneAndUpdate).toHaveBeenCalledWith(
    { username: "johndoe" },
    {
      name: "Jane",
      username: "janedoe",
      email: "janedoe@example.com",
      number: "+6512341235"
    },
    { new: true }
  );

  expect(createToken).toHaveBeenCalledWith({
    userId: updatedUser._id,
    email: updatedUser.email,
    username: updatedUser.username
  });

  expect(result).toEqual({ token: "mock.jwt.token", newUser: updatedUser });
});


test("should throw error if current user not found",async()=>{
    User.findOne.mockResolvedValue(null);

    const data = {
        name:"Jane",
        username:"nil",
        newUsername:"janedoe",
        number:"+6512341235",
        email:"janedoe@example.com"
    }

    await expect(updateUserDetails(data)).rejects.toThrow("User not found");
})

test("should throw error if newUsername, email or number already used", async () => {
    User.findOne
      .mockResolvedValueOnce(mockUser)      // current user found
      .mockResolvedValueOnce({})             // newUsername conflict found (non-null)
      .mockResolvedValueOnce({})             // email conflict found
      .mockResolvedValueOnce({});            // number conflict found

    const data = {
      name: "Jane",
      username: "johndoe",
      newUsername: "takenUsername",
      number: "+6512341235",
      email: "takenemail@example.com"
    };

    await expect(updateUserDetails(data)).rejects.toThrow(
      /Username is used|Email is used|Number is used/
    );
  });

});
