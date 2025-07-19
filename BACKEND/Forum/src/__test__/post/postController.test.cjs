jest.mock("./../../domains/post/model.cjs")
jest.mock("./../../utils/hashData.cjs")
jest.mock("./../../domains/user/model.cjs")
jest.mock("./../../domains/comment/model.cjs")
jest.mock("../../utils/buildNestedComments.cjs")
jest.mock("./../../domains/savedPosts/model.cjs")






const {Post} = require("./../../domains/post/model.cjs")
const {hashData} = require("./../../utils/hashData.cjs");
const User = require("./../../domains/user/model.cjs");
const Comment = require("./../../domains/comment/model.cjs")
const createNestedComment = require("../../utils/buildNestedComments.cjs")
const savedPost = require("./../../domains/savedPosts/model.cjs")


const {createPost,editDraft,deletePost,modeLimit,getFilteredPosts,getPostWithComment,likePosts,getAllMyPosts,getAllMyDrafts,getMyDraft,deleteDrafts} = require("./../../domains/post/controller.cjs");const { JsonWebTokenError } = require("jsonwebtoken");

describe("create post/draft",()=>{
    beforeEach(()=>{
        jest.useFakeTimers().setSystemTime(new Date(1752934590239))
        jest.clearAllMocks()
    })
    test("Create a post",async()=>{
        
        const time = Date.now().toString()
        const username = "username"
        const mockData = {
            title:"title",
            content:"content",
            username:username,
            tags:["Physical Disability & Chronic Illness","Personal Mental Health"],
            createdAt: time,
            draft: false
        }
        User.findOne.mockResolvedValueOnce("username")
        hashData.mockResolvedValueOnce("hashedPostId")
        const saveMock = jest.fn().mockResolvedValue({
            _id:"123",
            postId:"hashedPostId",
            ...mockData,
            edited: false,
            comments: 0,
            likes: 0
        })

        Post.mockImplementation(()=>({
            save:saveMock
        }))

        const post = await createPost(mockData)
        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(hashData).toHaveBeenCalledWith(username+time)
        expect(saveMock).toHaveBeenCalled()
        expect(post.postId).toBe("hashedPostId")
        expect(post.content).toBe("content")
        expect(post.title).toBe("title")
        expect(post.username).toBe("username")
        expect(post.tags).toEqual(["Physical Disability & Chronic Illness","Personal Mental Health"])
        expect(post.createdAt).toBe(time)
        expect(post.draft).toBe(false)
        expect(post.edited).toBe(false)
        expect(post.comments).toBe(0)
        expect(post.likes).toBe(0)
    })
})


describe("")