# COMPETITION_ADMIN_CHECKLIST.md: how to run a contest from the website admin (plain words)

> Written in session AT. `[~]` The screen was never opened in a browser by an agent. If something looks wrong, copy the red message and give it to the next agent.

## Where
Website admin console, tab **Competitions** (trophy icon, next to Push Broadcasts). Direct link: `/admin?tab=competitions`.

## Before you create a contest
1. The exam must already exist in the exam hub and be complete: every question needs a prompt, 2 to 8 choices, one correct choice and a **solution**. The screen will refuse an exam where one is missing and tell you which question.
2. Decide the start time. **Type it in Ethiopia time**, whatever the time zone of your computer.
3. Decide the audience, the points, and the prize text. The prize is shown to students only after the contest ends.

## Create
1. Choose the exam. The title, duration and audience can stay empty (the exam's own are used).
2. For a TEST, type the audience `owner-test` so no student can see it.
3. Leave "Show to students now" unticked. The contest is created hidden.
4. Press **Create competition**. Look for the green message.

## Show, change, stop
- **Show / Hide**: students see the contest only while it is Shown.
- **Pause countdown / Resume countdown**: before it starts; students see it as postponed.
- **Start now**: asks first; students can enter immediately.
- **Reschedule**: new start time (Ethiopia time) and duration. Not possible after the contest has started.
- **Cancel contest**: students see it as cancelled.
- **Entries**: the ranked entries of that contest. **Disqualify** asks for a reason; the student sees the reason, the entry leaves the leaderboard.

## After a test
Tell the agent to delete the test contests and their entries from the database (agent with the Supabase connector), then check that the counts are 0.
