import { Course } from "../../entity/Course";
import { Subcourse } from "../../entity/Subcourse";
import { mailjetTemplates, sendTemplateMail } from "../index";
import moment from "moment";
import { getLogger } from "log4js";

const logger = getLogger();

export async function sendSubcourseCancelNotifications(course: Course, subcourse: Subcourse) {
    // Find first lecture, subcourse lectures are eagerly loaded
    let firstLecture = subcourse.lectures[0].start;
    for(let i = 1; i < subcourse.lectures.length; i++) {
        if(subcourse.lectures[i].start < firstLecture) {
            firstLecture = subcourse.lectures[i].start;
        }
    }

    // Send mail or this lecture to each participant
    logger.info("Sending cancellation mails for subcourse " + subcourse.id + " of course " + course.name + " to " + subcourse.participants.length + " participants");
    for(let participant of subcourse.participants) {
        const mail = mailjetTemplates.COURSESCANCELLED({
            participantFirstname: participant.firstname,
            courseName: course.name,
            firstLectureDate: moment(firstLecture).format("DD.MM.YYYY"),
            firstLectureTime: moment(firstLecture).format("HH:mm")
        });
        await sendTemplateMail(mail, participant.email);
    }
}