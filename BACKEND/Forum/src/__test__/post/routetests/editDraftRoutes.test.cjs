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

const {editDraft} = require("./../../../domains/post/controller.cjs")

const postRoutes = require("../../../domains/post/routes.cjs");

describe("create Post", () => {
    let app;
    const postId = "post123";

    const updatedDraftMock = {
        postId: "post123",
        title: "Updated Title",
        content: "Updated content for the draft.",
        username: "testUser",
        tags: ["Pediatric Care"],
        createdAt: new Date("2025-07-22T14:44:57.451Z"),
        edited: true,
        comments: 0,
        likes: 0,
        draft: true,
        media: [
            {
                url: "http://cloudinary.com/media/image.jpg",
                type: "image",
                public_id: "image1"
            },
            {
                url: "http://cloudinary.com/media/video.mp4",
                type: "video",
                public_id: "video1"
            }
        ]
    };

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use(cookieParser());
        app.use("/api/post", postRoutes);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should edit a draft successfully with media files and mediaToRemove", async () => {
        editDraft.mockResolvedValueOnce({
            ...updatedDraftMock,
            createdAt: updatedDraftMock.createdAt.toISOString(), 
        });

        const response = await request(app)
            .put(`/api/post/myDrafts/${postId}/edit`)
            .send({
                title: "Updated Title",
                content: "Updated content for the draft.",
                tags: ["Pediatric Care"],  
                mediaToRemove: ["old_media_id_1"]
            });

        expect(response.status).toBe(200);
        expect(editDraft).toHaveBeenCalledWith({
            postId: "post123",
            title: "Updated Title",
            content: "Updated content for the draft.",
            tags: ["Pediatric Care"],
            username: "testUser",
            draft: true,
            mediaToRemove: ["old_media_id_1"],
            newMedia: [
                {
                    url: "http://cloudinary.com/media/image.jpg",
                    type: "image",
                    public_id: "image1"
                },
                {
                    url: "http://cloudinary.com/media/video.mp4",
                    type: "video",
                    public_id: "video1"
                }
            ]
        });

        expect(response.body).toEqual({
            ...updatedDraftMock,
            createdAt: updatedDraftMock.createdAt.toISOString()
        });
    });
});