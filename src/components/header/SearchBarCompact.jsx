import React, { useState } from "react";
import styled from "styled-components";
import { SearchIcons } from "../common/SvgIcons";
import { useNavigate } from "react-router-dom";

const SearchBarCompact = () => {
  const [searchQuery, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.length > 0) {
      navigate(`/search/${searchQuery}`);
      setQuery("");
    }
  };

  const handleSearchByInput = (e) => {
    if (e.key === "Enter" && searchQuery.length > 0) {
      handleSearch();
    }
  };

  return (
    <CompactBar>
      <input
        type="search"
        placeholder="Search in Drive"
        value={searchQuery}
        onChange={(e) => setQuery(e.target.value)}
        onKeyUp={handleSearchByInput}
      />
      <button onClick={handleSearch}>
        <SearchIcons />
      </button>
    </CompactBar>
  );
};

export default SearchBarCompact;

const CompactBar = styled.div`
  display: none;

  @media screen and (max-width: 1024px) {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #f1f3f4;
    border-radius: 8px;
    margin: 10px 12px;
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
  }

  button {
    background: transparent;
    border: none;
    cursor: pointer;
  }
`;
