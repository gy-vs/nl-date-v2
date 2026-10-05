import * as chrono from "../../src";
import { testSingleCase } from "../test_util";

// Reference: Tuesday 2024-03-05 08:00 UTC
const REF_DATE = new Date("2024-03-05T08:00:00Z");

test("Test - Weekday with week prefix (先週/来週/今週)", function () {
    testSingleCase(chrono.ja, "来週の火曜日", REF_DATE, (result) => {
        expect(result.index).toBe(0);
        expect(result.text).toBe("来週の火曜日");

        expect(result.start.get("year")).toBe(2024);
        expect(result.start.get("month")).toBe(3);
        expect(result.start.get("day")).toBe(12);
        expect(result.start.get("weekday")).toBe(2);

        expect(result.start).toBeDate(new Date("2024-03-12T12:00:00Z"));
    });

    testSingleCase(chrono.ja, "来週の月曜日", REF_DATE, (result) => {
        expect(result.text).toBe("来週の月曜日");
        expect(result.start.get("day")).toBe(11);
        expect(result.start.get("weekday")).toBe(1);
        expect(result.start).toBeDate(new Date("2024-03-11T12:00:00Z"));
    });

    testSingleCase(chrono.ja, "先週の金曜日", REF_DATE, (result) => {
        expect(result.text).toBe("先週の金曜日");
        expect(result.start.get("day")).toBe(1);
        expect(result.start.get("weekday")).toBe(5);
        expect(result.start).toBeDate(new Date("2024-03-01T12:00:00Z"));
    });

    testSingleCase(chrono.ja, "今週の金曜日", REF_DATE, (result) => {
        expect(result.text).toBe("今週の金曜日");
        expect(result.start.get("day")).toBe(8);
        expect(result.start.get("weekday")).toBe(5);
        expect(result.start).toBeDate(new Date("2024-03-08T12:00:00Z"));
    });
});

test("Test - Weekday with week prefix without の", function () {
    testSingleCase(chrono.ja, "来週火曜日", REF_DATE, (result) => {
        expect(result.text).toBe("来週火曜日");
        expect(result.start.get("day")).toBe(12);
        expect(result.start.get("weekday")).toBe(2);
        expect(result.start).toBeDate(new Date("2024-03-12T12:00:00Z"));
    });

    testSingleCase(chrono.ja, "先週金曜日", REF_DATE, (result) => {
        expect(result.text).toBe("先週金曜日");
        expect(result.start.get("day")).toBe(1);
        expect(result.start.get("weekday")).toBe(5);
        expect(result.start).toBeDate(new Date("2024-03-01T12:00:00Z"));
    });
});

test("Test - Existing week prefixes still work", function () {
    testSingleCase(chrono.ja, "次の火曜日", REF_DATE, (result) => {
        expect(result.text).toBe("次の火曜日");
        expect(result.start.get("day")).toBe(12);
        expect(result.start.get("weekday")).toBe(2);
        expect(result.start).toBeDate(new Date("2024-03-12T12:00:00Z"));
    });

    testSingleCase(chrono.ja, "前の金曜日", REF_DATE, (result) => {
        expect(result.text).toBe("前の金曜日");
        expect(result.start.get("day")).toBe(1);
        expect(result.start.get("weekday")).toBe(5);
        expect(result.start).toBeDate(new Date("2024-03-01T12:00:00Z"));
    });
});
