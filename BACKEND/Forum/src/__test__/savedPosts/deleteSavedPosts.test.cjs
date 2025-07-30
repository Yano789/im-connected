jest.mock("./../../domains/savedPosts/model.cjs");


const savedPost = require("./../../domains/savedPosts/model.cjs")


const {deleteSavedPost} = require("./../../domains/savedPosts/controller.cjs")

describe("deleteSavedPosts",()=>{
    const fixedTime = 1752934590239;
    beforeEach(()=>{
        jest.clearAllMocks()
        jest.useFakeTimers().setSystemTime(new Date(fixedTime));
    })
    test("should delete a preexisting post",async()=>{
        mockPostId = "postId123"
        mockUser="john"
        mockData ={
            savedPostId:"postId123",
            username:"john",
            createdAt: fixedTime
        }

        savedPost.findOneAndDelete.mockResolvedValue(mockData)
        const result = await deleteSavedPost({mockPostId,mockUser})
        expect(result).toEqual(mockData)

    })
})