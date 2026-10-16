ATTRITION DASHBOARD (revised file: Attrition_from_2026.xls)

1. Double-click index.html (Chrome / Edge / Firefox). Needs internet on first load for the chart and Excel libraries.
2. Pick Monthly / Quarterly / Half-Yearly / Yearly / Custom range, plus Department, Zone and Grade filters.
3. "Function / Sub-Function" tab: choose any month from the Month dropdown.
4. Click any number to see the employees behind it. Every table and list has a formatted Excel export. Short reasons are not included in the dashboard or any export.
5. To refresh with new data, click "Refresh with updated Excel" and choose the new single-sheet file (needs a "Date Of Joining" column).
   Anyone with a Last Working Date on or before today counts as exited; a later date counts as serving notice.

Note: contains employee names and IDs. Share with care.

GO LIVE (GitHub + Vercel)
1. github.com > New repository (Private) > "uploading an existing file" > drag index.html > Commit.
2. vercel.com > sign in with GitHub > Add New > Project > import the repository.
3. Framework Preset: Other (leave build command and output directory empty) > Deploy.
4. Your link will look like https://<project-name>.vercel.app
To update later: replace index.html in the GitHub repository; Vercel redeploys automatically.
Privacy: the page contains employee names and IDs. Anyone with the Vercel link can open it, so enable Vercel password protection / access control if your plan allows.
