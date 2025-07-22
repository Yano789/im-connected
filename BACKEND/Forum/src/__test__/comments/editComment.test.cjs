jest.mock("./../../domains/comment/model.cjs");


const { editComment } = require("./../../domains/comment/controller.cjs");

const Comment = require("./../../domains/comment/model.cjs");

describe('editComment', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should edit a comment", async() =>{
        const mockComment = {
            commentId: 'c1',
            postId: 'p1',
            parentCommentId: null,
            username: 'john',
            content: 'This is a comment',
            createdAt: Date.now(),
            edited: false,
        };

        const mockData = {
            commentId: 'c1',
            content: 'Updated comment',
            username: 'john',
        }

        Comment.findOne.mockResolvedValue(mockComment);
        Comment.findOneAndUpdate.mockResolvedValue({
            ...mockComment,
            content: mockData.content,
            edited: true,
        });

        const result = await editComment(mockData);

        expect(Comment.findOne).toHaveBeenCalledWith({ commentId: 'c1' });
        expect(Comment.findOneAndUpdate).toHaveBeenCalledWith(
            { commentId: 'c1' },
            { content: mockData.content, createdAt: expect.any(Number), edited: true },
            { new: true }
        );
        expect(result.content).toBe(mockData.content);
    })

    test("should throw error if comment not found", async() => {
        Comment.findOne.mockResolvedValue(null);
        await expect(editComment({ commentId: 'c1', content: 'Updated comment', username: 'john' }))
            .rejects.toThrow("Comment not found");
    })

    test("should throw error if user is not the owner of the comment", async() => {
        const mockComment = {
            commentId: 'c1',
            postId: 'p1',
            parentCommentId: null,
            username: 'john',
            content: 'This is a comment',
            createdAt: Date.now(),
            edited: false,
        };

        Comment.findOne.mockResolvedValue(mockComment);
        await expect(editComment({ commentId: 'c1', content: 'Updated comment', username: 'doe' }))
            .rejects.toThrow("Invalid User!");
    })

    test("should throw error if updated comment does not exist", async() => {
        const mockComment = {
            commentId: 'c1',
            postId: 'p1',
            parentCommentId: null,
            username: 'john',
            content: 'This is a comment',
            createdAt: Date.now(),
            edited: false,
        };

        Comment.findOne.mockResolvedValue(mockComment);
        Comment.findOneAndUpdate.mockResolvedValue(null);

        await expect(editComment({ commentId: 'c1', content: 'Updated comment', username: 'john' }))
            .rejects.toThrow("Updated comment does not exist!");
    })
})
