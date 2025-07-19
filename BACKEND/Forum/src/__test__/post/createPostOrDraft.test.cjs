jest.mock("./../../domains/post/model.cjs")
jest.mock("./../../utils/hashData.cjs")
jest.mock("./../../domains/user/model.cjs")

const {Post} = require("../../domains/post/model.cjs")
const {hashData} = require("../../utils/hashData.cjs");
const User = require("../../domains/user/model.cjs");



const {createPost} = require("../../domains/post/controller.cjs")

describe("create post/draft", () => {
    const fixedTime = 1752934590239;

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date(fixedTime));
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("Create a post", async () => {
        const username = "username";
        const mockData = {
            title: "title",
            content: "content",
            username: username,
            tags: ["Physical Disability & Chronic Illness", "Personal Mental Health"],
            draft: false
        };

        User.findOne.mockResolvedValueOnce("username");
        hashData.mockResolvedValueOnce("hashedPostId");

        const saveMock = jest.fn().mockResolvedValue({
            _id: "123",
            postId: "hashedPostId",
            title: "title",
            content: "content",
            username: "username",
            tags: ["Physical Disability & Chronic Illness", "Personal Mental Health"],
            createdAt: fixedTime,
            draft: false,
            edited: false,
            comments: 0,
            likes: 0
        });

        Post.mockImplementation(() => ({
            save: saveMock
        }));

        const post = await createPost(mockData);

        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(hashData).toHaveBeenCalledWith(username + fixedTime);
        expect(saveMock).toHaveBeenCalled();

        expect(post.postId).toBe("hashedPostId");
        expect(post.content).toBe("content");
        expect(post.title).toBe("title");
        expect(post.username).toBe("username");
        expect(post.tags).toStrictEqual(["Physical Disability & Chronic Illness", "Personal Mental Health"]);
        expect(post.createdAt).toBe(fixedTime);
        expect(post.draft).toBe(false);
        expect(post.edited).toBe(false);
        expect(post.comments).toBe(0);
        expect(post.likes).toBe(0);
    });

    test("throws error if username not found", async () => {
        User.findOne.mockResolvedValueOnce(null);

        await expect(createPost({
            title: "x",
            content: "y",
            tags: [],
            username: "ghost",
            draft: false
        })).rejects.toThrow("Username does not exist");
    });
});