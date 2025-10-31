import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { auth, provider } from "../../firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import {
  selectUserName,
  selectUserPhoto,
  setSignOutState,
  setUserLoginDetails,
} from "../../store/UserSlice";
import { selectSidebarBool, setSidebarBool } from "../../store/BoolSlice";
import { useNavigate } from "react-router-dom";
import LogoWrapperComponent from "./LogoWrapper";
import SearchBar from "./SearchBar";
import LeftIcons from "./LeftIcons";
import ProfileSection from "./ProfileSection";

const Header = () => {
  const dispatch = useDispatch();
  const userName = useSelector(selectUserName);
  const userPhoto = useSelector(selectUserPhoto);
  const sidebarBool = useSelector(selectSidebarBool);
  const navigate = useNavigate();

  // ✅ Dark Mode toggle + persistence
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // ✅ Handle Auth State Redirect
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        navigate("/home");
      }
    });
  }, []);

  const handleAuth = async () => {
    if (!userName) {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } else {
      await signOut(auth);
      dispatch(setSignOutState());
      navigate("/");
    }
  };

  const setUser = (user) => {
    dispatch(setUserLoginDetails({ name: user.displayName, photo: user.photoURL }));
  };

  return (
    <Container>
      <Wrapper>
        <LogoWrapperComponent
          onClick={() => dispatch(setSidebarBool(!sidebarBool))}
          userName={userName}
        />

        {/* ✅ Search visible ONLY once, across all breakpoints */}
        {userName && (
          <div className="searchCenter">
            <SearchBar />
          </div>
        )}

        <RightContainer>
          {/* ✅ Desktop toggle only (in LeftIcons) */}
          <LeftIcons isDark={isDark} toggleTheme={toggleTheme} />

          {/* ✅ Mobile-only theme toggle */}
          <MobileThemeToggle onClick={toggleTheme}>
            {isDark ? "☀️" : "🌙"}
          </MobileThemeToggle>

          <ProfileSection
            userPhoto={userPhoto}
            userName={userName}
            handleAuth={handleAuth}
          />
        </RightContainer>
      </Wrapper>
    </Container>
  );
};

export default Header;

/* ✅ Styles */
const Container = styled.div.attrs(() => ({ className: "header-bar" }))`
  position: sticky;
  width: 100%;
  top: 0;
  z-index: 999;
  background-color: var(--bg);
  border-bottom: 1px solid var(--border);
  padding: 6px 0;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;

  .searchCenter {
    flex: 1;
    display: flex;
    justify-content: center;
    max-width: 650px;
  }
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
`;

/* ✅ Fix: Hide MobileThemeToggle on Desktop */
const MobileThemeToggle = styled.div`
  display: none; /* hidden by default */

  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-right: 8px;
    padding: 6px;
    border-radius: 50%;
  }
`;
