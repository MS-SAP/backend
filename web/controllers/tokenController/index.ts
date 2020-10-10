import { getLogger } from "log4js";
import { Request, Response } from "express";
import { tokenService } from "../../services/tokenService";
import {
    getUserWithEmail,
    getUserWithToken
} from "../../../common/util/databaseUtil";

const logger = getLogger();

/**
 * @api {POST} /token verifyToken
 * @apiVersion 1.0.1
 * @apiDescription
 * Try to verify a token.
 *
 * This endpoint allows verifying a newly created user account and generating its first authToken.
 *
 * @apiName verifyToken
 * @apiGroup Token
 *
 * @apiExample {curl} Curl
 * curl -k -i -X POST -H "Content-Type: application/json" https://api.corona-school.de/api/token/ -d "<REQUEST>"
 *
 * @apiUse ContentType
 * @apiUse VerifyToken
 * @apiUse AuthToken
 *
 * @apiUse StatusOk
 * @apiUse StatusBadRequest
 * @apiUse StatusInternalServerError
 */
export async function verifyTokenHandler(req: Request, res: Response) {
    if (!req.body.token) {
        return res
            .status(400)
            .send({ error: "token is missing in request." })
            .end();
    }

    const token: string = req.body.token;
    const user = await getUserWithToken(token);
    if (!user) {
        return res
            .status(400)
            .send({ error: "can't find user with token." })
            .end();
    }

    const authToken = await tokenService.verifyToken(user);
    if (!authToken) {
        return res.status(400).send({ error: "token is not valid." }).end();
    }

    return res.status(200).send({ token: authToken });
}

/**
 * @api {GET} /token requestNewToken
 * @apiVersion 1.0.1
 * @apiDescription
 * Request a new token for the user account specified by email.
 *
 * This endpoint allows requesting a new token send via email to the user.
 * A user can only request a new token, if he doesn't have an unused token from the last 24h.
 *
 * @apiName requestNewToken
 * @apiGroup Token
 *
 * @apiParam (Query Parameter) {string} email Email address of the user (case insensitive)
 * @apiParam (Query Parameter) {string} redirectTo route to the page the Token-Link shall lead to (optional)
 *
 * @apiExample {curl} Curl
 * curl -k -i -X GET "https://api.corona-school.de/api/token?email=info%40example.org&path=/courses/2"
 *
 * @apiUse StatusNoContent
 * @apiUse StatusBadRequest
 * @apiUse StatusUnauthorized
 * @apiUse StatusNotFound
 * @apiUse StatusInternalServerError
 */
export async function getNewTokenHandler(req: Request, res: Response) {
    try {
        if (!req.query.email) {
            return res
                .status(400)
                .send({ error: "emai is missing in request." })
                .end();
        }

        if (
            req.query.redirectTo !== undefined &&
            typeof req.query.redirectTo !== "string"
        ) {
            return res
                .status(400)
                .send({ error: "redirectTo is missing in request," })
                .end();
        }

        const email = req.query.email.trim().toLowerCase();

        const user = await getUserWithEmail(email);
        if (!user) {
            return res
                .status(400)
                .send({ error: "can't find user with given email" })
                .end();
        }
        if (!tokenService.allowedToRequestToken(user)) {
            return res
                .status(400)
                .send({ error: "user is not allowed to request a new token." })
                .end();
        }
        await tokenService.requestNewToken(user);
        res.status(204).end();
    } catch (e) {
        logger.error("Failed to send or safe new auth token: ", e.message);
        logger.debug(e);
        res.status(500).end();
    }
}
