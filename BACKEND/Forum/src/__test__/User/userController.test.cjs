jest.mock("./../../domains/user/model.cjs")
jest.mock("./../../utils/hashData.cjs")
jest.mock("./../../utils/createToken.cjs")


const User = require("./../../domains/user/model.cjs")
const { hashData, verifyHashedData } = require("./../../utils/hashData.cjs")
const createToken = require("./../../utils/createToken.cjs")
const { createNewUser,authenticateUser, updateUserPreferences,getUser } = require("./../../domains/user/controller.cjs")


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
        expect(User.findOne).toHaveBeenCalledTimes(2);
        expect(hashData).toHaveBeenCalledWith("password123");
        expect(saveMock).toHaveBeenCalled();
        expect(user.password).toBe("hashedpassword");
    })
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
        User.findOneAndUpdate = jest.fn().mockResolvedValue(updatedUser)
        verifyHashedData.mockResolvedValue(true)
        createToken.mockResolvedValue("fake-jwt-token")

        const authenticated = await authenticateUser({
            username: "johndoe",
            password: "password123"
        });

        expect(verifyHashedData).toHaveBeenCalledWith("password123", "hashedpassword");
        expect(createToken).toHaveBeenCalledWith({
            userId: "user123",
            email: "john@example.com",
            username: "johndoe"
        });
        expect(authenticated.token).toBe("fake-jwt-token");
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
