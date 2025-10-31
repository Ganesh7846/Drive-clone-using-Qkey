import styled from "styled-components";
import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getFilesForUser, postTrashCollection } from "../common/firebaseApi";
import RecentDataGrid from "./RecentDataGrid";
import MainData from "./MainData";
import PageHeader from "../common/PageHeader";
import { toast } from "react-toastify";

/* ✅ Data Page Component */
const Data = () => {
  const [files, setFiles] = useState([]);
  const [optionsVisible, setOptionsVisible] = useState(null);

  /* ✅ Fetch files when user logged in */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const unsubscribeFiles = await getFilesForUser(user.uid, setFiles);
        return () => unsubscribeFiles();
      }
    });

    return () => unsubscribe();
  }, []);

  /* ✅ Delete handler (move to trash first) */
  const handleDelete = async (id, data) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this file?");
      if (confirmed) {
        const docRef = doc(db, "myfiles", id);
        await postTrashCollection(data);
        await deleteDoc(docRef);
        toast.warn("File moved to the trash");
      }
    } catch (error) {
      console.error("Error deleting document: ", error);
    } finally {
      setOptionsVisible(null);
    }
  };

  /* ✅ Toggle options menu */
  const handleOptionsClick = (id) => {
    setOptionsVisible((prevVisible) => (prevVisible === id ? null : id));
  };

  return (
    <DataContainer>
      <PageHeader pageTitle={"My Drive"} />

      {/* ✅ Recents Section */}
      {files.length > 0 && <SectionTitle>Recents</SectionTitle>}
      <RecentWrapper>
        <RecentDataGrid files={files} />
      </RecentWrapper>

      {/* ✅ Main Data Section (Scrollable Area) */}
      <MainDataWrapper>
        <MainData
          files={files}
          handleOptionsClick={handleOptionsClick}
          optionsVisible={optionsVisible}
          handleDelete={handleDelete}
        />
      </MainDataWrapper>
    </DataContainer>
  );
};

export default Data;

/* ✅ Layout Styles */
const DataContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px 0 0 20px;
  overflow: hidden;
  background: var(--bg);
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  margin-top: 30px;
  margin-bottom: -20px;
  color: var(--text-secondary);

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

/* ✅ Recents container: prevents overflow issues */
const RecentWrapper = styled.div`
  flex-shrink: 0;
  width: 100%;
  overflow: hidden;
  padding-top: 10px;
  margin-bottom: 10px;
`;

/* ✅ MainData scroll container */
const MainDataWrapper = styled.div`
  width: 100%;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  background: var(--bg);
  padding-bottom: 40px;
  -webkit-overflow-scrolling: touch;
  max-height: calc(100vh - 230px);
  border-top: 1px solid var(--border);

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(120, 120, 120, 0.3);
    border-radius: 3px;
  }

  @media (max-width: 1024px) {
    max-height: calc(100vh - 210px);
  }

  @media (max-width: 768px) {
    max-height: calc(100vh - 190px);
  }

  @media (max-width: 480px) {
    max-height: calc(100vh - 160px);
  }
`;
