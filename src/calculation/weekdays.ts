import { Weekday } from "../types";
import { ParsingComponents, ReferenceWithTimezone } from "../results";
import { implySimilarTime } from "../utils/dates";

/**
 * Merges a `weekday` into components carrying a date, keeping the resulting
 * weekday and date consistent:
 *
 * - When the date falls on the given weekday (e.g. "Sunday 12/7/2014"), the
 *   weekday is assigned as a certain component.
 * - When merging into a relative date (e.g. "Saturday in 3 weeks" or
 *   "Monday 2 weeks ago"), the relative expression only pins down a point in
 *   time while the weekday is the relevant part, so the date is shifted within
 *   the same (Monday-starting) week and the weekday is assigned as certain.
 *   Such relative components carry the "result/relativeDate" tag.
 * - When merging into an explicit date whose weekday annotation does not match
 *   (e.g. "Tuesday, January 10" where January 10 is not a Tuesday), the explicit
 *   date always wins. The conflicting weekday is only implied, so it stays
 *   readable from the result but is not a certain component contradicting the date.
 */
export function assignWeekdayAndConsistentDate(components: ParsingComponents, weekday: Weekday): void {
    const currentDate = components.dayjs();
    if (currentDate.day() == weekday) {
        components.assign("weekday", weekday);
        return;
    }

    if (!components.tags().has("result/relativeDate") && !components.tags().has("result/relativeDateAndTime")) {
        // An explicitly stated date always wins over a conflicting weekday annotation.
        // Keep the annotation readable, but do not mark it as a certain component.
        components.imply("weekday", weekday);
        return;
    }

    // Shift the relative date within the same (Monday-starting) week to the matching weekday.
    components.assign("weekday", weekday);
    const mondayBasedCurrentWeekday = currentDate.day() == 0 ? 6 : currentDate.day() - 1;
    const mondayBasedTargetWeekday = weekday == 0 ? 6 : weekday - 1;
    const adjustedDate = currentDate.add(mondayBasedTargetWeekday - mondayBasedCurrentWeekday, "day");

    if (components.isCertain("year")) {
        components.assign("year", adjustedDate.year());
    } else {
        components.imply("year", adjustedDate.year());
    }
    if (components.isCertain("month")) {
        components.assign("month", adjustedDate.month() + 1);
    } else {
        components.imply("month", adjustedDate.month() + 1);
    }
    if (components.isCertain("day")) {
        components.assign("day", adjustedDate.date());
    } else {
        components.imply("day", adjustedDate.date());
    }
}

/**
 * Returns the parsing components at the weekday (considering the modifier). The time and timezone is assume to be
 * similar to the reference.
 * @param reference
 * @param weekday
 * @param modifier "this", "next", "last" modifier word. If empty, returns the weekday closest to the `refDate`.
 */
export function createParsingComponentsAtWeekday(
    reference: ReferenceWithTimezone,
    weekday: Weekday,
    modifier?: "this" | "next" | "last"
): ParsingComponents {
    const refDate = reference.getDateWithAdjustedTimezone();
    const daysToWeekday = getDaysToWeekday(refDate, weekday, modifier);

    let components = new ParsingComponents(reference);
    components = components.addDurationAsImplied({ day: daysToWeekday });
    components.assign("weekday", weekday);

    return components;
}

/**
 * Returns number of days from refDate to the weekday. The refDate date and timezone information is used.
 * @param refDate
 * @param weekday
 * @param modifier "this", "next", "last" modifier word. If empty, returns the weekday closest to the `refDate`.
 */
export function getDaysToWeekday(refDate: Date, weekday: Weekday, modifier?: "this" | "next" | "last"): number {
    const refWeekday = refDate.getDay() as Weekday;
    switch (modifier) {
        case "this":
            return getDaysForwardToWeekday(refDate, weekday);
        case "last":
            return getBackwardDaysToWeekday(refDate, weekday);
        case "next":
            // From Sunday, the next Sunday is 7 days later.
            // Otherwise, next Mon is 1 days later, next Tues is 2 days later, and so on..., (return enum value)
            if (refWeekday == Weekday.SUNDAY) {
                return weekday == Weekday.SUNDAY ? 7 : weekday;
            }
            // From Saturday, the next Saturday is 7 days later, the next Sunday is 8-days later.
            // Otherwise, next Mon is (1 + 1) days later, next Tues is (1 + 2) days later, and so on...,
            // (return, 2 + [enum value] days)
            if (refWeekday == Weekday.SATURDAY) {
                if (weekday == Weekday.SATURDAY) return 7;
                if (weekday == Weekday.SUNDAY) return 8;
                return 1 + weekday;
            }
            // From weekdays, next Mon is the following week's Mon, next Tues the following week's Tues, and so on...
            // If the week's weekday already passed (weekday < refWeekday), we simply count forward to next week
            // (similar to 'this'). Otherwise, count forward to this week, then add another 7 days.
            if (weekday < refWeekday && weekday != Weekday.SUNDAY) {
                return getDaysForwardToWeekday(refDate, weekday);
            } else {
                return getDaysForwardToWeekday(refDate, weekday) + 7;
            }
    }
    return getDaysToWeekdayClosest(refDate, weekday);
}

export function getDaysToWeekdayClosest(refDate: Date, weekday: Weekday): number {
    const backward = getBackwardDaysToWeekday(refDate, weekday);
    const forward = getDaysForwardToWeekday(refDate, weekday);

    return forward < -backward ? forward : backward;
}

export function getDaysForwardToWeekday(refDate: Date, weekday: Weekday): number {
    const refWeekday = refDate.getDay();
    let forwardCount = weekday - refWeekday;
    if (forwardCount < 0) {
        forwardCount += 7;
    }
    return forwardCount;
}

export function getBackwardDaysToWeekday(refDate: Date, weekday: Weekday): number {
    const refWeekday = refDate.getDay();
    let backwardCount = weekday - refWeekday;
    if (backwardCount >= 0) {
        backwardCount -= 7;
    }
    return backwardCount;
}
