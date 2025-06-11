jest.setTimeout(10000);

afterEach(() => {
    jest.clearAllMocks();
});

console.error = jest.fn();