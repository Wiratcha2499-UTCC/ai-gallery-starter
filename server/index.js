const express = require('express');
const Stripe = require('stripe');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PB_URL = process.env.PB_URL;
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';
const PRICE_ID = process.env.STRIPE_PRICE_ID;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Webhook needs raw body BEFORE json middleware
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email || session.customer_email;
    const customerId = session.customer;

    if (email) {
      try {
        await updatePaidStatus(email, customerId);
        console.log(`[Stripe] paid=true for ${email}`);
      } catch (err) {
        console.error('[Stripe] PocketBase update failed:', err.message);
      }
    }
  }

  res.json({ received: true });
});

app.use(express.json());

app.post('/api/create-checkout', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${SITE_URL}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: SITE_URL,
      metadata: { email, name: name || '' },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe] create-checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

async function updatePaidStatus(email, stripeCustomerId) {
  const filter = encodeURIComponent(`email = "${email}"`);
  const listRes = await fetch(
    `${PB_URL}/api/collections/smartpromptai_users/records?filter=${filter}&perPage=1`
  );
  const listData = await listRes.json();

  const updateBody = { paid: true };
  if (stripeCustomerId) updateBody.stripe_customer_id = stripeCustomerId;

  if (!listData.items || listData.items.length === 0) {
    // User not in DB yet — create with paid=true so next login picks it up
    console.log(`[PocketBase] user not found, creating with paid=true: ${email}`);
    updateBody.email = email;
    await fetch(`${PB_URL}/api/collections/smartpromptai_users/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateBody),
    });
    return;
  }

  const userId = listData.items[0].id;
  await fetch(`${PB_URL}/api/collections/smartpromptai_users/records/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateBody),
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`[Server] running on port ${PORT}`));
