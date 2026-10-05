import * as chrono from "../../src";
import { testSingleCase } from "../test_util";

// Reference: Tuesday 2024-03-05 08:00 UTC
const REF_DATE = new Date("2024-03-05T08:00:00Z");

test("Test - Weekday merged with consistent relative date", function () {
    testSingleCase(chrono.casual, "Friday 3 days later", REF_DATE, (result) => {
        expect(result.text).toBe("Friday 3 days later");
        expect(result.start.get("weekday")).toBe(5);
        expect(result.start).toBeDate(new Date("2024-03-08T08:00:00Z"));
    });

    testSingleCase(chrono.casual, "Tuesday in 3 weeks", REF_DATE, (result) => {
        expect(result.text).toBe("Tuesday in 3 weeks");
        expect(result.start.get("weekday")).toBe(2);
        expect(result.start).toBeDate(new Date("2024-03-26T08:00:00Z"));
    });

    testSingleCase(chrono.casual, "Sunday 12/7/2014", REF_DATE, (result) => {
        expect(result.text).toBe("Sunday 12/7/2014");
        expect(result.start.get("weekday")).toBe(0);
        expect(result.start).toBeDate(new Date("2014-12-07T12:00:00Z"));
    });
});

test("Test - Weekday not merged with contradicting relative date", function () {
    // "in 3 weeks" lands on Tuesday 2024-03-26, which contradicts "Saturday".
    // The two parts should stay separate (and self-consistent) results.
    {
        const results = chrono.casual.parse("Saturday in 3 weeks", REF_DATE);
        expect(results).toHaveLength(2);

        expect(results[0].text).toBe("Saturday");
        expect(results[0].start.get("weekday")).toBe(6);
        expect(results[0].start).toBeDate(new Date("2024-03-02T12:00:00Z"));

        expect(results[1].text).toBe("in 3 weeks");
        expect(results[1].start).toBeDate(new Date("2024-03-26T08:00:00Z"));
    }

    // "2 weeks ago" lands on Tuesday 2024-02-20, which contradicts "Monday".
    {
        const results = chrono.casual.parse("Monday 2 weeks ago", REF_DATE);
        expect(results).toHaveLength(2);

        expect(results[0].text).toBe("Monday");
        expect(results[0].start.get("weekday")).toBe(1);
        expect(results[0].start).toBeDate(new Date("2024-03-04T12:00:00Z"));

        expect(results[1].text).toBe("2 weeks ago");
        expect(results[1].start).toBeDate(new Date("2024-02-20T08:00:00Z"));
    }
});

test("Test - Certain weekday always agrees with the result's date", function () {
    const texts = [
        "Friday of next week",
        "Tuesday of next week after 2pm",
        "Saturday in 3 weeks",
        "Monday 2 weeks ago",
        "Sunday 12/7/2014",
        "Friday 3 days later",
        "Tuesday in 3 weeks",
    ];
    for (const text of texts) {
        for (const result of chrono.casual.parse(text, REF_DATE)) {
            if (result.start.isCertain("weekday")) {
                expect(result.start.date().getDay()).toBe(result.start.get("weekday"));
            }
        }
    }
});
