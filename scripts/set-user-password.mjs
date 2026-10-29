import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const runFile = promisify(execFile);

// Standard macOS dialogs keep passwords out of chat, shell history and output.
async function privatePrompt(message, hidden = false) {
  const script = `on run argv
    set question to item 1 of argv
    set answerDialog to display dialog question default answer "" with title "RAKIQ — change password" buttons {"Cancel", "Continue"} default button "Continue" cancel button "Cancel"${hidden ? ' with hidden answer' : ''}
    return text returned of answerDialog
  end run`;
  try {
    const { stdout } = await runFile('/usr/bin/osascript', ['-e', script, message], { maxBuffer: 4096 });
    // osascript appends a newline; preserve all characters in the entered password.
    return stdout.replace(/\r?\n$/, '');
  } catch {
    throw new Error('Password change cancelled or the private dialog could not open. No password update was requested.');
  }
}

export async function resetPassword({ client, prompt }) {
  const email = (await prompt('Enter the email address of your RAKIQ account:')).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid account email.');
  const matches = [];
  const perPage = 200;
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error('Could not look up the account. No password was changed.');
    matches.push(...data.users.filter(user => user.email?.toLowerCase() === email));
    if (data.users.length < perPage) break;
  }
  if (matches.length !== 1) throw new Error(matches.length ? 'Account lookup is ambiguous. No password was changed.' : 'No account matches that email. No password was changed.');

  let password = await prompt(`New password for ${email} (at least 8 characters):`, true);
  if (password.length < 8) throw new Error('Use a password with at least 8 characters. No password was changed.');
  let repeated = await prompt(`Enter the new password again to update ${email}:`, true);
  if (password !== repeated) throw new Error('Passwords do not match. No password was changed.');
  try {
    const { error } = await client.auth.admin.updateUserById(matches[0].id, { password });
    if (error) throw new Error('Supabase rejected the update. The new password was not confirmed; check the project password policy and try again.');
  } finally {
    password = '';
    repeated = '';
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.platform !== 'darwin') throw new Error('This private prompt requires macOS.');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing Supabase URL or server-side admin key in .env.local.');
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    await resetPassword({ client, prompt: privatePrompt });
    console.log('Password updated successfully for the selected RAKIQ account. Sign in using the new password.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
