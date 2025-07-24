jest.mock("./../../../domains/post/controller.cjs", () => ({
    createPost: jest.fn(),
    editDraft: jest.fn(),
    deletePost: jest.fn(),
    modeLimit: jest.fn(),
    getFilteredPosts: jest.fn(),
    getPostWithComment: jest.fn(),
    likePosts: jest.fn(),
    getAllMyPosts: jest.fn(),
    getAllMyDrafts: jest.fn(),
    getMyDraft: jest.fn(),
    deleteDrafts: jest.fn(),
}));

jest.mock("./../../../middleware/auth.cjs", () =>
    jest.fn((req, res, next) => {
        req.currentUser = { username: req.headers["x-test-username"] || "testUser" };
        next();
    })
);

jest.mock("./../../../middleware/validate.cjs", () => ({
    validateBody: () => (req, res, next) => next(),
    validateParams: () => (req, res, next) => next(),
    validateQuery: () => (req, res, next) => next(),
}));

jest.mock("./../../../utils/validators/postValidator.cjs", () => ({
    postDraftSchema: {},
    querySchema: {},
    paramsSchema: {},
}));

jest.mock("./../../../config/storage.cjs", () => ({
    array: () => (req, res, next) => {
        req.files = [
            {
                path: "http://cloudinary.com/media/image.jpg",
                mimetype: "image/jpeg",
                filename: "image1"
            },
            {
                path: "http://cloudinary.com/media/video.mp4",
                mimetype: "video/mp4",
                filename: "video1"
            }
        ];
        next();
    }
}));

jest.mock("./../../../middleware/normalizeTags.cjs", () =>
    jest.fn((req, res, next) => next())
);

jest.mock("./../../../config/cloudinary.cjs", () => ({
    cloudinary: {
        uploader: {
            destroy: jest.fn(),
        },
    },
}));
const express = require("express");
const request = require("supertest");
const cookieParser = require("cookie-parser");

const {deleteDrafts } = require("./../../../domains/post/controller.cjs")


const postRoutes = require("../../../domains/post/routes.cjs");



describe("DELETE /myDrafts/:post/delete", () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use(cookieParser());
        app.use("/api/post", postRoutes);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should delete a draft post successfully", async () => {
        const postId = "draft123";

        const mockDeletedDraft = {
            postId: postId,
            title: "Draft Title",
            content: "Draft content",
            username: "testUser",
            tags: ["Mental Disability"],
            createdAt: new Date("2025-07-22T12:00:00Z"), // example date
            edited: true,
            comments: 0,     // default value
            likes: 0,        // default value
            draft: true,
            media: [
                {
                    url: "http://cloudinary.com/media/draft_image1.jpg",
                    type: "image",
                    public_id: "draft_image1"
                }
            ]
        };

        // Mock the deleteDrafts controller function to resolve with mockDeletedDraft
        deleteDrafts.mockResolvedValueOnce(mockDeletedDraft);

        const response = await request(app).delete(`/api/post/myDrafts/${postId}/delete`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
      expect.objectContaining({
        ...mockDeletedDraft,
        createdAt: mockDeletedDraft.createdAt.toISOString(),
      }))
        expect(deleteDrafts).toHaveBeenCalledWith({ username: "testUser", postId });
    });

    test("should return 400 if deleteDrafts throws error", async () => {
        const postId = "draft123";

        deleteDrafts.mockRejectedValueOnce(new Error("Failed to delete draft"));

        const response = await request(app).delete(`/api/post/myDrafts/${postId}/delete`);

        expect(response.status).toBe(400);
        expect(response.text).toBe("Failed to delete draft");
        expect(deleteDrafts).toHaveBeenCalledWith({ username: "testUser", postId });
    });
});