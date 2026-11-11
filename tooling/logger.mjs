import nodeLogger from 'astro/logger/node';

const blockedLogoWarning = 'Blocked cross-origin request to /images/logo.png (Sec-Fetch-Site: cross-site, Sec-Fetch-Mode: no-cors). Cross-origin subresource requests are not allowed on the dev server for security reasons.';

export default function logger(options) {
  const destination = nodeLogger(options);

  return {
    write(event) {
      if (event.level === 'warn' && event.label === 'router' && event.message === blockedLogoWarning) return;
      destination.write(event);
    }
  };
}
