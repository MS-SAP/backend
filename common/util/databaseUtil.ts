import { getManager } from "typeorm";
import { Pupil } from "../entity/Pupil";
import { Student } from "../entity/Student";
import { getTransactionLog } from "../transactionlog";
import VerifiedEvent from "../transactionlog/types/VerifiedEvent";

export const saveUser = async (user: Student | Pupil) => {
    const manager = getManager();
    await manager.save(user);
    await getTransactionLog().log(new VerifiedEvent(user));
};

export const getUserWithToken = async (token: string) => {
    const manager = getManager();
    const student = await manager.findOne(Student, {
        verification: token
    });

    if (student) return student;

    const pupil = await manager.findOne(Pupil, {
        verification: token
    });

    if (pupil) return student;

    return null;
};
export const getUserWithEmail = async (email: string) => {
    const manager = getManager();
    const student = await manager.findOne(Student, {
        email
    });

    if (student) return student;

    const pupil = await manager.findOne(Pupil, {
        email
    });

    if (pupil) return student;

    return null;
};
