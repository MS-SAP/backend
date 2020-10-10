import { getLogger } from "log4js";
import { mailjetTemplates, sendTemplateMail } from "..";
import { Person } from "../../entity/Person";

const logger = getLogger();

export const sendLoginTokenMail = async (
    person: Person,
    token: string,
    redirectTo?: string
) => {
    const dashboardURL = `https://my.corona-school.de/login?token=${token}&path=${
        redirectTo ?? ""
    }`;

    try {
        const mail = mailjetTemplates.LOGINTOKEN({
            personFirstname: person.firstname,
            dashboardURL: dashboardURL
        });
        await sendTemplateMail(mail, person.email);
    } catch (e) {
        logger.error("Can't send login token mail: ", e.message);
        logger.debug(e);
    }
};
