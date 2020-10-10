import expect from "expect.js";
import { Pupil } from "../../common/entity/Pupil";
import { Student } from "../../common/entity/Student";
import { tokenService } from "./tokenService";

const mockSendEmail = (user: Student | Pupil, uuid: string): any => {};

describe("The token service", () => {
    it("generates an student authToken correctly", async () => {
        const mockSaveUser = (user: Student | Pupil): any => {};

        const student = new Student();
        const authToken = await tokenService.generateAuthToken(
            student,
            mockSaveUser,
            mockSendEmail
        );

        expect(authToken).to.be.ok();
    });
    it("generates an pupil authToken correctly", async () => {
        const mockSaveUser = (user: Student | Pupil): any => {};

        const student = new Pupil();
        const authToken = await tokenService.generateAuthToken(
            student,
            mockSaveUser,
            mockSendEmail
        );

        expect(authToken).to.be.ok();
    });
    it("saves students authToken correctly", async () => {
        const mockSaveUser = (user: Student | Pupil): any => {
            expect(user.verification).to.be(null);
            expect(user.authToken).to.be.ok();
            expect(user.verifiedAt).to.be.ok();
            expect(user.authTokenSent).to.be.ok();
            expect(user.authTokenUsed).to.be(false);
        };

        const student = new Student();
        await tokenService.generateAuthToken(
            student,
            mockSaveUser,
            mockSendEmail
        );
    });
    it("saves pupils authToken correctly", async () => {
        const mockSaveUser = (user: Student | Pupil): any => {
            expect(user.verification).to.be(null);
            expect(user.authToken).to.be.ok();
            expect(user.verifiedAt).to.be.ok();
            expect(user.authTokenSent).to.be.ok();
            expect(user.authTokenUsed).to.be(false);
        };

        const pupil = new Pupil();
        await tokenService.generateAuthToken(
            pupil,
            mockSaveUser,
            mockSendEmail
        );
    });
    describe("allows to request a token", () => {
        it("when the user is legacy and never had an authToken", () => {
            const student = new Student();
            student.active = true;
            student.authTokenSent = null;

            const result = tokenService.allowedToRequestToken(student);
            expect(result).to.be(true);
        });
        it("when the last token reset is longer than 24h", () => {
            const student = new Student();
            student.active = true;
            student.authTokenSent = new Date("January 01, 2019");

            const result = tokenService.allowedToRequestToken(student);
            expect(result).to.be(true);
        });
    });
    describe("does not allow to request a token", () => {
        it("when the user is deactivated", () => {
            const student = new Student();
            student.active = false;
            student.authTokenSent = null;

            const result = tokenService.allowedToRequestToken(student);
            expect(result).to.be(false);
        });
        it("when the last token reset is less than 24h ago", () => {
            const student = new Student();
            student.active = true;
            student.authTokenSent = new Date();

            const result = tokenService.allowedToRequestToken(student);
            expect(result).to.be(false);
        });
    });
});
