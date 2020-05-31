/**
 * @api {GET} /courses GetCourses
 * @apiVersion 1.1.0
 * @apiDescription
 * Request a list of all available courses.
 *
 * <p>This endpoint can be called with authentication as well as without.
 * Authentication unlocks some additional fields and request parameters (see below).
 * The request has to specify if additional fields should be included.
 * Additionally some search parameters can be used to limit the result to matching courses.</p>
 *
 * @apiName GetCourses
 * @apiGroup Courses
 *
 * @apiUse OptionalAuthentication
 *
 * @apiParam (Query Parameter) {string} fields <em>(optional)</em> Comma seperated list of additionally requested fields (<code>id</code> will be always included). Example: <code>fields=name,outline,category,startDate</code>
 * @apiParam (Query Parameter) {string} state <em>(optional, efault: <code>allowed</code>) Comma seperated list of possible states of the course. Requires the <code>instructor</code> parameter to be set.
 * @apiParam (Query Parameter) {string} instructor <em>(optional)</em> Id of an instructor. Return only courses by this instructor. This parameter requires authentication as the specified instructor.
 *
 * @apiUse Courses
 * @apiUse Course
 *
 * @apiExample {curl} Curl
 * curl -k -i -X GET "https://dashboard.corona-school.de/api/courses?fields=name,outline,category,startDate"
 *
 * @apiUse StatusOk
 * @apiUse StatusUnauthorized
 * @apiUse StatusForbidden
 * @apiUse StatusInternalServerError
 */


/**
 * @api {POST} /course AddCourse
 * @apiVersion 1.1.0
 * @apiDescription
 * Add a new course.
 *
 * This endpoint allows adding a new course.
 * If successful the ID of the newly created course will be returned.
 *
 * @apiName AddCourse
 * @apiGroup Courses
 *
 * @apiUse Authentication
 * @apiUse ContentType
 *
 * @apiUse PostCourse
 * @apiUse PostCourseReturn
 *
 * @apiExample {curl} Curl
 * curl -k -i -X POST -H "Token: <AUTHTOKEN>" -H "Content-Type: application/json" https://dashboard.corona-school.de/api/course/ -d "<REQUEST>"
 *
 * @apiUse StatusNoContent
 * @apiUse StatusBadRequest
 * @apiUse StatusUnauthorized
 * @apiUse StatusForbidden
 * @apiUse StatusInternalServerError
 */