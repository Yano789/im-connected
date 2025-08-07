const {validateBody,validateParams,validateQuery} = require("./../../middleware/validate.cjs")


describe("Validation Middleware with mocked schema.validate()", () => {
  const mockValidate = jest.fn();

  const mockSchema = {
    validate: mockValidate,
  };

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    return res;
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("validateBody - valid input calls next", () => {
    const req = { body: { test: "value" } };
    const res = mockRes();

    // simulate valid case
    mockValidate.mockReturnValue({ error: null, value: req.body });

    validateBody(mockSchema)(req, res, mockNext);

    expect(mockValidate).toHaveBeenCalledWith(req.body);
    expect(req.body).toEqual({ test: "value" });
    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("validateBody - invalid input returns 400", () => {
    const req = { body: {} };
    const res = mockRes();
    const error = { details: [{ message: "Invalid input" }] };

    // simulate invalid case
    mockValidate.mockReturnValue({ error, value: null });

    validateBody(mockSchema)(req, res, mockNext);

    expect(mockValidate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid input" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("validateParams - valid", () => {
    const req = { params: { id: "123" } };
    const res = mockRes();

    mockValidate.mockReturnValue({ error: null, value: req.params });

    validateParams(mockSchema)(req, res, mockNext);

    expect(mockValidate).toHaveBeenCalledWith(req.params);
    expect(mockNext).toHaveBeenCalled();
  });

    test("validateParams - invalid", () => {
    const req = { params: {} };
    const res = mockRes();
    const error = { details: [{ message: "Invalid input" }] };

    mockValidate.mockReturnValue({ error, value: null });

    validateParams(mockSchema)(req, res, mockNext);

    expect(mockValidate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid input" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("validateQuery - valid", () => {
    const req = { query: {id:"123"} };
    const res = mockRes();

    mockValidate.mockReturnValue({ error:null, value: req.query });

    validateQuery(mockSchema)(req, res, mockNext);

    expect(mockValidate).toHaveBeenCalledWith(req.query);
    expect(mockNext).toHaveBeenCalled();
  });  

  test("validateQuery - invalid", () => {
    const req = { query: {} };
    const res = mockRes();
    const error = { details: [{ message: "Missing query" }] };

    mockValidate.mockReturnValue({ error, value: null });

    validateQuery(mockSchema)(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing query" });
    expect(mockNext).not.toHaveBeenCalled();
  });
});