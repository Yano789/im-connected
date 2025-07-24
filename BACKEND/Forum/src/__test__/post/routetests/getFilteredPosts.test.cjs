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

const {modeLimit, getFilteredPosts} = require("./../../../domains/post/controller.cjs")


const postRoutes = require("../../../domains/post/routes.cjs");


describe("get Filtered Posts)", () => {
    let app;

    const mockPost1 = {
        postId: "post123",
        title: "Support Resources for Pediatric Mental Health",
        content: "Here are some useful clinics and support groups for children experiencing mental health issues.",
        username: "caregiverMom",
        tags: ["Pediatric Care", "Mental Disability"],
        createdAt: "2025-07-22T14:44:57.451Z",
        edited: false,
        comments: 3,
        likes: 12,
        draft: false,
        media: [
            {
                url: "http://cloudinary.com/media/image1.jpg",
                type: "image",
                public_id: "img_pediatric_001"
            }
        ]
    };

    const mockPost2 = {
        postId: "post456",
        title: "Navigating End of Life Care with Dignity",
        content: "A guide on the support systems available for end-of-life care, including hospice options and financial help.",
        username: "nurseHelper",
        tags: ["End of Life Care", "Financial & Legal Help"],
        createdAt: "2025-07-22T14:44:57.451Z",
        edited: true,
        comments: 5,
        likes: 20,
        draft: false,
        media: [
            {
                url: "http://cloudinary.com/media/video1.mp4",
                type: "video",
                public_id: "vid_eol_guide_001"
            },
            {
                url: "http://cloudinary.com/media/image2.jpg",
                type: "image",
                public_id: "img_eol_002"
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

    test("should return filtered posts with default filter", async () => {
        const mockPosts = [mockPost1, mockPost2];
        getFilteredPosts.mockResolvedValueOnce(mockPosts);
        modeLimit.mockResolvedValueOnce(mockPosts);

        const response = await request(app).get("/api/post");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPosts);
        expect(getFilteredPosts).toHaveBeenCalledWith({
            tags: [],
            sort: "latest",
            source: "default",
            username: null
        });
        expect(modeLimit).toHaveBeenCalledWith({
            post: mockPosts,
            mode: "default"
        });
    });

    test("should return filtered posts with personalised filter and tags", async () => {
        const mockPosts = [mockPost1];
        getFilteredPosts.mockResolvedValueOnce(mockPosts);
        modeLimit.mockResolvedValueOnce(mockPosts);

        const response = await request(app)
            .get("/api/post")
            .set("x-test-username", "caregiverMom") 
            .query({
                filter: "Pediatric Care",
                source: "personalised",
                sort: "latest",
                mode: "default"
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPosts);
        expect(getFilteredPosts).toHaveBeenCalledWith({
            tags: ["Pediatric Care"],
            sort: "latest",
            source: "personalised",
            username: "caregiverMom"
        });
        expect(modeLimit).toHaveBeenCalledWith({
            post: mockPosts,
            mode: "default"
        });
    });
});