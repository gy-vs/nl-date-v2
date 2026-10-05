import { ParsingContext, Parser } from "../../../chrono";
import { ParsingComponents } from "../../../results";
import { WEEKDAY_OFFSET } from "../constants";
import { createParsingComponentsAtWeekday } from "../../../calculation/weekdays";

const PATTERN = new RegExp(
    "((?<prefix>前の|次の|今週|来週|先週)(?:の)?)?(?<weekday>" + Object.keys(WEEKDAY_OFFSET).join("|") + ")(?:曜日|曜)",
    "i"
);

export default class JPWeekdayParser implements Parser {
    pattern(): RegExp {
        return PATTERN;
    }

    extract(context: ParsingContext, match: RegExpMatchArray): ParsingComponents {
        const dayOfWeek = match.groups.weekday;
        const offset = WEEKDAY_OFFSET[dayOfWeek];
        if (offset === undefined) return null;

        const prefix = match.groups.prefix || "";

        let modifier = null;
        if (prefix.match(/前の|先週/)) {
            modifier = "last";
        } else if (prefix.match(/次の|来週/)) {
            modifier = "next";
        } else if (prefix.match(/今週/)) {
            modifier = "this";
        }

        return createParsingComponentsAtWeekday(context.reference, offset, modifier);
    }
}
