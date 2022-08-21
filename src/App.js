import './App.css';
import NftUploader from './components/NftUploader/NftUploader';
import twitterLogo from "./assets/twitter-logo.svg";
const TWITTER_HANDLE = "Yuhei_42";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

function App() {

  return (
    <div className='App'>
      <div className="header-container">
        <p className="header-text">MINT YOUR Soulbound Tokens</p>
      </div>
      <div className="container">
        <NftUploader></NftUploader>
      </div>
      <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
      </div>
    </div>
  );
}


export default App;