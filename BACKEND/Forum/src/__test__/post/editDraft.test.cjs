jest.mock("../../domains/post/model.cjs");
jest.mock("cloudinary", () => ({
  v2: {
    uploader: {
      destroy: jest.fn()
    }
  }
}));

const { Post, allowedTags } = require("../../domains/post/model.cjs");
const { v2: cloudinary } = require("cloudinary");
const { editDraft } = require("../../domains/post/controller.cjs");

describe("editing drafts", () => {
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

  test("successfully edits a draft", async () => {
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

  test("handles media removal and addition", async () => {
    const mockSave = jest.fn().mockResolvedValue(true);

    const mockDraft = {
      postId: "post123",
      username: "user1",
      draft: true,
      media: [
        { public_id: "keep_me", type: "image" },
        { public_id: "remove_me", type: "video" }
      ],
      save: mockSave
    };

    Post.findOne.mockResolvedValueOnce(mockDraft);
    cloudinary.uploader.destroy.mockResolvedValueOnce({ result: "ok" });

    const result = await editDraft({
      ...baseData,
      mediaToRemove: ["remove_me"],
      newMedia: [{ public_id: "new_file", type: "image" }]
    });

    expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(1);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("remove_me", { resource_type: "video" });

    expect(result.media).toEqual([
      { public_id: "keep_me", type: "image" },
      { public_id: "new_file", type: "image" }
    ]);
    expect(mockSave).toHaveBeenCalled();
  });

  test("handles multiple media removals", async () => {
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
    cloudinary.uploader.destroy.mockResolvedValue({ result: "ok" });

    const result = await editDraft({
      ...baseData,
      mediaToRemove: ["remove1", "remove2"],
      newMedia: []
    });

    expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("remove1", { resource_type: "image" });
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("remove2", { resource_type: "video" });

    expect(result.media).toEqual([
      { public_id: "keep", type: "image" }
    ]);
    expect(mockSave).toHaveBeenCalled();
  });

  test("handles errors in cloudinary destroy without failing", async () => {
    const mockSave = jest.fn().mockResolvedValue(true);

    const mockDraft = {
      postId: "post123",
      username: "user1",
      draft: true,
      media: [
        { public_id: "remove_me", type: "image" }
      ],
      save: mockSave
    };

    Post.findOne.mockResolvedValueOnce(mockDraft);
    cloudinary.uploader.destroy.mockRejectedValueOnce(new Error("Cloudinary error"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await editDraft({
      ...baseData,
      mediaToRemove: ["remove_me"],
      newMedia: []
    });

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("remove_me", { resource_type: "image" });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error deleting media remove_me"),
      expect.any(Error)
    );
    expect(result.media).toEqual([]);
    expect(mockSave).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
