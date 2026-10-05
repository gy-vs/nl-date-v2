import * as chrono from "../../src";
import { testSingleCase } from "../test_util";

// Reference: Tuesday 2024-03-05 08:00 UTC
const REF_DATE = new Date("2024-03-05T08:00:00Z");

test("Test - Weekday with 'of <this|last|next> week'", function () {
    testSingleCase(chrono.casual, "Friday of next week", REF_DATE, (result) => {
        expect(result.index).toBe(0);
        expect(result.text).toBe("Friday of next week");

        expect(result.start.get("year")).toBe(2024);
        expect(result.start.get("month")).toBe(3);
        expect(result.start.get("day")).toBe(15);
        expect(result.start.get("weekday")).toBe(5);

        expect(result.start).toBeDate(new Date("2024-03-15T12:00:00Z"));
    });

    testSingleCase(chrono.casual, "Tuesday of next week", REF_DATE, (result) => {
        expect(result.index).toBe(0);
        expect(result.text).toBe("Tuesday of next week");

        expect(result.start.get("year")).toBe(2024);
        expect(result.start.get("month")).toBe(3);
        expect(result.start.get("day")).toBe(12);
        expect(result.start.get("weekday")).toBe(2);

        expect(result.start).toBeDate(new Date("2024-03-12T12:00:00Z"));
    });

    testSingleCase(chrono.casual, "Monday of next week", REF_DATE, (result) => {
        expect(result.text).toBe("Monday of next week");
        expect(result.start.get("day")).toBe(11);
        expect(result.start.get("weekday")).toBe(1);
        expect(result.start).toBeDate(new Date("2024-03-11T12:00:00Z"));
    });

    testSingleCase(chrono.casual, "Friday of this week", REF_DATE, (result) => {
        expect(result.text).toBe("Friday of this week");
        expect(result.start.get("day")).toBe(8);
        expect(result.start.get("weekday")).toBe(5);
        expect(result.start).toBeDate(new Date("2024-03-08T12:00:00Z"));
    });

    testSingleCase(chrono.casual, "Friday of last week", REF_DATE, (result) => {
        expect(result.text).toBe("Friday of last week");
        expect(result.start.get("day")).toBe(1);
        expect(result.start.get("weekday")).toBe(5);
        expect(result.start).toBeDate(new Date("2024-03-01T12:00:00Z"));
    });
});

test("Test - Weekday with 'of next week' and time", function () {
    testSingleCase(chrono.casual, "Tuesday of next week after 2pm", REF_DATE, (result) => {
        expect(result.index).toBe(0);
        expect(result.text).toBe("Tuesday of next week after 2pm");

        expect(result.start.get("year")).toBe(2024);
        expect(result.start.get("month")).toBe(3);
        expect(result.start.get("day")).toBe(12);
        expect(result.start.get("weekday")).toBe(2);
        expect(result.start.get("hour")).toBe(14);

        expect(result.start).toBeDate(new Date("2024-03-12T14:00:00Z"));
    });
});

test("Test - Weekday with 'of next week' inside sentence", function () {
    testSingleCase(chrono.casual, "Let's have a meeting on Friday of next week", REF_DATE, (result) => {
        expect(result.text).toBe("on Friday of next week");
        expect(result.start.get("day")).toBe(15);
        expect(result.start.get("weekday")).toBe(5);
        expect(result.start).toBeDate(new Date("2024-03-15T12:00:00Z"));
    });
});
