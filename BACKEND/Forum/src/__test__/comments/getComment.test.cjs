jest.mock("./../../domains/comment/model.cjs");

const { getComment } = require("./../../domains/comment/controller.cjs");

const Comment = require("./../../domains/comment/model.cjs");

describe('getComment', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test("should return comment",async()=>{
        const mockComment = {
            commentId: 'c1',
            postId: 'p1',
            username: 'john',
            content: 'This is a comment',
            createdAt: Date.now(),
        };

        Comment.findOne.mockResolvedValue(mockComment);

        const result = await getComment({ postId:"p1", commentId: 'c1' });

        expect(Comment.findOne).toHaveBeenCalledWith({ postId:"p1", commentId: 'c1' });
        expect(result).toEqual(mockComment);
    })

    test("should throw error if no PostId or commentId is provided",async()=>{
        await expect(getComment({ postId: null, commentId: 'c1' })).rejects.toThrow("No postId");
        await expect(getComment({ postId: 'p1', commentId: null })).rejects.toThrow("No commentId");
    })

    test("should throw error if comment not found",async()=>{
        Comment.findOne.mockResolvedValue(null);
        await expect(getComment({ postId:"p1", commentId: 'c1' })).rejects.toThrow("No such comment found");
    })

})


