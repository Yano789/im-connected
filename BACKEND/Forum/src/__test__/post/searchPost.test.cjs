const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Post} = require("../../domains/post/model.cjs")

const {searchPosts} = require("../../domains/post/controller.cjs");


beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear all documents before each test
  await Post.deleteMany({});
});

describe('searchPosts()', () => {
  it('should return matching posts by title (case-insensitive, partial)', async () => {
    await Post.create([
      { postId: '1', title: 'Hello World', draft: false },
      { postId: '2', title: 'hello universe', draft: false },
      { postId: '3', title: 'Goodbye', draft: false },
      { postId: '4', title: 'Hidden Draft', draft: true },
    ]);

    const results = await searchPosts('hello');

    expect(results).toHaveLength(2);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ postId: '1', title: 'Hello World' }),
        expect.objectContaining({ postId: '2', title: 'hello universe' }),
      ])
    );
  });

  it('should return an empty array for non-matching search', async () => {
    await Post.create([{ postId: '1', title: 'No Match Here', draft: false }]);
    const results = await searchPosts('Unmatched');
    expect(results).toEqual([]);
  });

  it('should return an empty array if search is missing or not a string', async () => {
    expect(await searchPosts(null)).toEqual([]);
    expect(await searchPosts(undefined)).toEqual([]);
    expect(await searchPosts({})).toEqual([]);
    expect(await searchPosts(123)).toEqual([]);
  });

  it('should escape regex special characters in input', async () => {
    await Post.create([{ postId: '1', title: 'Welcome (Beta)', draft: false }]);
    const results = await searchPosts('(Beta)');
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(expect.objectContaining({ title: 'Welcome (Beta)' }));
  });

  it('should not return draft posts', async () => {
    await Post.create([
      { postId: '1', title: 'Visible Post A ', draft: false },
      { postId: '2', title: 'Visible Post', draft: true },
    ]);
    const results = await searchPosts('visible');
    expect(results).toHaveLength(1);
    expect(results[0].postId).toBe('1');
  });
});