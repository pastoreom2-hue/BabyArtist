/** Parent-configured family contact for One-Touch Send (localStorage). */

export const FAMILY_CONTACT_STORAGE_KEY = 'babyartist-family-contact';

export interface FamilyContact {
  /** Kid-friendly label shown on the Send button, e.g. "Grandma" */
  displayName: string;
  /** Optional email for mailto: */
  email: string;
  /** Optional phone for sms: (digits / + allowed) */
  phone: string;
}

export const EMPTY_FAMILY_CONTACT: FamilyContact = {
  displayName: '',
  email: '',
  phone: '',
};

function sanitizeDisplayName(value: string): string {
  return value.trim().slice(0, 40);
}

function sanitizeEmail(value: string): string {
  return value.trim().slice(0, 120);
}

function sanitizePhone(value: string): string {
  return value.replace(/[^\d+\s()-]/g, '').trim().slice(0, 32);
}

export function normalizeFamilyContact(raw: Partial<FamilyContact> | null | undefined): FamilyContact {
  return {
    displayName: sanitizeDisplayName(raw?.displayName ?? ''),
    email: sanitizeEmail(raw?.email ?? ''),
    phone: sanitizePhone(raw?.phone ?? ''),
  };
}

export function loadFamilyContact(): FamilyContact {
  try {
    const raw = localStorage.getItem(FAMILY_CONTACT_STORAGE_KEY);
    if (!raw) return { ...EMPTY_FAMILY_CONTACT };
    return normalizeFamilyContact(JSON.parse(raw) as Partial<FamilyContact>);
  } catch {
    return { ...EMPTY_FAMILY_CONTACT };
  }
}

export function saveFamilyContact(contact: FamilyContact): FamilyContact {
  const normalized = normalizeFamilyContact(contact);
  localStorage.setItem(FAMILY_CONTACT_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearFamilyContact(): void {
  localStorage.removeItem(FAMILY_CONTACT_STORAGE_KEY);
}

export function hasFamilyRecipient(contact: FamilyContact): boolean {
  return Boolean(contact.email || contact.phone);
}

/** Shown when One-Touch Send is tapped with no preset email/phone. */
export const FAMILY_ADDRESS_REQUIRED_MSG =
  'Please enter the recipient address in advance.';

export function familyRecipientLabel(contact: FamilyContact): string {
  if (contact.displayName) return contact.displayName;
  if (contact.email) return contact.email;
  if (contact.phone) return contact.phone;
  return 'Family';
}
