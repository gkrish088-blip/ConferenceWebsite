# Deployment

The site is static files. After `npm run build:landing` or `npm run build:full`, everything the server needs is in `dist/`.

## Which build when

| Moment | Command | Result |
|---|---|---|
| Landing announced first | `npm run build:landing` | `/` is the countdown page. |
| Main site launches | `npm run build:full` | `/` is the main site. `/countdown/` is still the landing page. |

Before the `full` launch, run `npm run check:launch`. It must pass.

## Ask IITR IT (do not guess these)

1. What kind of AWS setup is it? A plain server (EC2) with a web server like nginx, or S3 with CloudFront, or something else?
2. Which domain or subdomain? Is the site at the root of that domain or under a path (like `/hydro2027/`)? If it is under a path, set Vite `base` to that path.
3. Who issues the HTTPS certificate, and who renews it?
4. How are files delivered: SFTP, git pull on the server, or a CI pipeline?
5. Does IITR require any footer, policy page, or accessibility statement on official event sites?

## If it is nginx on EC2

Minimal idea, adjust to their setup:

```
server {
  server_name <their-domain>;
  root /var/www/conference/dist;
  index index.html;
  gzip on;
  gzip_types text/css application/javascript image/svg+xml application/json;
  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location = /index.html { add_header Cache-Control "no-cache"; }
  location /countdown/ { try_files $uri $uri/ /countdown/index.html; }
}
```
Hashed build files can be cached for a year. HTML must not be, so a new launch shows up immediately.

## If it is S3 plus CloudFront

Upload `dist/` to the bucket, set the default root object to `index.html`, and make sure `/countdown/` resolves to `/countdown/index.html` (a small CloudFront function if needed). Invalidate `/*` after each deploy.

## Rollback

Keep the previous `dist/` as a dated folder or zip. Rolling back means pointing the server at it again. Do not edit files on the server by hand.

## Security basics

No forms, no logins, no cookies, no third-party scripts. Add standard headers if the server allows: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a Content-Security-Policy of `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'`. Test the CSP in the browser console before enforcing it.
