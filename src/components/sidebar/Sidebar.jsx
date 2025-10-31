import React, { useState } from "react";
import styled from "styled-components";
import { db, storage, auth } from "../../firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectSidebarBool } from "../../store/BoolSlice";
import FileUploadModal from "./FileUploadModal";
import AddFile from "./AddFile";
import SidebarTabs from "./SidebarTabs";
import { toast } from "react-toastify";
import { encryptFile } from "../utils/crypto";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const sidebarBool = useSelector(selectSidebarBool);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFile = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0].name);
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("No file selected");
      return;
    }

    // ask for password
    const passphrase = prompt("Set a password to encrypt this file:");
    if (!passphrase) {
      toast.warn("Upload cancelled: password is required for encrypted files.");
      return;
    }

    setSelectedFile("");
    setUploading(true);
    setProgress(0);

    try {
      // 1) Encrypt locally
      const { encryptedBlob, meta } = await encryptFile(file, passphrase);

      // 2) Pick encrypted name/path
      const storagePath = `files/${Date.now()}_${meta.originalName}.enc`;
      const storageRef = ref(storage, storagePath);

      // 3) Upload ciphertext with progress
      const uploadTask = uploadBytesResumable(storageRef, encryptedBlob, {
        contentType: "application/octet-stream",
        customMetadata: {
          isEncrypted: "true",
          originalName: meta.originalName,
        },
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const p = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(p);
        },
        (error) => {
          console.error("Error uploading file:", error);
          setUploading(false);
          toast.error("Error uploading file. Please try again.");
        },
        async () => {
          // 4) Get URL (still ok to store; we’ll gate decryption in UI)
          const url = await getDownloadURL(uploadTask.snapshot.ref);

          // 5) Save Firestore record (keep your 'myfiles' collection)
          await addDoc(collection(db, "myfiles"), {
            userId: auth.currentUser.uid,
            timestamp: serverTimestamp(),
            filename: meta.originalName,                  // show original name in UI
            fileURL: url,                                  // encrypted blob URL
            path: storagePath,                             // for getBytes() later
            size: encryptedBlob.size,                      // size of ciphertext
            originalSize: meta.originalSize,               // original size
            contentType: "application/octet-stream",       // encrypted blob type
            originalType: meta.originalType,               // original mime
            isEncrypted: true,                             // flag for UI
            crypto: {
              alg: meta.alg,
              kdf: meta.kdf,
              iters: meta.iters,
              salt_b64: meta.salt_b64,
              iv_b64: meta.iv_b64,
              wrapped_key_b64: meta.wrapped_key_b64,      // ✅ required for decrypt
              key_wrap_iv_b64: meta.key_wrap_iv_b64,      // ✅ required for decrypt
              key_source: meta.key_source,                // optional (for info)
            },
            starred: false,
          });

          toast.success("Encrypted upload complete ✅");
          setUploading(false);
          setFile(null);
          setOpen(false);
          setProgress(0);
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
      toast.error("Error uploading file. Please try again.");
    }
  };


  return (
    <>
      <FileUploadModal
        open={open}
        setOpen={setOpen}
        handleUpload={handleUpload}
        uploading={uploading}
        handleFile={handleFile}
        selectedFile={selectedFile}
        progress={progress}
      />

      <SidebarContainer sidebarbool={sidebarBool ? "true" : "false"}>
        <AddFile
          onClick={() => {
            setOpen(true);
          }}
        />

        <SidebarTabs />
      </SidebarContainer>
    </>
  );
};

const SidebarContainer = styled.div`
  width: 180px;
  padding-top: 10px;
  border-right: 1px solid lightgray;
  transition: all 0.1s linear;
  position: ${(props) =>
    props.sidebarbool === "true" ? `relative` : "absolute"};
  left: ${(props) => (props.sidebarbool === "true" ? `0` : "-100%")};

  @media screen and (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 65px;
  }
`;

export default Sidebar;
