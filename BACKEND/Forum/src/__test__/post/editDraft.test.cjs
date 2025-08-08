jest.mock("../../domains/post/model.cjs");

const mockDelete = jest.fn().mockResolvedValue();

jest.mock("../../config/googleConfig.cjs", () => ({
  gcsClient: {
    bucket: {
      file: jest.fn(() => ({
        delete: mockDelete,
      })),
    },
  },
  url: jest.fn().mockImplementation(async (publicId) => {
    return `http://example.com/${publicId}.jpg`;
  }),
}));

const { Post, allowedTags } = require("../../domains/post/model.cjs");
const { editDraft } = require("../../domains/post/controller.cjs");

describe("editing drafts with GCS media only", () => {
  const fixedTime = 1752934590239;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date(fixedTime));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const baseData = {
    postId: "post123",
    title: "Updated Title",
    content: "Updated Content",
    tags: [allowedTags[0], allowedTags[1]],
    username: "user1",
    draft: true
  };

  test("successfully edits a draft without media removal", async () => {
    const mockSave = jest.fn().mockResolvedValue(true);

    Post.findOne.mockResolvedValueOnce({
      postId: "post123",
      username: "user1",
      draft: true,
      media: [],
      save: mockSave
    });

    const result = await editDraft({
      ...baseData,
      newMedia: [],
      mediaToRemove: []
    });

    expect(Post.findOne).toHaveBeenCalledWith({ postId: "post123" });
    expect(mockSave).toHaveBeenCalled();
    expect(result.title).toBe(baseData.title);
    expect(result.content).toBe(baseData.content);
    expect(result.tags).toEqual(baseData.tags);
    expect(result.edited).toBe(true);
    expect(result.draft).toBe(true);
  });

  test("deletes media from GCS and edits draft", async () => {
    const mockSave = jest.fn().mockResolvedValue(true);

    const mockDraft = {
      postId: "post123",
      username: "user1",
      draft: true,
      media: [
        { public_id: "remove1", type: "image" },
        { public_id: "remove2", type: "video" },
        { public_id: "keep", type: "image" }
      ],
      save: mockSave
    };

    Post.findOne.mockResolvedValueOnce(mockDraft);

    const result = await editDraft({
      ...baseData,
      mediaToRemove: ["remove1", "remove2"],
      newMedia: []
    });

    // Expect GCS file.delete to be called for each mediaToRemove
    expect(mockDelete).toHaveBeenCalledTimes(2);
    expect(require("../../config/googleConfig.cjs").gcsClient.bucket.file).toHaveBeenCalledWith("remove1");
    expect(require("../../config/googleConfig.cjs").gcsClient.bucket.file).toHaveBeenCalledWith("remove2");

    // Check that media array in the draft excludes the removed ones and includes the kept media only
    expect(result.media).toEqual([{ public_id: "keep", type: "image" }]);
    expect(mockSave).toHaveBeenCalled();
  });

  test("handles errors deleting media from GCS gracefully", async () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const mockDraft = {
      postId: "post123",
      username: "user1",
      draft: true,
      media: [{ public_id: "remove_err", type: "image" }],
      save: mockSave
    };

    Post.findOne.mockResolvedValueOnce(mockDraft);
    mockDelete.mockRejectedValueOnce(new Error("GCS deletion failed"));

    const result = await editDraft({
      ...baseData,
      mediaToRemove: ["remove_err"],
      newMedia: []
    });

    expect(mockDelete).toHaveBeenCalledWith();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error deleting media remove_err"),
      expect.any(Error)
    );

    expect(result.media).toEqual([]);
    expect(mockSave).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test("throws error if draft does not exist", async () => {
    Post.findOne.mockResolvedValueOnce(null);
    await expect(editDraft(baseData)).rejects.toThrow("Draft does not exist");
  });

  test("throws error if user unauthorized", async () => {
    Post.findOne.mockResolvedValueOnce({
      postId: "post123",
      username: "someoneElse",
      draft: true
    });
    await expect(editDraft(baseData)).rejects.toThrow("Unauthorized");
  });

  test("throws error if post already published", async () => {
    Post.findOne.mockResolvedValueOnce({
      postId: "post123",
      username: "user1",
      draft: false
    });
    await expect(editDraft(baseData)).rejects.toThrow("Cannot edit a published post");
  });
});
