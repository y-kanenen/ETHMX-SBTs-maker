import { Button } from "@mui/material";
import React from "react";
import { useEffect, useState } from 'react'
import ImageLogo from "./image.svg";
import "./NftUploader.css";
import { ethers } from "ethers";
import Web3Mint from "../../utils/Web3Mint.json";
import { Web3Storage } from 'web3.storage'
import LoadingSpinner from "./LoadingSpinner";

const NftUploader = () => {
  /*
   * ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
   */
  const [currentAccount, setCurrentAccount] = useState("");
  
  /*この段階でcurrentAccountの中身は空*/
  console.log("currentAccount: ", currentAccount);
  const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGQ2MmE2RTkzNTAwMzU2MjgzNTlBYjlEMUU1QzUwNGY1MzU5Y0UyRjciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjEwNDI2NDY4NTMsIm5hbWUiOiJFVEhNWF9TQlRzIn0.YVjdi9P-3OFzdN62jjcNDpGGm2JeKDE2TRuXrbLK0jw";
  //const API_KEY = process.env.W3_STORAGE_API_KEY;
  const CONTRACT_ADDRESS = "0x9eCedB09e0C25C69cFdf8E0a3E020c66f7Ce18A8";

  const [mintCount, setMintCount] = useState(-1);
  const TOTAL_MINT_COUNT = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(undefined);
  const [messageValue, setMessageValue] = useState("");

  // setupEventListener 関数を定義します。
  // MyEpicNFT.sol の中で event が　emit された時に、
  // 情報を受け取ります。
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Web3Mint.abi,
          signer
        );

        // Event が　emit される際に、コントラクトから送信される情報を受け取っています。
        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          /*
          alert(
            `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
          */
          setMintCount(tokenId.toNumber());
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected  = async () => {
    /*
     * ユーザーがMetaMaskを持っているか確認します。
     */
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };
  

  const connectWallet = async () =>{
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      /*
       * ウォレットアドレスに対してアクセスをリクエストしています。
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      /*
       * ウォレットアドレスを currentAccount に紐付けます。
       */
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async (ipfs) => {
    
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Web3Mint.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        /*setImagePreview(undefined);*/
        let nftTxn = await connectedContract.mintIpfsNFT(messageValue, ipfs);
        setIsLoading(true);
        console.log("Mining...please wait.");
        await nftTxn.wait();
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        setIsLoading(false);
        console.log(`Opensea link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${mintCount+1}`);
        // Event が　emit される際に、コントラクトから送信される情報を受け取っています。
        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          setIsLoading(false);
          console.log(from, tokenId.toNumber());
          alert(
            `Your SBT has been minted. It may take 10 minutes for showing on OpenSea. Link is https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
          setMintCount(tokenId.toNumber());
          setImagePreview(undefined);
        });
        if (connectedContract) {
          connectedContract.off("NewNFTMinted");
        }

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setIsLoading(false);
      setImagePreview(undefined);
      console.log(error);
    }
  };

  const imageToNFT = async (e) => {
    setImagePreview(undefined);

    const client = new Web3Storage({ token: API_KEY })
    const image = e.target
    console.log(image)

    // FileReaderクラスのインスタンスを取得
    const reader = new FileReader();
    // ファイルを読み込み終わったタイミングで実行するイベントハンドラー
    reader.onload = (e) => {
      // imagePreviewに読み込み結果（データURL）を代入する
      // imagePreviewに値を入れると<output>に画像が表示される
      setImagePreview(e.target?.result);
    };

    // ファイルを読み込む
    // 読み込まれたファイルはデータURL形式で受け取れる（上記onload参照）
    reader.readAsDataURL(e.target?.files[0]);

    const rootCid = await client.put(image.files, {
        name: 'experiment',
        maxRetries: 3
    })
    const res = await client.get(rootCid) // Web3Response
    const files = await res.files() // Web3File[]
    for (const file of files) {
      console.log("file.cid:",file.cid)
      askContractToMintNft(file.cid)
    }
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderUser = (
    <p></p>
  );

  /*
  * ページがロードされたときに useEffect()内の関数が呼び出されます。
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div>
      <div className="loadingArea">
        {isLoading ? <LoadingSpinner /> : renderUser}
      </div>
      <div className="outerBox">
        {currentAccount === "" ? (
          renderNotConnectedContainer()
        ) : (
          <p>You can mint your SBT with selecting the photo</p>
        )}
        <div className="title">
          {/* メッセージボックスを実装*/}
          {currentAccount && (
            <textarea
              name="messageArea"
              placeholder="Title of your memory"
              type="text"
              id="message"
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
            />
          )}
        </div>
        <div className="nftUplodeBox">
          <div className="imageLogoAndText">
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="imagePreview"/>
            ) : (
              <img src={ImageLogo} alt="imagelogo" />
            )}
            <p>Drag and Drop here</p>
          </div>
          <input className="nftUploadInput" multiple name="imageURL" type="file" accept=".jpg , .jpeg , .png"  onChange={imageToNFT} />
        </div>
        <p>OR</p>
        <Button variant="contained">
          Select your memorial photo
          <input className="nftUploadInput" type="file" accept=".jpg , .jpeg , .png"  onChange={imageToNFT}/>
        </Button>
      </div>

      <div className="mintCount">
          The number of minted SBTs: {mintCount+1}/{TOTAL_MINT_COUNT}
      </div>
    </div>
  );
};

export default NftUploader;