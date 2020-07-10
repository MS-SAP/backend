import { getLogger } from 'log4js';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from "uuid";
import { hashToken } from "../../../common/util/hashing";

const logger = getLogger();

/**
 * @api {GET} /phone/verify
 * @apiVersion 1.0.0
 * @apiDescription
 * Verify a phone number by providing 
 *
 * @apiName verifyNumber
 * @apiGroup Phone
 *
 * @apiExample n/a
 *
 * @apiUse StatusBadRequest
 * @apiUse StatusInternalServerError
 */
export async function verifyNumber(req: Request, res: Response) {
    // TODO
    /* Check the amount of verificaiton request for this phone number
     * Check if verification code fits with the phone number
     * Return phonekey 
     * (use a phonekey to link the phone number to the user profile.
     *  A single use key avoids adding a verified number from someone else)
     */
    let phoneVerifiaction = new ApiGetPhoneVerification();
    
    let phoneNumber = req.get("PhoneNumber");
    let verifcationCode = req.get("VerificationCode");

    // Following code for debugging
    phoneVerifiaction.phoneNumber = phoneNumber;

    if(verifcationCode == '123456' && phoneNumber == '0123456789') {
        const uuid = uuidv4();
        phoneVerifiaction.phoneKey = hashToken(uuid);
        logger.info("Phone number " + phoneNumber + " verified with the verification code " + verifcationCode + " and generated phone key " + phoneVerifiaction.phoneKey);
    } else {
        logger.warn("Failed verification with wrong verification code " + verifcationCode + " for the phone number " + phoneNumber);
        phoneVerifiaction.phoneKey = '';
    } 
    //

    res.json(phoneVerifiaction);
    res.status(200).end();
}

/**
 * @api {GET} /phone/requestverify
 * @apiVersion 1.0.0
 * @apiDescription
 * Request to send a verification SMS to the phone number 
 *
 * @apiName requestVerifyNumber
 * @apiGroup Phone
 *
 * @apiExample n/a
 *
 * @apiUse StatusBadRequest
 * @apiUse StatusInternalServerError
 */
export async function requestVerifyNumber(req: Request, res: Response) {
    // TODO
    /* Check
     * Generate verification code 
     * Send verification code to the phone number
     * Return that the verification code was send to the phone number and
     * next date to resend a new verification code
     */
    let phoneVerifiaction = new ApiGetPhoneVerification();
    let phoneNumber = req.get("PhoneNumber");
 
    // Following code for debugging
    phoneVerifiaction.phoneNumber = phoneNumber;
    phoneVerifiaction.sentRequest = true;
    phoneVerifiaction.nextRequest = new Date();
    //

    res.json(phoneVerifiaction);
    res.status(200).end();
}

class ApiGetPhoneVerification {
    phoneNumber: string;
    phoneKey: string;
    sentRequest: boolean;
    nextRequest: Date;
}
