jest.mock("./../../domains/post/model.cjs")


const { Post} = require("../../domains/post/model.cjs")


const {getFilteredPosts} = require("../../domains/post/controller.cjs")



describe("getFilteredPosts", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const samplePosts = [
        { postId: "1", tags: ["Physical Disability & Chronic Illness"], draft: false, createdAt: new Date(1), likes: 5, comments: 2 },
        { postId: "2", tags: ["Personal Mental Health"], draft: false, createdAt: new Date(2), likes: 10, comments: 1 },
        { postId: "3", tags: ["Physical Disability & Chronic Illness", "Personal Mental Health"], draft: false, createdAt: new Date(3), likes: 8, comments: 5 },
    ];

    test("fetch posts filtered by single tag and sorted by latest", async () => {
        Post.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([samplePosts[0]])
        });

        const result = await getFilteredPosts({ tags: ["Physical Disability & Chronic Illness"], sort: "latest" });

        expect(Post.find).toHaveBeenCalledWith({ tags: "Physical Disability & Chronic Illness", draft: false });
        expect(result).toEqual([samplePosts[0]]);
    });

    test("fetch posts filtered by exactly two tags and sorted by most likes", async () => {
        Post.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue([samplePosts[2]])
        });

        const tags = ["Physical Disability & Chronic Illness", "Personal Mental Health"];
        const result = await getFilteredPosts({ tags, sort: "most likes" });

        expect(Post.find).toHaveBeenCalledWith({ tags: { $in: tags, $size: 2 }, draft: false });
        expect(result).toEqual([samplePosts[2]]);
    });

    test("fetch posts with no tags filter, default sort latest", async () => {
        Post.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(samplePosts)
        });

        const result = await getFilteredPosts({ tags: [], sort: "latest" });

        expect(Post.find).toHaveBeenCalledWith({ draft: false });
        expect(result).toEqual(samplePosts);
    });

    test("handles unknown sort option by sorting by latest", async () => {
        Post.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(samplePosts)
        });

        const result = await getFilteredPosts({ tags: [], sort: "unknown sort" });

        expect(Post.find).toHaveBeenCalledWith({ draft: false });
        expect(result).toEqual(samplePosts);
    });

    test("throws an error on database failure", async () => {
        Post.find.mockImplementation(() => {
            throw new Error("DB error");
        });

        await expect(getFilteredPosts({ tags: [] })).rejects.toThrow("Failed to filter/sort posts: DB error");
    });
});