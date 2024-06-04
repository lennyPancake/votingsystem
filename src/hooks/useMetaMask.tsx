import React, {
  useState,
  useEffect,
  createContext,
  PropsWithChildren,
  useContext,
  useCallback,
} from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { formatBalance } from "../utils";
import Web3 from "web3";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";

interface WalletState {
  accounts: any[];
  balance: string;
  chainId: string;
}

interface MetaMaskContextData {
  wallet: WalletState;
  hasProvider: boolean | null;
  error: boolean;
  errorMessage: string;
  isSigning: boolean;
  isConnecting: boolean;
  connectMetaMask: () => void;
  clearError: () => void;
}

const disconnectedState: WalletState = {
  accounts: [],
  balance: "",
  chainId: "",
};

const MetaMaskContext = createContext<MetaMaskContextData>(
  {} as MetaMaskContextData
);

const MyVerticallyCenteredModal = (props: any) => {
  return (
    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      data-bs-theme="dark"
      className="nav-link"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Подключение MetaMask
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.isConnecting && <p>Подключение к кошельку MetaMask.</p>}
        {props.isSigning && <p>Пожалуйста, подпишите сообщение ...</p>}
        {props.isSuccess && <p>Успешно подключено.</p>}
        {props.isConnecting && (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide} disabled={!props.isSuccess}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export const MetaMaskContextProvider = ({ children }: PropsWithChildren) => {
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const clearError = () => setErrorMessage("");
  const [wallet, setWallet] = useState(disconnectedState);
  const [modalShow, setModalShow] = useState(false);

  const _updateWallet = useCallback(async (providedAccounts?: any) => {
    const accounts =
      providedAccounts ||
      (await window.ethereum.request({ method: "eth_accounts" }));

    if (accounts.length === 0) {
      setWallet(disconnectedState);
      return;
    }

    const balance = formatBalance(
      await window.ethereum.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      })
    );
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    setWallet({ accounts, balance, chainId });
  }, []);

  const updateWalletAndAccounts = useCallback(
    () => _updateWallet(),
    [_updateWallet]
  );

  const switchToNetwork = async (chainId: string, networkData: any) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [networkData],
          });
        } catch (addError) {
          console.error(
            `Failed to add the network: ${networkData.chainName}`,
            addError
          );
        }
      } else {
        console.error(
          `Failed to switch to the network: ${networkData.chainName}`,
          switchError
        );
      }
    }
  };

  const switchToCorrectNetwork = async () => {
    const sepoliaChainId = "0xaa36a7"; // 11155111 in hexadecimal
    const sepoliaNetworkData = {
      chainId: sepoliaChainId,
      chainName: "Sepolia",
      rpcUrls: ["https://rpc.sepolia.org"],
      nativeCurrency: {
        name: "Sepolia ETH",
        symbol: "ETH",
        decimals: 18,
      },
    };

    await switchToNetwork(sepoliaChainId, sepoliaNetworkData);
  };

  const updateWallet = useCallback(
    (accounts: any) => _updateWallet(accounts),
    [_updateWallet]
  );

  const handleSignMessage = async (selectedAddress: string) => {
    setIsSigning(true);

    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const message = `Confirm authorization in voting system with your wallet: ${selectedAddress}`;

      try {
        const signature = await web3.eth.personal.sign(
          message,
          selectedAddress,
          ""
        );

        const response = await fetch(
          "http://localhost:5000/signature-verification",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message,
              signature,
              walletAddress: selectedAddress,
            }),
          }
        );

        if (response.ok) {
          setIsSuccess(true);
          setIsSigning(false);
        } else {
          throw new Error("Failed to verify signature");
        }
      } catch (error: any) {
        setErrorMessage(error.message);
        setIsSigning(false);
      }
    } else {
      setErrorMessage("MetaMask not detected.");
      setIsSigning(false);
    }
  };

  useEffect(() => {
    setIsConnecting(true);
    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true });
      setHasProvider(Boolean(provider));

      if (provider) {
        updateWalletAndAccounts();
        window.ethereum.on("accountsChanged", updateWallet);
        window.ethereum.on("chainChanged", updateWalletAndAccounts);
      }
    };

    getProvider();
    setIsConnecting(false);
    return () => {
      window.ethereum?.removeListener("accountsChanged", updateWallet);
      window.ethereum?.removeListener("chainChanged", updateWalletAndAccounts);
    };
  }, [updateWallet, updateWalletAndAccounts]);

  const connectMetaMask = async () => {
    setIsConnecting(true);
    setModalShow(true);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      if (currentChainId !== "0xaa36a7") {
        // 11155111 in hexadecimal
        await switchToCorrectNetwork();
      }

      clearError();
      updateWallet(accounts);

      //await handleSignMessage(accounts[0]);
    } catch (err: any) {
      setErrorMessage(err.message);
    }

    setIsConnecting(false);
  };

  return (
    <MetaMaskContext.Provider
      value={{
        wallet,
        hasProvider,
        error: !!errorMessage,
        errorMessage,
        isConnecting,
        isSigning,
        connectMetaMask,
        clearError,
      }}
    >
      {children}

      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        isConnecting={isConnecting}
        isSigning={isSigning}
        isSuccess={isSuccess}
      />
    </MetaMaskContext.Provider>
  );
};

export const quitWallet = async () => {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      });

      alert("Successfully disconnected from DApp.");
    } catch (error) {
      console.error(error);
      alert("Failed to disconnect from DApp.");
    }
  } else {
    alert("MetaMask is not installed or not connected.");
  }
};

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (context === undefined) {
    throw new Error(
      'useMetaMask must be used within a "MetaMaskContextProvider"'
    );
  }
  return context;
};
