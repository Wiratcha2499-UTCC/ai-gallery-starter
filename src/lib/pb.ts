import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_PB_URL);

export const COLLECTION = 'smartpromptai_users';

export interface PbUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  paid: boolean;
  stripe_customer_id: string;
}

/** Fetch current paid status from DB (used after payment redirect). */
export async function fetchPaidStatus(email: string): Promise<{ paid: boolean; id: string } | null> {
  try {
    const results = await pb.collection(COLLECTION).getList<PbUser>(1, 1, {
      filter: pb.filter('email = {:email}', { email }),
    });
    if (results.items.length === 0) return null;
    return { paid: results.items[0].paid, id: results.items[0].id };
  } catch {
    return null;
  }
}

/** Find user by email, or create if not found. Returns paid status. */
export async function upsertUser(
  email: string,
  name: string,
  picture: string,
): Promise<{ pb_id: string; paid: boolean }> {
  try {
    const results = await pb.collection(COLLECTION).getList<PbUser>(1, 1, {
      filter: pb.filter('email = {:email}', { email }),
    });

    if (results.items.length > 0) {
      const existing = results.items[0];
      return { pb_id: existing.id, paid: existing.paid };
    }

    const created = await pb.collection(COLLECTION).create<PbUser>({
      email,
      name,
      picture,
      paid: false,
    });
    return { pb_id: created.id, paid: false };
  } catch (err) {
    console.error('[PocketBase] upsertUser failed:', err);
    throw err;
  }
}
