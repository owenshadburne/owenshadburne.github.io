import { hasCookie } from  "/Include/Miscellaneous/cookies.js";

describe("Testing hasCookie", () => {
    beforeEach(() => {
        Object.defineProperty(document, 'cookie', {
            writable: true,
            value: 'uid=fakeID'
        });
    });

    test("Should have UID", () => {
        expect(hasCookie("uid")).toBe(true);
    });
});