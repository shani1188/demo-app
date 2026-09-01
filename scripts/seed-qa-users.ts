import { admin, qaEmail, runId } from "./qa-helpers";

async function main() {
  const password = process.env.QA_USER_PASSWORD;
  if (!password || password.length < 10) throw new Error("QA_USER_PASSWORD must contain at least 10 characters.");

  const client = admin();
  const { data: users, error: listError } = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;

  for (const index of [1, 2]) {
    const email = qaEmail(index);
    const existing = users.users.find((user) => user.email === email);
    const result = existing
      ? await client.auth.admin.updateUserById(existing.id, { password, email_confirm: true, user_metadata: { qa_run_id: runId } })
      : await client.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { qa_run_id: runId } });
    if (result.error) throw result.error;
  }

  console.log(`Seeded isolated QA users for run ${runId}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Failed to seed QA users.");
  process.exitCode = 1;
});
