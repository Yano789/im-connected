jest.mock("./../../domains/post/model.cjs")







const {Post,allowedTags} = require("../../domains/post/model.cjs")

const {editDraft} = require("../../domains/post/controller.cjs")


describe("editing drafts",()=>{
    const fixedTime = 1752934590239;
    beforeEach(()=>{
        jest.clearAllMocks()
        jest.useFakeTimers().setSystemTime(new Date(fixedTime));
    })
    afterEach(() => {
        jest.useRealTimers()
    })

    const baseData = {
        postId: "post123",
        title: "Updated Title",
        content: "Updated Content",
        tags: [allowedTags[0], allowedTags[1]], // ✅ valid tags
        username: "user1",
        draft: true
    };
    test("successfully edits a draft", async () => {
        // Simulate existing draft found
        Post.findOne.mockResolvedValueOnce({
            postId: "post123",
            username: "user1",
            draft: true
        });

        // Simulate successful update
        Post.findOneAndUpdate.mockResolvedValueOnce({
            postId: "post123",
            title: baseData.title,
            content: baseData.content,
            tags: baseData.tags,
            username: baseData.username,
            createdAt: fixedTime,
            edited: true,
            draft: true,
            comments: 0,
            likes: 0
        });

        const result = await editDraft(baseData);

        expect(Post.findOne).toHaveBeenCalledWith({ postId: "post123" });
        expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
            { postId: "post123" },
            {
                title: baseData.title,
                content: baseData.content,
                tags: baseData.tags,
                createdAt: fixedTime,
                edited: true,
                draft: true
            },
            { new: true }
        );

        expect(result.title).toBe(baseData.title);
        expect(result.content).toBe(baseData.content);
        expect(result.tags).toEqual(baseData.tags);
        expect(result.createdAt).toBe(fixedTime);
        expect(result.edited).toBe(true);
    });

    test("throws error if draft does not exist", async () => {
        Post.findOne.mockResolvedValueOnce(null);

        await expect(editDraft(baseData)).rejects.toThrow("Draft does not exist");
    });

    test("throws error if user is unauthorized", async () => {
        Post.findOne.mockResolvedValueOnce({
            postId: "post123",
            username: "someoneElse",
            draft: true
        });

        await expect(editDraft(baseData)).rejects.toThrow("unauthorized");
    });

    test("throws error if post is already published", async () => {
        Post.findOne.mockResolvedValueOnce({
            postId: "post123",
            username: "user1",
            draft: false
        });

        await expect(editDraft(baseData)).rejects.toThrow("Cannot edit a published post");
    });

    test("throws error if update fails", async () => {
        Post.findOne.mockResolvedValueOnce({
            postId: "post123",
            username: "user1",
            draft: true
        });

        Post.findOneAndUpdate.mockResolvedValueOnce(null);

        await expect(editDraft(baseData)).rejects.toThrow("Post does not exist!");
    });

})