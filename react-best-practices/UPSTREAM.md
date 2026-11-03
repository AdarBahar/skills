# Upstream

This folder is a copy of `skills/react-best-practices` from [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills). The license is MIT (see the `license` field in `SKILL.md`). The author is Vercel.

Do not edit the files in this folder, except this one. A GitHub Actions workflow, `.github/workflows/sync-react-best-practices.yml`, copies the upstream folder once a week. If the copy differs, the workflow opens a pull request. Read the diff, then merge it. A local edit is lost at the next sync.

The sync keeps this file. It removes every other file that upstream no longer has.
