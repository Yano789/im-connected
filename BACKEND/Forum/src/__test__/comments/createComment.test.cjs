jest.mock("./../../domains/comment/model.cjs");
jest.mock("./../../domains/post/model.cjs");
jest.mock("./../../domains/user/model.cjs");
jest.mock("./../../utils/hashData.cjs");



const { createComment } = require("./../../domains/comment/controller.cjs");

const Comment = require("./../../domains/comment/model.cjs");
const { Post } = require("./../../domains/post/model.cjs");
const User = require("./../../domains/user/model.cjs");
const { hashData } = require("./../../utils/hashData.cjs");




describe('createComment', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should create a comment when valid data is provided', async () => {
        User.findOne.mockResolvedValue({ username: 'john' });
        Post.updateOne.mockResolvedValue({ matchedCount: 1 });
        hashData.mockResolvedValue('fakeHashedId');
        const savedComment = { commentId: 'fakeHashedId', content: 'Nice post' };
        Comment.mockImplementation(() => ({
            save: jest.fn().mockResolvedValue(savedComment),
        }));

        const data = {
            postId: 'post1',
            parentCommentId: null,
            username: 'john',
            content: 'Nice post',
        };

        const result = await createComment(data);
        expect(result).toEqual(savedComment);
    });

    it('should throw error if username does not exist', async () => {
        User.findOne.mockResolvedValue(null);
        await expect(
            createComment({ postId: 'x', parentCommentId: null, username: 'ghost', content: 'x' })
        ).rejects.toThrow('Username does not exist');
    });

    it('should throw error if post is not found', async () => {
        User.findOne.mockResolvedValue({ username: 'john' });
        Post.updateOne.mockResolvedValue({ matchedCount: 0 });
        await expect(
            createComment({ postId: 'x', parentCommentId: null, username: 'john', content: 'x' })
        ).rejects.toThrow('Post not found');
    });

    it('should throw error if comment fails to save', async () => {
        User.findOne.mockResolvedValue({ username: 'john' });
        Post.updateOne.mockResolvedValue({ matchedCount: 1 });
        hashData.mockResolvedValue('hashed');
        Comment.mockImplementation(() => ({
            save: jest.fn().mockResolvedValue(null),
        }));

        await expect(
            createComment({ postId: 'x', parentCommentId: null, username: 'john', content: 'x' })
        ).rejects.toThrow('Created Comment does not exist');
    });
});