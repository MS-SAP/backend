import { getLogger } from "log4js";
import { Student } from "../../common/entity/Student";
import { hashToken } from "../../common/util/hashing";
import { v4 as uuidv4 } from "uuid";
import { sendScreeningInvitation } from "../../common/administration/screening/initial-invitations";
import { Pupil } from "../../common/entity/Pupil";
import { saveUser } from "../../common/util/databaseUtil";
import moment from "moment";
import { sendLoginTokenMail } from "../../common/mails/login";

const logger = getLogger();

const generateAuthToken = async (
    user: Student | Pupil,
    saveUser: (user: Student | Pupil) => Promise<void>,
    sendEmail: (user: Student | Pupil, uuid: string) => Promise<void>
) => {
    const uuid = uuidv4();
    user.verification = null;
    user.verifiedAt = new Date();
    user.authToken = hashToken(uuid);
    user.authTokenSent = new Date();
    user.authTokenUsed = false;

    logger.info("Generated and sending UUID " + uuid + " to " + user.email);

    await saveUser(user);
    await sendEmail(user, uuid);

    return uuid;
};

const sendEmailWithScreeningInvitation = async (
    user: Student | Pupil,
    uuid: string
) => {
    await sendLoginTokenMail(user, uuid);
    if (user instanceof Student) {
        await sendScreeningInvitation(saveUser, user);
    }
};

export async function verifyToken(
    user: Student | Pupil
): Promise<string | null> {
    try {
        return await generateAuthToken(
            user,
            saveUser,
            sendEmailWithScreeningInvitation
        );
    } catch (e) {
        logger.error("Can't verify token: ", e.message);
        logger.debug(e);
        return null;
    }
}

const requestNewToken = async (
    user: Student | Pupil
): Promise<string | null> => {
    return await generateAuthToken(user, saveUser, sendLoginTokenMail);
};

const allowedToRequestToken = (user: Student | Pupil) => {
    // Deactivated users may not request tokens
    if (user.active == false) {
        logger.debug("Token requested by decativated user");
        return false;
    }

    // Always allow if never sent authTokens (only valid for legacy users)
    if (user.authTokenSent == null) {
        logger.debug("Token allowed, last sent was null");
        return true;
    }

    // If previous reset is less than 24 hours ago, disallow for unused tokens
    if (
        moment(user.authTokenSent).isAfter(moment().subtract(1, "days")) &&
        !user.authTokenUsed
    ) {
        logger.debug(
            "Token was disallowed, rate-limited while token was unused"
        );
        return false;
    }

    // If time is passed or token was used, always allow resetting
    logger.debug("Token allowed");
    return true;
};

export const tokenService = {
    verifyToken,
    requestNewToken,
    allowedToRequestToken,
    generateAuthToken
};
