import { BrowserProvider } from "ethers";
import { SiweMessage } from "siwe";

const scheme = window.location.protocol.slice(0, -1);
const domain = window.location.host;
const origin = window.location.origin;
const provider = new BrowserProvider(window.ethereum);

const BACKEND_ADDR = "http://localhost:3000";
async function createSiweMessage(address, statement) {
  const res = await fetch(`${BACKEND_ADDR}/auth/request-nonce`, {
    credentials: "include",
  });
  const resBody = await res.json();
  console.log(resBody);
  const nonce = resBody.nonce;
  const message = new SiweMessage({
    scheme,
    domain,
    address,
    statement,
    uri: origin,
    version: "1",
    chainId: "1",
    nonce: nonce,
  });
  return message.prepareMessage();
}

function connectWallet() {
  provider
    .send("eth_requestAccounts", [])
    .catch(() => console.log("user rejected request"));
}

async function signInWithEthereum() {
  const signer = await provider.getSigner();
  const walletAddress = await signer.getAddress();
  const message = await createSiweMessage(
    await signer.getAddress(),
    "Sign in with Ethereum to the app.",
  );

  const signature = await signer.signMessage(message);

  const res = await fetch(`${BACKEND_ADDR}/auth/verify-signature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walletAddress, message, signature }),
    credentials: "include",
  });
  console.log(await res.text());
}

async function getInformation() {
  const res = await fetch(`${BACKEND_ADDR}/personal_information`, {
    credentials: "include",
  });
  console.log(await res.text());
}

const connectWalletBtn = document.getElementById("connectWalletBtn");
const siweBtn = document.getElementById("siweBtn");
const infoBtn = document.getElementById("infoBtn");
connectWalletBtn.onclick = connectWallet;
siweBtn.onclick = signInWithEthereum;
infoBtn.onclick = getInformation;
