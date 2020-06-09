import { randomBytes } from "crypto";
import { getLogger } from "log4js";
import { sendTemplateMail, mailjetTemplates } from "../../../../../common/mails";
import { Person } from "../../../../../common/entity/Person";

const logger = getLogger();

export function generateToken(): string {
    // Create Verification Token
    let bytes = randomBytes(75);
    // Base 64 => Token will be 100 chars long
    let token = bytes
        .toString("base64")
        .replace(/\//g, "-")
        .replace(/\+/g, "_");
    logger.debug("Generated token: ", token);
    return token;
}

export async function sendVerificationMail(person: Person) {
    const verificationUrl = "https://dashboard.corona-school.de/verify?token=";
    try {
        const mail = mailjetTemplates.VERIFICATION({
            confirmationURL: `${verificationUrl}${person.verification}`,
            personFirstname: person.firstname,
        });
        await sendTemplateMail(mail, person.email);
    } catch (e) {
        logger.error("Can't send verification mail: ", e.message);
        logger.debug(e);
    }
}