import React from "react";
import styled from "styled-components";
import { SearchIcons } from "../common/SvgIcons";

const SearchBar = () => {
  return (
    <InputWrapper>
      <input type="text" placeholder="Search in Drive..." />
      <span className="icon">
        <SearchIcons />
      </span>
    </InputWrapper>
  );
};

export default SearchBar;

const InputWrapper = styled.div`
  width: 100%;
  max-width: 650px;
  position: relative;

  input {
    width: 100%;
    padding: 8px 36px 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    outline: none;
    transition: 0.2s ease;
  }

  input::placeholder {
    color: #9ca3af;
  }

  input:focus {
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.25);
  }

  .icon {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    pointer-events: none;
    opacity: 0.6;
  }

  .icon svg {
    font-size: 18px;
    color: var(--text);
  }
`;
