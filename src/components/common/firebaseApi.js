// src/components/common/firebaseApi.js
import { db, storage } from "../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,          // ✅ preserve original ID on restore
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
  serverTimestamp,  // ✅ timestamp for trash
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { toast } from "react-toastify";

const trashRef = collection(db, "trash");

/**
 * Move a file record to Trash.
 * - Backward compatible: works with existing callers that pass only `object`.
 * - If you can pass the original myfiles docId, provide it as `originalId`
 *   so we can restore with the exact same ID (best for decrypt metadata).
 *
 * Usage:
 *   postTrashCollection(fileDocData, myfilesDocId)
 */
export const postTrashCollection = async (object, originalId = null) => {
  try {
    await addDoc(trashRef, {
      ...object,
      originalId: originalId ?? object?.originalId ?? null, // keep original id if known
      deletedAt: serverTimestamp(),                         // for "deleted on" UI
    });
  } catch (err) {
    console.error("postTrashCollection error:", err);
  }
};

/**
 * Live list of user's trashed files
 */
const getTrashFiles = (userId, setFiles) => {
  const filesData = collection(db, "trash");
  const unsub = onSnapshot(
    query(filesData, where("userId", "==", userId)),
    (snapshot) => {
      setFiles(() =>
        snapshot.docs
          .map((d) => ({ id: d.id, data: d.data() }))
          .sort(
            (a, b) => b.data.timestamp?.seconds - a.data.timestamp?.seconds
          )
      );
    }
  );
  return unsub;
};

/**
 * Permanently delete from Trash (Firestore) and Storage (if path saved)
 */
const handleDeleteFromTrash = async (trashId) => {
  try {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this file?"
    );
    if (!confirmed) return;

    const tRef = doc(db, "trash", trashId);
    const tSnap = await getDoc(tRef);
    const data = tSnap.exists() ? tSnap.data() : null;

    // 1) Delete Firestore doc from trash
    await deleteDoc(tRef);

    // 2) Delete from storage if we know the path
    if (data?.path) {
      try {
        await deleteObject(ref(storage, data.path));
      } catch (e) {
        // If path missing or already gone, just log
        console.warn("Storage delete skipped:", e?.message || e);
      }
    }

    toast.error("Permanently Deleted");
  } catch (error) {
    console.error("Error deleting from trash: ", error);
  }
};

/**
 * Live list of user's myfiles
 */
const getFilesForUser = (userId, setFiles) => {
  const filesData = collection(db, "myfiles");
  const unsub = onSnapshot(
    query(filesData, where("userId", "==", userId)),
    (snapshot) => {
      setFiles(() =>
        snapshot.docs
          .map((d) => ({ id: d.id, data: d.data() }))
          .sort(
            (a, b) => b.data.timestamp?.seconds - a.data.timestamp?.seconds
          )
      );
    }
  );
  return unsub;
};

/**
 * Star / Unstar
 */
const handleStarred = async (id) => {
  try {
    const docRef = doc(db, "myfiles", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.error("Document does not exist.");
      return;
    }
    const current = !!snap.data().starred;
    await updateDoc(docRef, { starred: !current });
    toast[current ? "error" : "success"](
      current ? "Removed from starred" : "Added to starred"
    );
  } catch (error) {
    console.error("Error updating starred status: ", error);
  }
};

/**
 * ✅ Restore from Trash → My Drive
 * - If trash doc has `originalId`, we restore to that exact ID using setDoc (preserves decrypt metadata compatibility).
 * - Else we fall back to addDoc (new ID). Decrypt still works as long as crypto/path fields exist.
 */
const restoreFile = async (trashId) => {
  try {
    const tRef = doc(db, "trash", trashId);
    const tSnap = await getDoc(tRef);

    if (!tSnap.exists()) {
      toast.error("File not found in Trash");
      return;
    }

    const data = tSnap.data();

    // ✅ Sanitize undefined fields to avoid Firestore 400 errors
    const cleanData = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) cleanData[key] = data[key];
    });

    // ✅ Build final restored object — DO NOT MERGE (keeps crypto exact)
    const restoredData = {
      ...cleanData,
      deletedAt: null,
      isTrashed: false,
    };

    
    // ✅ Restore using ORIGINAL ID if available (keeps password compatibility)
    if (data?.originalId) {
      await setDoc(doc(db, "myfiles", data.originalId), restoredData, {
        merge: false, // ✅ FULL OVERWRITE to preserve crypto metadata exactly
      });
    } else {
      await addDoc(collection(db, "myfiles"), restoredData);
    }

    // ✅ Remove from trash
    await deleteDoc(tRef);
    toast.success("✅ Restored successfully");
  } catch (err) {
    console.error("Restore error:", err);
    toast.error("❌ Failed to restore");
  }
};


export {
  getFilesForUser,
  handleStarred,
  getTrashFiles,
  handleDeleteFromTrash,
  restoreFile, // ✅ export new restore
};
