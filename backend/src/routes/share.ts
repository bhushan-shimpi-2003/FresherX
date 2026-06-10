import { Router } from 'express';

const router = Router();

router.get('/job/:id', (req, res) => {
  const { id } = req.params;
  
  // Custom URI Scheme defined in your app.json (e.g., fresherx://)
  const appScheme = `fresherx://(student)/job/${id}`;
  
  // The Play Store URL for your app
  const playStoreId = 'com.FreshrX';
  const referrer = `job_id=${id}`;
  // Properly URI-encode the referrer string for the Play Store URL
  const playStoreUrl = `https://play.google.com/store/apps/details?id=${playStoreId}&referrer=${encodeURIComponent(referrer)}`;
  
  // A simple HTML page that attempts to open the app,
  // and falls back to the Play Store if the app isn't installed.
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FresherX - View Job</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background-color: #12121A;
          color: #FFF;
          text-align: center;
          padding: 20px;
        }
        h1 { font-size: 24px; margin-bottom: 10px; }
        p { color: #8F90A6; margin-bottom: 30px; }
        .btn {
          background-color: #5D5FEF;
          color: white;
          padding: 14px 24px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
        }
      </style>
      <script>
        // Attempt to open the custom app scheme
        window.location.href = "${appScheme}";
        
        // If the app is not installed, the redirect above will fail.
        // We set a timeout to redirect the user to the Play Store.
        setTimeout(function() {
          window.location.href = "${playStoreUrl}";
        }, 1500);
      </script>
    </head>
    <body>
      <h1>Opening Job Post...</h1>
      <p>If you are not redirected automatically, please download the FresherX app.</p>
      <a href="${playStoreUrl}" class="btn">Download on Play Store</a>
    </body>
    </html>
  `;

  res.send(html);
});

export default router;
