import { admin, runId } from "./qa-helpers";

async function main() {
  const client = admin();
  const { data, error: listError } = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;

  const users = data.users.filter((user) => user.user_metadata?.qa_run_id === runId);
  for (const user of users) {
    const { error } = await client.auth.admin.deleteUser(user.id);
    if (error) throw error;
  }

  console.log(`Removed ${users.length} QA users for run ${runId}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Failed to clean up QA users.");
  process.exitCode = 1;
});
