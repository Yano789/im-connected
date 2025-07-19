const {modeLimit} = require("../../domains/post/controller.cjs")


describe("modeLimit", () => {
    const samplePosts = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }));

    test("returns 5 posts when mode is 'Big'", async () => {
        const result = await modeLimit({ post: samplePosts, mode: "Big" });
        expect(result).toHaveLength(5);
        expect(result).toEqual(samplePosts.slice(0, 5));
    });

    test("returns 10 posts when mode is not 'Big'", async () => {
        const result = await modeLimit({ post: samplePosts, mode: "default" });
        expect(result).toHaveLength(10);
        expect(result).toEqual(samplePosts.slice(0, 10));
    });

    test("returns all posts if less than 10 and mode not 'Big'", async () => {
        const shortList = samplePosts.slice(0, 8);
        const result = await modeLimit({ post: shortList, mode: "default" });
        expect(result).toHaveLength(8);
        expect(result).toEqual(shortList);
    });
});