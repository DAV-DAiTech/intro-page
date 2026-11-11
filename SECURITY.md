# Security policy for DAiTech's product landing page

This is the source for the DAiTech product landing page at the Diplomatic Academy of Vietnam. It's a student club project and not a commercial product, there's no bug bounty either, but I do care about getting security issues fixed quickly and I'd rather hear about a problem from you than from our logs.

## Scope

In scope:

- The live deployment and this repository, including:
  - All code inside the `src/` folder
  - The build configuration and Content Security Policy setup (`astro.config.mjs`, `vercel.json`, `public/_headers`)
  - Generated crawl and metadata endpoints (`src/pages/robots.txt.ts`, `src/pages/sitemap.xml.ts`, `src/pages/llms.txt.ts`, and JSON-LD structured data serialisation)
- All static files hosted publicly

Out of scope:

- External club tools linked from this page, they have their own repositories. Please report issues with those applications directly to their respective repositories, or notify the nearest club member you know.
- Generic Astro, Vite, or Playwright bugs with no site-specific exploit. Same as above, please report those upstream.
- Issues that only affect outdated forks and are not applicable to the latest codebase in the `main` branch.
- Denial of service via brute force traffic against static hosting providers
- Anything that requires physical access to club members' devices or social engineering against us personally
- Missing security headers or best-practice suggestions with no clear demonstrated impact (open a normal issue for those instead)

Not security issues:

- Content disputes or copy typos
- Outdated club descriptions or broken external links with no security impact
- Anything that isn't a security vulnerability.

Open a normal issue for those.

## Supported versions

This is a static site with a single rolling release; only the `main` branch is maintained. There are no version branches to track, and there's no expectation that older deployments stay patched, since the live site always reflects `main`.

## Reporting a vulnerability

Please don't open a public GitHub issue for anything that could be actively exploited before a fix ships. Send a private email to me at [security@jarema.me](mailto:security@jarema.me) instead. My PGP key can be found at [https://keys.openpgp.org/vks/v1/by-fingerprint/D5A8DEAE823F6478185C39879BB802C53628AE75](https://keys.openpgp.org/vks/v1/by-fingerprint/D5A8DEAE823F6478185C39879BB802C53628AE75).

> **PGP key fingerprint:** `D5A8 DEAE 823F 6478 185C 3987 9BB8 02C5 3628 AE75`

Alternatively, contact me on Signal at `@jarema.26`.

Either way, please include:

- A description of the issue
- Steps to reproduce, or a proof of concept if you have one
- Your assessment of impact, if you have one

## Response

This is a student club project maintained alongside university coursework, so turnaround on a fix depends on severity. Anything that allows script injection, bypasses the Content Security Policy, or puts visitors at risk gets prioritised, while cosmetic or low-impact issues will get queued. I'll patch it and credit you if you want that.

Thanks for taking the time to look at this!
