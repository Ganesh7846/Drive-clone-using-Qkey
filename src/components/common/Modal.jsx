import styled from "styled-components";
import { Modal } from "@mui/material";
import Lottie from "react-lottie-player";
import linkedInJson from "../lottie/linkedInLottie.json";
import githubJson from "../lottie/githubLottie.json";
import closeJson from "../lottie/closeLottie.json";

const HelpModal = ({ openHelp, closeHelpModal }) => {
  return (
    <Modal open={openHelp} onClose={closeHelpModal}>
      <ModalPopup>
        <span onClick={closeHelpModal}>
          <Lottie
            loop
            animationData={closeJson}
            play
            style={{ width: 40, height: 40 }}
          />
        </span>

        <ModalHeading>
          <h3>Need Help?</h3>
        </ModalHeading>

        <ModalBody>
          {/* 👤 Chetan */}
          <ProfileCard>
            <div className="image">
              <img src="\WhatsApp Image 2025-10-27 at 10.07.24.jpeg" alt="Chetan Gowda" />
            </div>
            <h2>Chetan Gowda K</h2>
            <p>Contact Me:</p>
            <div className="links">
              <a href="https://github.com/ChetanGowdak" target="_blank" rel="noopener noreferrer">
                <Lottie loop animationData={githubJson} play style={{ width: 50, height: 50 }} />
                Github
              </a>
              <a href="https://www.linkedin.com/in/chetan-gowda-23a04938b" target="_blank" rel="noopener noreferrer">
                <Lottie loop animationData={linkedInJson} play style={{ width: 50, height: 50 }} />
                LinkedIn
              </a>
            </div>
          </ProfileCard>

          {/* 👤 Premananda */}
          <ProfileCard>
            <div className="image">
              <img src="/WhatsApp Image 2025-10-27 at 10.06.45.jpeg" alt="M Premananda" />
            </div>
            <h2>M Premananda</h2>
            <p>Contact Me:</p>
            <div className="links">
              <a href="https://github.com/M-Premananda" target="_blank" rel="noopener noreferrer">
                <Lottie loop animationData={githubJson} play style={{ width: 50, height: 50 }} />
                Github
              </a>
              <a href="https://www.linkedin.com/in/m-premananda-385110355/" target="_blank" rel="noopener noreferrer">
                <Lottie loop animationData={linkedInJson} play style={{ width: 50, height: 50 }} />
                LinkedIn
              </a>
            </div>
          </ProfileCard>

          {/* 👤 Ganesh */}
          <ProfileCard>
            <div className="image">
              <img src="/WhatsApp Image 2025-10-27 at 10.16.25.jpeg" alt="Ganesh" />
            </div>
            <h2>Ganesh</h2>
            <p>Contact Me:</p>
            <div className="links">
              <a href="https://github.com/Ganesh7846" target="_blank" rel="noopener noreferrer">
                <Lottie loop animationData={githubJson} play style={{ width: 50, height: 50 }} />
                Github
              </a>
              <a href="https://www.linkedin.com/in/ganesh-n-bambulage-340691380/" target="_blank" rel="noopener noreferrer">
                <Lottie loop animationData={linkedInJson} play style={{ width: 50, height: 50 }} />
                LinkedIn
              </a>
            </div>
          </ProfileCard>

          {/* 👤 Aishwarya */}
          <ProfileCard>
            <div className="image">
              <img src="/WhatsApp Image 2025-10-27 at 10.10.24.jpeg" alt="Aishwarya K" />
            </div>
            <h2>Aishwarya K</h2>
            <p>Contact Me:</p>
            <div className="links">
              <a href="https://github.com/Aishubidda" target="_blank" rel="noopener noreferrer">
                <Lottie loop animationData={githubJson} play style={{ width: 50, height: 50 }} />
                Github
              </a>
              <a href="https://www.linkedin.com/in/aishwarya17407" target="_blank" rel="noopener noreferrer">
                <Lottie loop animationData={linkedInJson} play style={{ width: 50, height: 50 }} />
                LinkedIn
              </a>
            </div>
          </ProfileCard>
        </ModalBody>
      </ModalPopup>
    </Modal>
  );
};

export default HelpModal;

/* ✅ Styles */
const ModalPopup = styled.div`
  top: 50%;
  background-color: var(--bg);
  color: var(--text);
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  transform: translateY(-50%);
  padding: 15px;
  border-radius: 10px;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  transition: all 0.3s ease;

  span {
    position: absolute;
    right: 10px;
    top: 8px;
    cursor: pointer;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(100, 100, 100, 0.3);
    border-radius: 3px;
  }
`;

const ModalHeading = styled.div`
  text-align: center;
  border-bottom: 1px solid lightgray;
  padding-bottom: 10px;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding-top: 15px;
  color: var(--text);
`;

const ProfileCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;

  .image {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 1rem;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      filter: brightness(0.95);
    }
  }

  h2 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text);
  }

  p {
    margin: 0.5rem 0;
    text-decoration: underline;
    font-size: 0.9rem;
  }

  .links {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;

    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: var(--text);
      font-size: 0.9rem;

      &:hover {
        opacity: 0.8;
      }
    }
  }
`;
