jest.mock("./../../domains/post/model.cjs")
jest.mock("./../../domains/comment/model.cjs")
jest.mock("./../../domains/savedPosts/model.cjs")






const { Post} = require("../../domains/post/model.cjs")


const Comment = require("../../domains/comment/model.cjs")

const savedPost = require("../../domains/savedPosts/model.cjs")

const {deletePost} = require("../../domains/post/controller.cjs")



describe("deleting post", () => {
    const mockData = {
        postId: "123",
        username: "username"
    }
    const fixedTime = 1752934590239;
    beforeEach(() => {
        jest.clearAllMocks()
    })
    test("successfully delete post", async () => {

        const mockPost = {
            postId: "123",
            title: "title",
            content: "content",
            tags: ["Mental Disability"],
            username: "username",
            createdAt: fixedTime,
            edited: false,
            draft: false,
            comments: 0,
            likes: 0
        }
        Post.findOne.mockResolvedValueOnce(mockPost)

        Post.deleteOne.mockResolvedValueOnce({ deletedCount: 1 })
        Comment.deleteMany.mockResolvedValueOnce({ deletedCount: 2 })
        savedPost.deleteMany.mockResolvedValueOnce({ deletedCount: 2 })

        const result = await deletePost(mockData)

        expect(Post.findOne).toHaveBeenCalledWith({ postId: "123" })
        expect(Post.deleteOne).toHaveBeenCalledWith({ postId: "123", draft: false })
        expect(Comment.deleteMany).toHaveBeenCalledWith({ postId: "123" });
        expect(savedPost.deleteMany).toHaveBeenCalledWith({ savedPostId: "123" });

        expect(result).toEqual(mockPost)
    })

    test("throws error if post not found", async () => {

        Post.findOne.mockResolvedValueOnce(null)

        await expect(deletePost(mockData)).rejects.toThrow("Post does not exist");
    })

    test("throws error if user is unauthorized", async () => {
        const mockPost = {
            postId: "post123",
            username: "otherUser",
            draft: false
        }

        Post.findOne.mockResolvedValueOnce(mockPost);

        await expect(deletePost(mockData)).rejects.toThrow("Unauthorized");
    })
})