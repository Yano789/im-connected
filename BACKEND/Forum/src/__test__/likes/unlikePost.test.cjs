jest.mock("./../../domains/likes/model.cjs")
jest.mock("./../../domains/post/model.cjs")
jest.mock("./../../domains/user/model.cjs")



const likedPost = require("./../../domains/likes/model.cjs")
const { Post } = require("./../../domains/post/model.cjs")

const { unlikePost } = require("./../../domains/likes/controller.cjs")

describe("unlike a post",()=>{
    const fixedTime = 1752934590239;
    beforeEach(()=>{
        jest.clearAllMocks()
        jest.useFakeTimers().setSystemTime(new Date(fixedTime));
    })
    test("unlike a post successfully",async()=>{
        const mockPostId = "postId123"
        const mockUser = "john"
       const mockData = {
            likedPostId:mockPostId,
            username:mockUser,
            createdAt:fixedTime
        }
        const mockPost = {
            postId:mockPostId,
            title:"title",
            content:"content",
            username: mockUser,
            tags:["Mental Health"],
            createdAt:fixedTime,
            edited:false,
            comments:2,
            likes:4,
            draft:false,
            media:[]

        }
        const mockUpdatedPost = { ...mockPost, likes: 3 };
        likedPost.findOneAndDelete.mockResolvedValue(mockData)
        Post.findOneAndUpdate.mockResolvedValue(mockUpdatedPost)
        const result = await unlikePost({postId:mockPostId,username:mockUser})
        expect(result).toEqual({unlikedPost:mockData,post:mockUpdatedPost})
        expect(Post.findOneAndUpdate).toHaveBeenCalledWith({postId:mockPostId,draft:false},{ $inc: {likes: -1} },{new:true})
    })
    test("Throws an error if the user unlikes a post that he didn’t like previously",async()=>{
        const mockPostId = "postId123"
        const mockUser = "john"

        likedPost.findOneAndDelete.mockResolvedValue(null)
        expect(unlikePost({postId:mockPostId,username:mockUser})).rejects.toThrow("Cannot unlike a post that you didn't like")

    })
})