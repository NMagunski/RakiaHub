import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteUserData(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
) {
  // New journal images are private and must not outlive the account.
  for (;;) {
    const {data:files,error}=await admin.storage.from("tasting-photos").list(userId,{limit:100});
    if(error)throw new Error("Could not remove private tasting photos");
    if(!files?.length)break;
    const {error:removeError}=await admin.storage.from("tasting-photos").remove(files.map(file=>`${userId}/${file.name}`));
    if(removeError)throw new Error("Could not remove private tasting photos");
  }
  // 1. Reactions ON the user's ratings (other users' reactions to their content)
  const { data: ratingRows } = await admin
    .from("ratings")
    .select("id")
    .eq("user_id", userId);
  const ratingIds = (ratingRows ?? []).map((r) => r.id);
  if (ratingIds.length) {
    await admin.from("reactions").delete().in("rating_id", ratingIds);
  }

  // 2. Reactions BY the user
  await admin.from("reactions").delete().eq("user_id", userId);

  // 3. Ratings
  await admin.from("ratings").delete().eq("user_id", userId);

  // 4. Friendships (both directions)
  await admin
    .from("friendships")
    .delete()
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  // 5. Personal entries
  await admin.from("personal_entries").delete().eq("owner_id", userId);

  // 6. Invite links created by this user
  await admin.from("invite_links").delete().eq("created_by", userId);

  // 7. Nullify rakija.added_by — keep the product catalog entry
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from("rakija").update({ added_by: null }).eq("added_by", userId);

  // 8. Nullify promotion_suggestions.reviewed_by
  await admin
    .from("promotion_suggestions")
    .update({ reviewed_by: null })
    .eq("reviewed_by", userId);

  // 9. Delete profile row
  await admin.from("profiles").delete().eq("id", userId);

  // 10. Delete auth user (irreversible — must be last)
  await admin.auth.admin.deleteUser(userId);
}
