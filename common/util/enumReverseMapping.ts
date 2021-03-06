import { State } from "../entity/State";
import { SchoolType } from "../entity/SchoolType";
import { MentoringCategory } from "../mentoring/categories";
import { ProjectField } from "../jufo/projectFields";
import { TuteeJufoParticipationIndication, TutorJufoParticipationIndication } from "../jufo/participationIndication";
import { TeacherModule } from "../entity/Student";


const EnumReverseMappings = {
    State: caseInsensitive(reverseMappingForStringEnum(State)),
    SchoolType: caseInsensitive(reverseMappingForStringEnum(SchoolType)),
    MentoringCategory: caseInsensitive(reverseMappingForStringEnum(MentoringCategory)),
    ProjectField: reverseMappingForStringEnum(ProjectField),
    TutorJufoParticipationIndication: caseInsensitive(reverseMappingForStringEnum(TutorJufoParticipationIndication)),
    TuteeJufoParticipationIndication: caseInsensitive(reverseMappingForStringEnum(TuteeJufoParticipationIndication)),
    TeacherModule: caseInsensitive(reverseMappingForStringEnum(TeacherModule))
};

function reverseMappingForStringEnum<E>(e: E): ((s: string) => E[keyof E]) {
    //this would be equivalent to check whether `Object.values(ENUM)` contains `s` and then return s
    return (s: string) => {
        return Object.entries(e).find( ([, value]) => typeof value === "string" && value === s)?.[1];
    };
}

function caseInsensitive<E>(reverseMappingFunction: (s: string) => E) {
    return (s: string) => {
        return reverseMappingFunction(s.toUpperCase()) || reverseMappingFunction(s.toLowerCase());
    };
}

export {
    EnumReverseMappings,
    reverseMappingForStringEnum
};