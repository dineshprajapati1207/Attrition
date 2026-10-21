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

HOW TO UPDATE THE DATA
  1. Open your Vercel link. Click "Refresh with updated Excel" and choose the new file.
  2. Enter the ADMIN_PASSWORD when asked. Done.
  Everyone who opens the link (now or later) sees that same file's data, and it stays
  until you upload another file. Until your first upload, everyone sees the built-in data.
  Wrong password = nothing changes. Leaving the password blank keeps the file only in
  your own browser (nobody else sees it).

NOTES
  - The Excel needs a "Date Of Joining" column. Anyone with a Last Working Date on or
    before the file's modified date counts as exited; a later date = serving notice.
  - Short reasons are never loaded or exported.
  - The page contains employee names and IDs. Anyone with your Vercel link can open it,
    so enable Vercel password protection / access control if your plan allows it.
