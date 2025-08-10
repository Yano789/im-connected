jest.mock("./../../domains/comment/model.cjs");
jest.mock("./../../domains/post/model.cjs");



const { deleteComment } = require("./../../domains/comment/controller.cjs");

const Comment = require("./../../domains/comment/model.cjs");
const { Post } = require("./../../domains/post/model.cjs");

describe("deleteComment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockComment = {
        commentId: 'c1',
        postId: 'p1',
        username: 'john',
        parentCommentId: null,
    };

    test('should delete a valid top-level comment and update post', async () => {
        Comment.findOne.mockResolvedValue(mockComment);
        Comment.updateMany.mockResolvedValue({});
        Comment.deleteOne.mockResolvedValue({});
        Post.updateOne.mockResolvedValue({});

        const result = await deleteComment({
            postId: 'p1',
            commentId: 'c1',
            username: 'john',
        });

        expect(Comment.findOne).toHaveBeenCalledWith({ commentId: 'c1' });
        expect(Comment.updateMany).toHaveBeenCalledWith(
            { parentCommentId: 'c1' },
            { parentCommentId: null }
        );
        expect(Comment.deleteOne).toHaveBeenCalledWith({ commentId: 'c1' });
        expect(Post.updateOne).toHaveBeenCalledWith({ postId: 'p1' }, { $inc: { comments: -1 } });
        expect(result).toEqual(mockComment);
    });

    test('should delete a nested comment and return it', async () => {
        const nestedComment = {
            ...mockComment,
            parentCommentId: 'parent123',
        };

        Comment.findOne.mockResolvedValue(nestedComment);
        Comment.updateMany.mockResolvedValue({});
        Comment.deleteOne.mockResolvedValue({});
        Post.updateOne.mockResolvedValue({});

        const result = await deleteComment({
            postId: 'p1',
            commentId: 'c1',
            username: 'john',
        });

        expect(Comment.updateMany).toHaveBeenCalledWith(
            { parentCommentId: 'c1' },
            { parentCommentId: 'parent123' }
        );
        expect(result).toEqual(nestedComment);
    });

    test('should throw error if comment does not exist', async () => {
        Comment.findOne.mockResolvedValue(null);

        await expect(
            deleteComment({ postId: 'p1', commentId: 'c1', username: 'john' })
        ).rejects.toThrow('Comment does not exist!');
    });

    test('should throw error if username does not match', async () => {
        Comment.findOne.mockResolvedValue({ ...mockComment, username: 'jane' });

        await expect(
            deleteComment({ postId: 'p1', commentId: 'c1', username: 'john' })
        ).rejects.toThrow('Invalid User!');
    });
});

