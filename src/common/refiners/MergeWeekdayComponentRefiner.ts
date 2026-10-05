/*

*/

import { MergingRefiner } from "../abstractRefiners";
import { ParsingResult } from "../../results";
import { assignWeekdayAndConsistentDate } from "../../calculation/weekdays";

/**
 * Merge weekday component into more completed data
 * - [Sunday] [12/7/2014] => [Sunday 12/7/2014]
 * - [Tuesday], [January 13, 2012] => [Sunday 12/7/2014]
 *
 * When the weekday conflicts with the date (e.g. "Saturday in 3 weeks", where the
 * relative date happens to fall on another weekday), the date is adjusted to the
 * matching weekday of the same (Monday-starting) week so that the resulting
 * weekday and date always agree.
 */
export default class MergeWeekdayComponentRefiner extends MergingRefiner {
    mergeResults(textBetween: string, currentResult: ParsingResult, nextResult: ParsingResult): ParsingResult {
        const newResult = nextResult.clone();
        newResult.index = currentResult.index;
        newResult.text = currentResult.text + textBetween + newResult.text;

        const weekday = currentResult.start.get("weekday");
        assignWeekdayAndConsistentDate(newResult.start, weekday);
        if (newResult.end) {
            assignWeekdayAndConsistentDate(newResult.end, weekday);
        }

        return newResult;
    }

    shouldMergeResults(textBetween: string, currentResult: ParsingResult, nextResult: ParsingResult): boolean {
        const weekdayThenNormalDate =
            currentResult.start.isOnlyWeekdayComponent() &&
            !currentResult.start.isCertain("hour") &&
            nextResult.start.isCertain("day");
        return weekdayThenNormalDate && textBetween.match(/^,?\s*$/) != null;
    }
}
