import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { UploadKind } from "@/lib/upload-types";

type UploadRule = {
  allowedTypes: string[];
  folder: string;
  maxSizeBytes: number;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
export const SUPABASE_STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET?.trim() || "letsearnify-assets";

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const UPLOAD_RULES: Record<UploadKind, UploadRule> = {
  "profile-image": {
    allowedTypes: IMAGE_TYPES,
    folder: "profiles",
    maxSizeBytes: 2 * 1024 * 1024,
  },
  "task-proof": {
    allowedTypes: IMAGE_TYPES,
    folder: "task-proofs",
    maxSizeBytes: 5 * 1024 * 1024,
  },
  "payment-proof": {
    allowedTypes: IMAGE_TYPES,
    folder: "payment-proofs",
    maxSizeBytes: 5 * 1024 * 1024,
  },
  "wallet-qr": {
    allowedTypes: IMAGE_TYPES,
    folder: "wallet-qrs",
    maxSizeBytes: 5 * 1024 * 1024,
  },
  "pool-image": {
    allowedTypes: IMAGE_TYPES,
    folder: "pools",
    maxSizeBytes: 5 * 1024 * 1024,
  },
  "payout-proof": {
    allowedTypes: IMAGE_TYPES,
    folder: "payout-proofs",
    maxSizeBytes: 5 * 1024 * 1024,
  },
};

function getUploadRule(kind: UploadKind) {
  const rule = UPLOAD_RULES[kind];
  if (!rule) {
    throw new Error("Invalid upload type.");
  }

  return rule;
}

let bucketReadyPromise: Promise<void> | null = null;

function getSupabaseAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase storage is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function ensureBucketReady() {
  if (!bucketReadyPromise) {
    bucketReadyPromise = (async () => {
      const client = getSupabaseAdminClient();
      const { data, error } = await client.storage.getBucket(
        SUPABASE_STORAGE_BUCKET,
      );

      if (data && !error) return;

      const { error: createError } = await client.storage.createBucket(
        SUPABASE_STORAGE_BUCKET,
        {
          fileSizeLimit: "5MB",
          public: true,
        },
      );

      if (
        createError &&
        !createError.message.toLowerCase().includes("already exists")
      ) {
        throw createError;
      }
    })();
  }

  return bucketReadyPromise;
}

function getFileExtension(file: File) {
  const fileExtension = file.name.split(".").pop()?.trim().toLowerCase();
  if (fileExtension) return fileExtension;

  if (file.type === "image/jpeg" || file.type === "image/jpg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";

  return "bin";
}

export function validateUploadFile(file: File, kind: UploadKind) {
  const rule = getUploadRule(kind);

  if (!file || file.size === 0) {
    throw new Error("No file selected.");
  }

  if (!rule.allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Use JPG, PNG, WEBP or GIF.");
  }

  if (file.size > rule.maxSizeBytes) {
    const maxMb = Math.floor(rule.maxSizeBytes / (1024 * 1024));
    throw new Error(`File too large. Max size is ${maxMb}MB.`);
  }
}

export async function uploadFileToSupabase({
  file,
  kind,
  userId,
}: {
  file: File;
  kind: UploadKind;
  userId?: string | null;
}) {
  validateUploadFile(file, kind);
  await ensureBucketReady();

  const client = getSupabaseAdminClient();
  const rule = getUploadRule(kind);
  const ext = getFileExtension(file);
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const filePath = userId
    ? `${rule.folder}/${userId}/${fileName}`
    : `${rule.folder}/${fileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await client.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(filePath, buffer, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(
      error.message || "Failed to upload file to Supabase storage.",
    );
  }

  const { data } = client.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(filePath);
  // console.log(data, "check supabase response from server");
  return {
    path: filePath,
    url: data.publicUrl,
  };
}

export function getSupabaseStoragePathFromUrl(
  publicUrl: string | null | undefined,
) {
  if (!publicUrl || !SUPABASE_URL) return null;

  try {
    const fileUrl = new URL(publicUrl);
    const supabaseUrl = new URL(SUPABASE_URL);
    const prefix = `/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/`;

    if (fileUrl.origin !== supabaseUrl.origin) return null;
    if (!fileUrl.pathname.startsWith(prefix)) return null;

    return decodeURIComponent(fileUrl.pathname.slice(prefix.length));
  } catch {
    return null;
  }
}

export async function deleteSupabaseFileByUrl(
  publicUrl: string | null | undefined,
) {
  const storagePath = getSupabaseStoragePathFromUrl(publicUrl);
  if (!storagePath) return false;

  const client = getSupabaseAdminClient();
  const { error } = await client.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .remove([storagePath]);

  if (error && !error.message.toLowerCase().includes("not found")) {
    throw new Error(
      error.message || "Failed to delete file from Supabase storage.",
    );
  }

  return !error;
}
