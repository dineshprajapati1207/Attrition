ATTRITION DASHBOARD - GitHub + Vercel setup
=============================================
Folder contents (upload ALL of it, keep the "api" folder as it is):
  index.html      the dashboard
  api/data.js     gives every visitor the latest uploaded data
  api/upload.js   saves a newly uploaded Excel for everyone (password protected)
  package.json    tells Vercel to install the storage library

STEP 1 - GitHub
  1. github.com > New repository > name: attrition-dashboard > Private > Create.
  2. Click "uploading an existing file". Drag the CONTENTS of this folder in
     (index.html, package.json, README.txt and the api folder). Commit changes.

STEP 2 - Vercel
  1. vercel.com > sign in with GitHub > Add New > Project > import attrition-dashboard.
  2. Framework Preset: Other. Leave build command / output directory empty. Click Deploy.

STEP 3 - Turn on shared storage (one time, 2 minutes)
  1. In the Vercel project open the "Storage" tab > Create > Blob > choose PUBLIC access
     (files get long random web addresses) > connect it to this project (all environments).
  2. Open Settings > Environment Variables > add:
       Name:  ADMIN_PASSWORD     Value: (a password only you know)
     Tick Production / Preview / Development > Save.
  3. Go to Deployments > the latest one > "..." > Redeploy.

HOW TO UPDATE THE DATA (shows to EVERYONE)
  1. Open your Vercel link. Click "Refresh with updated Excel" and choose the new file.
  2. Enter the ADMIN_PASSWORD when asked. A message says "Published".
  Everyone who opens the link (now or later) sees that same file's data, and it stays
  until you upload another file. People who already have the page open get the new data
  automatically within about 90 seconds (or as soon as they switch back to the tab).
  Until your first upload, everyone sees the built-in data.
  On the Vercel site a password is always required, so a file can never end up visible
  only to you. Wrong password = nothing changes.

IF PEOPLE DO NOT SEE YOUR NEW FILE
  Look at the line next to the "Refresh with updated Excel" button:
   - "Shared with everyone - data file: <name> - uploaded <time>"  = working.
   - "Shared storage is not working ..." = Step 3 above is not finished (Blob store not
     connected, or you did not Redeploy after adding it / ADMIN_PASSWORD).
   - Nothing shown and the message "Loaded for this browser only" appears after upload =
     you are on a copy that is not the Vercel site (for example the claude.ai link).
     Sharing only works on the Vercel website.

NOTES
  - The Excel needs a "Date Of Joining" column. Anyone with a Last Working Date on or
    before the file's modified date counts as exited; a later date = serving notice.
  - Short reasons are never loaded or exported.
  - The page contains employee names and IDs. Anyone with your Vercel link can open it,
    so enable Vercel password protection / access control if your plan allows it.
