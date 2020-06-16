import { getLogger } from 'log4js';
import { Request, Response } from 'express';
import { Pupil } from '../../../common/entity/Pupil';
import { Student } from '../../../common/entity/Student';
import { getTransactionLog } from '../../../common/transactionlog';
import { getManager } from 'typeorm';
import { Match } from '../../../common/entity/Match';
import { readFileSync } from 'fs';
import * as escape from 'escape-html';
import * as pdf from 'html-pdf';
import * as path from 'path';
import * as moment from "moment";
import CertificateRequestEvent from '../../../common/transactionlog/types/CertificateRequestEvent';

const logger = getLogger();

/**
 * @api {GET} /certificate/:student/:match getCertificate
 * @apiVersion 1.1.0
 * @apiDescription
 * Fetch a certificate
 *
 * This endpoint allows fetching a certificate (as PDF) with the second page customized for a pupil.
 * It is only available for students.
 *
 * @apiParam (URL Parameter) {string} student ID of the student
 * @apiParam (URL Parameter) {string} match UUID of the match
 *
 * @apiParam (Query Parameter) {number} endDate Unix Timestamp for the end date
 * @apiParam (Query Parameter) {string} subjects Must be a comma seperated string of the subjects. Only subjects that are matched are available
 * @apiParam (Query Parameter) {number} hoursPerWeek Hours per week helped
 * @apiParam (Query Parameter) {number} hoursTotal Total hours helped
 * @apiParam (Query Parameter) {string} medium Support medium
 * @apiParam (Query Parameter) {string} categories String of category texts for pupil's student description, separated by newlines
 *
 * @apiName getCertificate
 * @apiGroup Certificate
 *
 * @apiExample {curl} Curl
 * curl -k -i -X GET https://dashboard.corona-school.de/api/certificate/00000000-0000-0002-0001-1b4c4c526364/00000000-0000-0001-0001-1b4c4c526364
 *
 * @apiUse Authentication
 *
 * @apiUse StatusNoContent
 * @apiUse StatusBadRequest
 * @apiUse StatusUnauthorized
 * @apiUse StatusForbidden
 * @apiUse StatusInternalServerError
 */
export async function certificateHandler(req: Request, res: Response) {
    let status;

    try {
        // todo rename parameter pupil to match
        if (req.params.student != undefined && req.params.pupil != undefined && (res.locals.user instanceof Student || res.locals.user instanceof Pupil)) {

            let params = {
                endDate: req.query.endDate as string || moment().format("X") as string,
                subjects: req.query.subjects as string || "Mathematik, Biologie, Altgriechisch",
                hoursPerWeek: Number.parseInt(req.query.hoursPerWeek as string, 10) || 0,
                hoursTotal: Number.parseInt(req.query.hoursTotal as string, 10) || 0,
                medium: req.query.medium as string || "Taschenrechner mit Programmierfunktion",
                categories: req.query.categories as string || "Liste\nListe2\nListe3"
            };

            let certificate = await generateCertificate(res.locals.user, req.params.student, req.params.pupil, params);
            if (certificate.status == 200) {
                res.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Length': certificate.pdf.length
                });
                res.end(certificate.pdf);
            }
            status = certificate.status;
        } else {
            status = 500;
        }
    } catch (e) {
        logger.error("Unexpected format of express request: " + e.message);
        logger.debug(req, e);
        status = 500;
    }
    res.status(status).end();
}

async function generateCertificate(requestor: (Pupil | Student), studentid: string, matchuuid: string, params: { endDate: any, subjects: any, hoursPerWeek: any, hoursTotal: any, medium: any, categories: any }): Promise<{ status: number, pdf: any }> {
    const entityManager = getManager();
    const transactionLog = getTransactionLog();

    let ret = {
        status: 500,
        pdf: null
    };

    // Only students may request
    if (requestor instanceof Pupil) {
        ret.status = 403;
        return ret;
    }

    // Students may only request for themselves
    if (requestor.wix_id != studentid) {
        ret.status = 403;
        return ret;
    }

    // Students may only request for their matches
    let match = await entityManager.findOne(Match, { student: requestor, uuid: matchuuid });
    if (match == undefined) {
        ret.status = 400;
        return ret;
    }

    ret.pdf = await createPDFBinary(requestor, match.pupil, match.createdAt, params);
    ret.status = 200;

    await transactionLog.log(new CertificateRequestEvent(requestor, matchuuid));

    return ret;
}

function createPDFBinary(student: Student, pupil: Pupil, startDate: Date, params: { endDate: any, subjects: any, hoursPerWeek: any, hoursTotal: any, medium: any, categories: any }): Promise<Buffer> {
    let html = readFileSync("./assets/certificateTemplate.html", "utf8");
    const options = {
        "base": "file://" + path.resolve(__dirname + "/../../../../assets") + "/",
        "filename": "/tmp/html-pdf-"+student.id+"-"+pupil.id+"-"+moment().format("X")+".pdf"
    };

    // adjust variables
    // todo for 2021: replace %TPL% by <TPL>
    html = html.replace(/%NAMESTUDENT%/g, escape(student.firstname + " " + student.lastname));
    html = html.replace(/%NAMESCHUELER%/g, escape(pupil.firstname + " " + pupil.lastname));
    html = html.replace("%DATUMHEUTE%", moment().format("D.M.YYYY"));
    html = html.replace("%SCHUELERSTART%", moment(startDate,"X").format("D.M.YYYY"));
    html = html.replace("%SCHUELERENDE%", moment(params.endDate,"X").format("D.M.YYYY"));
    html = html.replace("%SCHUELERFAECHER%", escape(params.subjects).replace(/,/g, ", "));
    html = html.replace("%SCHUELERFREITEXT%", escape(params.categories).replace(/(?:\r\n|\r|\n)/g, '<br />'));
    html = html.replace("%SCHUELERPROWOCHE%", escape(params.hoursPerWeek));
    html = html.replace("%SCHUELERGESAMT%", escape(params.hoursTotal));
    html = html.replace("%MEDIUM%", escape(params.medium));

    // pdf.create(html, options).toFile("./assets/debug.pdf", (err, res) => { console.log(res)});

    return new Promise((resolve, reject) => {
        pdf.create(html, options).toBuffer((err, buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(buffer);
            }
        });
    });
}