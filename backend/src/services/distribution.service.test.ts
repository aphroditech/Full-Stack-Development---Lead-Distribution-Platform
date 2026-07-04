import { test } from "node:test";
import assert from "node:assert/strict";
import { DateTime } from "luxon";
import { selectBroker, normalizeEmail } from "./distribution.logic";
import { isBrokerOpen, timeToMinutes, parseWorkingDays } from "./time.service";

test("selectBroker matches the specification example table", () => {
  // Broker A 50% sent 4, B 30% sent 3, C 20% sent 3, totalSentToday = 10.
  // Deficits: A +1.5, B +0.3, C -0.8 => A receives the next lead.
  const chosen = selectBroker(
    [
      { brokerId: "A", percentage: 50, sentToday: 4 },
      { brokerId: "B", percentage: 30, sentToday: 3 },
      { brokerId: "C", percentage: 20, sentToday: 3 },
    ],
    10,
  );
  assert.equal(chosen, "A");
});

test("selectBroker returns null when there are no eligible candidates", () => {
  assert.equal(selectBroker([], 0), null);
});

test("selectBroker breaks ties by fewer leads sent today", () => {
  // totalSentToday + 1 = 2. X: 2*0.5 - 0 = 1.0 ; Y: 2*1.0 - 1 = 1.0 => tie => X (fewer sent).
  const chosen = selectBroker(
    [
      { brokerId: "X", percentage: 50, sentToday: 0 },
      { brokerId: "Y", percentage: 100, sentToday: 1 },
    ],
    1,
  );
  assert.equal(chosen, "X");
});

test("selectBroker gives the first lead of the day to the highest percentage", () => {
  const chosen = selectBroker(
    [
      { brokerId: "A", percentage: 20, sentToday: 0 },
      { brokerId: "B", percentage: 70, sentToday: 0 },
      { brokerId: "C", percentage: 10, sentToday: 0 },
    ],
    0,
  );
  assert.equal(chosen, "B");
});

test("normalizeEmail trims and lowercases", () => {
  assert.equal(normalizeEmail("  Foo.Bar@Example.COM "), "foo.bar@example.com");
});

test("parseWorkingDays parses ISO weekday CSV and ignores junk", () => {
  assert.deepEqual(parseWorkingDays("1,2,3,4,5"), [1, 2, 3, 4, 5]);
  assert.deepEqual(parseWorkingDays("6, 7"), [6, 7]);
  assert.deepEqual(parseWorkingDays("0,8,abc,3"), [3]);
});

test("timeToMinutes parses valid HH:mm and rejects invalid", () => {
  assert.equal(timeToMinutes("09:00"), 540);
  assert.equal(timeToMinutes("18:30"), 1110);
  assert.equal(timeToMinutes("24:00"), null);
  assert.equal(timeToMinutes("9am"), null);
});

const manilaSchedule = {
  timezone: "Asia/Manila",
  openingTime: "09:00",
  closingTime: "18:00",
  workingDays: "1,2,3,4,5", // Mon–Fri
};

test("isBrokerOpen: open during working hours on a working day", () => {
  const wed10 = DateTime.fromObject(
    { year: 2026, month: 1, day: 7, hour: 10 },
    { zone: "Asia/Manila" },
  );
  assert.equal(wed10.weekday, 3); // sanity: Wednesday
  assert.equal(isBrokerOpen(manilaSchedule, wed10), true);
});

test("isBrokerOpen: closed before opening and at/after closing (exclusive)", () => {
  const zone = "Asia/Manila";
  const wed0800 = DateTime.fromObject({ year: 2026, month: 1, day: 7, hour: 8 }, { zone });
  const wed1759 = DateTime.fromObject({ year: 2026, month: 1, day: 7, hour: 17, minute: 59 }, { zone });
  const wed1800 = DateTime.fromObject({ year: 2026, month: 1, day: 7, hour: 18 }, { zone });
  assert.equal(isBrokerOpen(manilaSchedule, wed0800), false);
  assert.equal(isBrokerOpen(manilaSchedule, wed1759), true);
  assert.equal(isBrokerOpen(manilaSchedule, wed1800), false);
});

test("isBrokerOpen: closed on non-working days", () => {
  const sat = DateTime.fromObject({ year: 2026, month: 1, day: 3, hour: 10 }, { zone: "Asia/Manila" });
  assert.equal(sat.weekday, 6); // Saturday
  assert.equal(isBrokerOpen(manilaSchedule, sat), false);
});

test("isBrokerOpen: supports overnight windows (22:00–06:00)", () => {
  const overnight = { timezone: "Asia/Manila", openingTime: "22:00", closingTime: "06:00", workingDays: "1,2,3,4,5" };
  const zone = "Asia/Manila";
  const wed2300 = DateTime.fromObject({ year: 2026, month: 1, day: 7, hour: 23 }, { zone });
  const wed0500 = DateTime.fromObject({ year: 2026, month: 1, day: 7, hour: 5 }, { zone });
  const wed1200 = DateTime.fromObject({ year: 2026, month: 1, day: 7, hour: 12 }, { zone });
  assert.equal(isBrokerOpen(overnight, wed2300), true);
  assert.equal(isBrokerOpen(overnight, wed0500), true);
  assert.equal(isBrokerOpen(overnight, wed1200), false);
});
