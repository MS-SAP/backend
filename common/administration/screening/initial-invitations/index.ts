import { Student } from "../../../entity/Student";
import {
    sendFirstScreeningInvitationMail,
    sendFirstInstructorScreeningInvitationMail
} from "../../../mails/screening";

async function sendTutorInvitation(
    saveUser: (user: Student) => Promise<void>,
    student: Student
) {
    await sendFirstScreeningInvitationMail(student);
    student.lastSentScreeningInvitationDate = new Date();
    await saveUser(student);
}

async function sendInstructorInvitation(
    saveUser: (user: Student) => Promise<void>,
    student: Student
) {
    await sendFirstInstructorScreeningInvitationMail(student);
    student.lastSentInstructorScreeningInvitationDate = new Date();
    await saveUser(student);
}

export function sendScreeningInvitation(
    saveUser: (user: Student) => Promise<void>,
    student: Student
) {
    if (student.isInstructor) {
        return sendInstructorInvitation(saveUser, student);
    }

    return sendTutorInvitation(saveUser, student);
}
