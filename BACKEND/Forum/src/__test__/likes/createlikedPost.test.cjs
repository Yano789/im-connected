jest.mock("./../../domains/likes/model.cjs")
jest.mock("./../../domains/post/model.cjs")
jest.mock("./../../domains/user/model.cjs")



const likedPost = require("./../../domains/likes/model.cjs")
const { Post } = require("./../../domains/post/model.cjs")
const User = require("./../../domains/user/model.cjs")

const { createLikedPost } = require("./../../domains/likes/controller.cjs")

describe("create a liked post", () => {
    const fixedTime = 1752934590239;
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers().setSystemTime(new Date(fixedTime));
    })
    test("should create a liked post", async () => {
        mockUser = "john"
        mockPostId = "postId123"
        User.findOne.mockResolvedValue({ username: mockUser })
        Post.findOne.mockResolvedValue({ postId: mockPostId, likes: 5 })
        likedPost.findOne.mockResolvedValue(null)
        Post.findOneAndUpdate.mockResolvedValue({
            postId: mockPostId,
            draft: false,
            likes: 6,
        });

        const saveMock = jest.fn().mockResolvedValue({
            likedPostId: mockPostId,
            username: mockUser,
            createdAt: fixedTime,
        });

        likedPost.mockImplementation(() => ({
            save: saveMock,
        }));

        const result = await createLikedPost({ postId: mockPostId, username: mockUser });

        expect(User.findOne).toHaveBeenCalledWith({ username: mockUser });
        expect(Post.findOne).toHaveBeenCalledWith({ postId: mockPostId });
        expect(likedPost.findOne).toHaveBeenCalledWith({ likedPostId: mockPostId, username: mockUser });
        expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
            { postId: mockPostId, draft: false },
            { $inc: { likes: 1 } },
            { new: true }
        );
        expect(saveMock).toHaveBeenCalled();
        expect(result).toEqual({
            liked: {
                likedPostId: mockPostId,
                username: mockUser,
                createdAt: fixedTime,
            },
            post: {
                postId: mockPostId,
                draft: false,
                likes: 6,
            },
        });
    });

})