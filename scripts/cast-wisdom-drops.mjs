#!/usr/bin/env node
/*
 * ARCHIVED: the Wisdom Drops publishing workflow is disabled.
 *
 * This file remains only to make old operational references fail closed.
 * It contains no network client, credentials, campaign copy, or publication
 * path. A future campaign must be reviewed and implemented separately.
 */

const executionRequested = process.argv.includes('--execute');
const message = 'Wisdom Drops publisher is archived and disabled; no content was published.';

if (executionRequested) {
  console.error(message);
  process.exit(1);
}

console.log(message);
