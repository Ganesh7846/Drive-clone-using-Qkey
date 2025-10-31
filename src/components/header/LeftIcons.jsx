import React from "react";
import styled from "styled-components";
import { HelpIcon } from "../common/SvgIcons";
import { useDispatch, useSelector } from "react-redux";
import { selectHelpModal, setHelpModal } from "../../store/HelpSlice";
import HelpModal from "../common/Modal";

const LeftIcons = ({ isDark, toggleTheme }) => {
  const openHelp = useSelector(selectHelpModal);
  const dispatch = useDispatch();

  return (
    <LeftSection>
      <HelpModal openHelp={openHelp} closeHelpModal={() => dispatch(setHelpModal(false))} />
      <span onClick={() => dispatch(setHelpModal(true))}><HelpIcon /></span>

      {/* ✅ Dark Mode Toggle Here Instead of Settings */}
      <ThemeToggle onClick={toggleTheme}>
        {isDark ? "☀️" : "🌙"}
      </ThemeToggle>
    </LeftSection>
  );
};

const LeftSection = styled.div`
  margin-right: 40px;
  display: flex;
  align-items: center;
  span {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  svg, div {
    font-size: 28px;
    color: #5f6368;
    padding: 5px;
    cursor: pointer;
    border-radius: 50%;
    transition: all 200ms ease-out;
    margin: 0 6px;
    :hover {
      background-color: rgba(0, 0, 0, 0.09);
    }
  }

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const ThemeToggle = styled.div`
  font-size: 24px;
  cursor: pointer;
  user-select: none;
`;

export default LeftIcons;
