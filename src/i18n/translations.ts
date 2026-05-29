export type Lang = 'en' | 'th';

export const t = {
  en: {
    // Header
    signIn: 'Sign in',
    signOut: 'Sign out',
    prompts: 'prompts',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    // Search
    searchPlaceholder: 'Search Prompt',
    // Gallery
    loading: 'Loading prompts...',
    noResults: 'No prompts found',
    noResultsSub: 'Try a different keyword or clear the filter',
    loadAll: 'Load all',
    more: 'more',
    backToTop: 'Back to top',
    // Copy button
    copy: 'Copy',
    copied: '✓',
    unlock: 'Unlock',
    signInToCopy: 'Sign in to copy',
    unlockToCopy: 'Unlock to copy',
    // Prompt Modal
    close: 'Close',
    viewFullImage: 'View full image',
    promptText: 'Prompt Text',
    copyPrompt: '📋 Copy Prompt',
    copiedPrompt: 'Copied ✓',
    signInToRead: 'Sign in to read this prompt',
    unlockToRead: 'Unlock to read full prompt',
    signInBtn: 'Sign in',
    unlockBtn: 'Unlock $4.99',
    signInToReadBtn: '🔒 Sign in to copy',
    unlockToReadBtn: '🔒 Unlock $4.99',
    // Login Modal
    loginTitle: 'Sign in to copy prompts',
    loginSub: 'Use your Google account — it\'s free',
    // Unlock Modal
    unlockTitle: "What you'll get",
    unlockSub: 'Unlock all prompts with a single payment',
    benefits: [
      'Copy all 215+ AI prompts instantly',
      'Access new prompts added in the future — free',
      'One-time payment — no monthly fees, no subscription',
      'Lifetime access on your Google account',
    ],
    price: '$4.99',
    oneTime: 'one-time · no subscription',
    payBtn: 'Pay $4.99 →',
    cancel: 'Cancel',
    redirecting: 'Redirecting...',
    // Banners
    dbError: 'Could not connect to database. Copy feature unavailable.',
    paySuccess: 'Payment successful! Unlocking your access...',
    unlocked: '🎉 Unlocked!',
    payPending: 'Payment received — refresh the page if copy is not unlocked yet.',
  },
  th: {
    // Header
    signIn: 'เข้าสู่ระบบ',
    signOut: 'ออกจากระบบ',
    prompts: 'prompt',
    lightMode: 'โหมดสว่าง',
    darkMode: 'โหมดมืด',
    // Search
    searchPlaceholder: 'ค้นหา Prompt',
    // Gallery
    loading: 'กำลังโหลด Prompt...',
    noResults: 'ไม่พบ Prompt ที่ค้นหา',
    noResultsSub: 'ลองคำค้นหาอื่น หรือยกเลิกตัวกรอง',
    loadAll: 'โหลดทั้งหมด',
    more: 'รายการ',
    backToTop: 'กลับขึ้นบนสุด',
    // Copy button
    copy: 'คัดลอก',
    copied: '✓',
    unlock: 'ปลดล็อก',
    signInToCopy: 'เข้าสู่ระบบเพื่อคัดลอก',
    unlockToCopy: 'ปลดล็อกเพื่อคัดลอก',
    // Prompt Modal
    close: 'ปิด',
    viewFullImage: 'ดูภาพเต็ม',
    promptText: 'ข้อความ Prompt',
    copyPrompt: '📋 คัดลอก Prompt',
    copiedPrompt: 'คัดลอกแล้ว ✓',
    signInToRead: 'เข้าสู่ระบบเพื่ออ่าน Prompt',
    unlockToRead: 'ปลดล็อกเพื่ออ่าน Prompt เต็ม',
    signInBtn: 'เข้าสู่ระบบ',
    unlockBtn: 'ปลดล็อก 199 บาท',
    signInToReadBtn: '🔒 เข้าสู่ระบบเพื่อคัดลอก',
    unlockToReadBtn: '🔒 ปลดล็อก 199 บาท',
    // Login Modal
    loginTitle: 'เข้าสู่ระบบเพื่อคัดลอก Prompt',
    loginSub: 'ใช้บัญชี Google — ฟรี',
    // Unlock Modal
    unlockTitle: 'สิ่งที่คุณจะได้รับ',
    unlockSub: 'ปลดล็อก Prompt ทั้งหมดด้วยการชำระเพียงครั้งเดียว',
    benefits: [
      'คัดลอก AI Prompt ทั้ง 215+ รายการได้ทันที',
      'เข้าถึง Prompt ใหม่ที่เพิ่มในอนาคต — ฟรี',
      'ชำระครั้งเดียว — ไม่มีรายเดือน ไม่มี subscription',
      'ใช้งานตลอดชีวิตด้วยบัญชี Google ของคุณ',
    ],
    price: '199 บาท',
    oneTime: 'ชำระครั้งเดียว · ไม่มีรายเดือน',
    payBtn: 'ชำระ 199 บาท →',
    cancel: 'ยกเลิก',
    redirecting: 'กำลังเปลี่ยนหน้า...',
    // Banners
    dbError: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ ฟีเจอร์คัดลอกไม่พร้อมใช้งาน',
    paySuccess: 'ชำระเงินสำเร็จ! กำลังปลดล็อกการเข้าถึง...',
    unlocked: '🎉 ปลดล็อกแล้ว!',
    payPending: 'ได้รับการชำระเงินแล้ว — รีเฟรชหน้าหากยังไม่ปลดล็อก',
  },
} as const;

export type Translations = typeof t.en;
