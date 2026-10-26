ATTRITION DASHBOARD - LIVE FROM GOOGLE SHEETS
==============================================
What this gives you
  * Your Excel data lives in ONE Google Sheet that many people can edit at the same time.
  * The dashboard (this folder) reads that sheet automatically every 60 seconds.
  * Edit the sheet -> dashboard updates by itself (usually within 1 to 5 minutes; Google
    refreshes its published copy every few minutes, so it is "near real time", not instant).
  * Everyone you share the dashboard link with sees the same live numbers.
  * The dashboard is view-only. All updates are typed into the Google Sheet.

Files in this folder
  index.html   the dashboard (no data inside it that you need to maintain)
  config.js    the ONE file you edit: paste your Google Sheet link here
  README.txt   this guide

--------------------------------------------------------------------
PART 1 - CONVERT THE OFFLINE EXCEL FILE INTO A GOOGLE SHEET
--------------------------------------------------------------------
 1. Open drive.google.com. Create a folder, e.g. "Attrition Live".
 2. Open that folder > New > File upload > choose Attrition_from_2026.xls.
 3. Double-click the uploaded file > "Open with Google Sheets"  (preview opens first).
 4. In Google Sheets click File > "Save as Google Sheets". You now have a real online sheet
    (the .xls stays untouched as a backup).
 5. Check the sheet:
      - Row 1 must hold the column names, exactly as in your Excel:
        E id, Name, Date Of Joining, Last Working Date, Resignation Type, Catagory Reason,
        Regretable / Non-Regretable, Designation, Department, Level 1, Zone, Function,
        Sub Function, Recruiter, Grade
        (other columns, e.g. Short Reason, are ignored and never shown or exported)
      - One employee per row, no merged cells, no blank rows in the middle.
      - Date Of Joining and Last Working Date: select both columns > Format > Number >
        Date  (or Custom date: dd/mm/yyyy). The dashboard reads dd/mm/yyyy, yyyy-mm-dd and
        16-Oct-2026 styles. Day comes first (Indian format).
      - File > Settings > Locale = India (so dates show day-first).
 6. Rename the data tab to "Data" (right-click the tab > Rename). Keep only this one tab
    published (see Part 3).

--------------------------------------------------------------------
PART 2 - MAKE IT COLLABORATIVE (EVERYONE UPDATES IN REAL TIME)
--------------------------------------------------------------------
 1. In the Google Sheet click the green "Share" button.
 2. Add the people who must update data, choose "Editor". They can all type at the same time
    and see each other's cursors. (Or: General access > "Anyone in <your company>" > Editor.)
    People who only need to look at the sheet: choose "Viewer".
 3. Protect the structure: select row 1 > Data > Protect sheets and ranges > Set permissions >
    "Only you" (so nobody renames a column by mistake).
 4. Useful extras: Data > Data validation (dropdowns for Zone, Grade, Regretable /
    Non-Regretable), and File > Version history (see who changed what, restore old versions).

HOW THE TEAM UPDATES DATA
  - New joiner  -> add a new row (fill E id, Name, Date Of Joining, department, etc.).
  - Employee leaves -> fill Last Working Date (+ Resignation Type, Catagory Reason,
    Regretable / Non-Regretable). From that date the person counts as an exit.
    A future Last Working Date = "serving notice" (still counted in headcount).
  - Never rename or delete the column names in row 1.

--------------------------------------------------------------------
PART 3 - PUBLISH THE DATA TAB SO THE DASHBOARD CAN READ IT
--------------------------------------------------------------------
 1. In the sheet: File > Share > Publish to web.
 2. In the "Link" tab choose:   [ the "Data" tab ]   and   [ Comma-separated values (.csv) ].
 3. Click Publish > OK. Copy the link (it starts with https://docs.google.com/spreadsheets/d/e/...).
    Keep "Automatically republish when changes are made" ticked.
 4. Open config.js (Notepad is fine) and paste the link between the quotes of SHEET_CSV_URL.
    Optionally paste the normal sheet edit link into SHEET_EDIT_URL (adds an "Open Google Sheet"
    button on the dashboard). Save the file.
 PRIVACY: anyone who has the published link can read the sheet data (it is long and not
 searchable, but it is not password protected). Treat the link like a password: share it only
 with people allowed to see employee names / IDs. To stop sharing: File > Share > Publish to
 web > "Stop publishing".

--------------------------------------------------------------------
PART 4 - TRY IT ON YOUR COMPUTER
--------------------------------------------------------------------
 Double-click index.html. A green line "Live from Google Sheet - last synced ..." appears next to
 the buttons. If you see an orange warning instead, it tells you what is wrong (wrong link,
 header name missing, dates not readable). Until you paste a link, the dashboard shows the
 built-in sample data and a box where you can paste a link just for your own browser.

--------------------------------------------------------------------
PART 5 - PUT IT ONLINE SO OTHERS CAN OPEN IT WITH A LINK
--------------------------------------------------------------------
 (Google Drive cannot host web pages, so the dashboard needs a small web host. Free options:)
 A) GitHub + Vercel  (same as before, but now only 2 files and no storage / password needed)
     1. github.com > New repository "attrition-live" (Private) > upload index.html and config.js.
     2. vercel.com > sign in with GitHub > Add New > Project > import "attrition-live" >
        Framework Preset "Other" > Deploy.
     3. Your live link: https://attrition-live.vercel.app   <- share THIS link.
 B) GitHub Pages: repository > Settings > Pages > Branch: main > Save.
 C) Netlify Drop: app.netlify.com/drop > drag this folder.
 Later, if you change config.js (new Google link), upload the new file to GitHub and the site
 redeploys by itself.

 SHARE LINKS (two different links for two purposes):
   - Dashboard link (Vercel)  -> everyone who should WATCH the live numbers.
   - Google Sheet link        -> only people who should UPDATE the data (Editor).

--------------------------------------------------------------------
LOCKING THE LINK (ONLY YOU CAN CHANGE IT)
--------------------------------------------------------------------
 DASHBOARD LINK: once a link is pasted into config.js, the "Connect" box disappears for
 everybody and the ?sheet= shortcut and any link saved in a browser are ignored. The only way
 to change the link is to edit config.js in YOUR GitHub repository and let Vercel redeploy.
 Keep the repository Private and do not add other people to it. (The box you saw appears only
 while config.js is still empty - it is meant for your own testing.)
 GOOGLE SHEET: only people you add as "Editor" in Share can change data. Everyone else:
 Share > General access > "Restricted" (or "Anyone with the link: Viewer"). The published CSV
 link is read-only for everyone, nobody can change data through it. Protect row 1 (and any
 other range) with Data > Protect sheets and ranges > "Only you".

--------------------------------------------------------------------
BUTTONS & TIPS
--------------------------------------------------------------------
  "Refresh now"            re-reads the sheet immediately.
  "Open Google Sheet"      opens the sheet for editing (needs SHEET_EDIT_URL in config.js).
  Orange warning "rows skipped"   some rows have an unreadable Date Of Joining - fix them in
                                  the sheet.
  Quick test without editing config.js (only works while config.js has no link): add
  ?sheet=<published csv link> to the dashboard URL.
  Excel export keeps working from the live data (short reasons are never included).
